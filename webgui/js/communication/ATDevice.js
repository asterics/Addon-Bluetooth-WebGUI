let ATDevice = {};

ATDevice.LIVE_PRESSURE = 'LIVE_PRESSURE';
ATDevice.LIVE_UP = 'LIVE_UP';
ATDevice.LIVE_DOWN = 'LIVE_DOWN';
ATDevice.LIVE_LEFT = 'LIVE_LEFT';
ATDevice.LIVE_RIGHT = 'LIVE_RIGHT';
ATDevice.LIVE_MOV_X = 'LIVE_MOV_X';
ATDevice.LIVE_MOV_Y = 'LIVE_MOV_Y';
ATDevice.LIVE_MOV_X_MIN = 'LIVE_MOV_X_MIN';
ATDevice.LIVE_MOV_X_MAX = 'LIVE_MOV_X_MAX';
ATDevice.LIVE_MOV_Y_MIN = 'LIVE_MOV_Y_MIN';
ATDevice.LIVE_MOV_Y_MAX = 'LIVE_MOV_Y_MAX';
ATDevice.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
ATDevice.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
ATDevice.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';
ATDevice.LIVE_BUTTONS = 'LIVE_BUTTONS';
ATDevice.inRawMode = false;

let _slots = [];
let _liveData = {};

let debouncers = {};
let _valueHandler = null;
let _liveValueIntervall = null;
let _liveValueLastParse = 0;
let _slotChangeHandler = null;
let _currentSlot = null;
let _SLOT_CONSTANT = 'Slot:';

let _communicator;
let _isInitialized = false;

let _atCmdQueue = [];
let _sendingAtCmds = false;
let _timestampLastAtCmd = new Date().getTime();

let _connectionTestIntervalHandler = null;
let _connectionTestCallbacks = [];
let _connected = true;
let _AT_CMD_BUSY_RESPONSE = 'BUSY';
let _AT_CMD_OK_RESPONSE = 'OK';

/**
 * initializes the FLipMouse instance
 * @param dontGetLiveValues if true, live values are not requested by default
 * @return {Promise<* | void>} promise resolving with config of the current slot
 */
ATDevice.init = function (dontGetLiveValues) {
    let promise = Promise.resolve().then(() => {
        if (C.GUI_IS_MOCKED_VERSION) {
            _communicator = new MockCommunicator();
            return Promise.resolve();
        } else if (C.GUI_IS_HOSTED) {
            _communicator = new SerialCommunicator();
            return _communicator.init();
        } else if (C.GUI_IS_ON_DEVICE) {
            return ws.initWebsocket(C.FLIP_WEBSOCKET_URL).then(function (socket) {
                _communicator = new WsCommunicator(C.FLIP_WEBSOCKET_URL, socket);
                return Promise.resolve();
            });
        }
    });

    return promise.then(function () {
        _isInitialized = true;
        ATDevice.resetMinMaxLiveValues();
        return ATDevice.refreshConfig();
    }).then(() => {
        if (!dontGetLiveValues) {
            ATDevice.sendATCmd('AT SR');
            _communicator.setValueHandler(parseLiveValues);
        }
        ATDevice.startTestingConnection();
        return Promise.resolve();
    }).catch((error) => {
        console.warn(error);
    });
}

/**
 * Sends the given AT command to the FLipMouse. If sending of the last command is not completed yet, the given AT command
 * is added to a queue and will be sent later.
 * The order of sending the commands is always equal to the order of calls to this function.
 *
 * @param atCmd the AT command to send
 * @param param an optional parameter that is appended to the AT command
 * @param timeout maximum time after the returned promise resolves, regardless if data was received or not. Default 0ms.
 * @param onlyIfNotBusy if set to true, the command is sent only if no other AT command is currently waiting for a response
 * @param dontLog if set to true, there are no logs to console for this command

 * @return {Promise} which resolves to the result of the command or '' if no result was received.
 */
ATDevice.sendATCmd = function (atCmd, param, timeout, onlyIfNotBusy, dontLog) {
    if (!ATDevice.isInitialized()) {
        return Promise.reject('cannot send AT command if not initialized.');
    }
    if ((onlyIfNotBusy && _atCmdQueue.length > 0) || ATDevice.inRawMode) {
        if (!dontLog) console.log('did not send cmd: "' + atCmd + "' because another command is executing.");
        return Promise.resolve(_AT_CMD_BUSY_RESPONSE);
    }
    if (_atCmdQueue.length > 0) {
        if (!dontLog) console.log("adding cmd to queue: " + atCmd);
    }
    let queueElem = null;
    let cmd = param !== undefined ? atCmd + ' ' + param : atCmd;
    let promise = new Promise(function (resolve, reject) {
        queueElem = {
            timeout: timeout || 0,
            dontLog: dontLog,
            cmd: cmd.trim(),
            resolveFn: resolve,
            rejectFn: reject
        };
    });
    queueElem.promise = promise;
    _atCmdQueue.push(queueElem);

    if (!_sendingAtCmds) {
        sendNext();
    }

    function sendNext() {
        _sendingAtCmds = true;
        if (_atCmdQueue.length === 0) {
            _sendingAtCmds = false;
            return;
        }
        let nextQueueElem = _atCmdQueue.shift();
        let waitTimeMs = C.GUI_IS_HOSTED ? 25 : 20;
        let timeoutSend = Math.max(0, waitTimeMs - (new Date().getTime() - _timestampLastAtCmd));
        setTimeout(function () {
            if (!nextQueueElem.dontLog) console.log("sending to device: " + nextQueueElem.cmd);
            _timestampLastAtCmd = new Date().getTime();
            _communicator.sendData(nextQueueElem.cmd, nextQueueElem.timeout, nextQueueElem.dontLog).then(nextQueueElem.resolveFn, nextQueueElem.rejectFn);
            nextQueueElem.promise.finally(() => {
                sendNext();
            });
        }, timeoutSend);
    }

    return promise;
};

/**
 * Sends the given AT command to the FLipMouse and waits for a response, details @see sendATCmd()
 *
 * @param atCmd
 * @param param
 * @param timeout the timeout to wait for a response, default: 3000ms
 * @param onlyIfNotBusy
 * @param dontLog
 * @return {Promise}
 */
ATDevice.sendAtCmdWithResult = function (atCmd, param, timeout, onlyIfNotBusy, dontLog) {
    timeout = timeout || 3000;
    let promise = ATDevice.sendATCmd(atCmd, param, timeout, onlyIfNotBusy, dontLog);
    return promise;
}

ATDevice.sendRawData = function (data, timeout) {
    return _communicator.sendRawData(data, timeout);
};

ATDevice.startTestingConnection = function () {
    if (_connectionTestIntervalHandler) {
        return;
    }

    function doTest() {
        _connected = !_liveValueLastParse || new Date().getTime() - _liveValueLastParse < 1000;
        _connectionTestCallbacks.forEach(fn => fn(_connected));
    }

    doTest();
    _connectionTestIntervalHandler = setInterval(doTest, 500);
}

ATDevice.addConnectionTestCallback = function (fn) {
    _connectionTestCallbacks.push(fn);
    _connectionTestCallbacks.forEach(fn => fn(_connected));
}

ATDevice.isInitialized = function () {
    return _isInitialized;
}

ATDevice.setValue = function (atCmd, value, debounceTimeout) {
    if (!debounceTimeout) {
        debounceTimeout = 300;
    }
    ATDevice.setConfig(atCmd, parseInt(value));
    clearInterval(debouncers[atCmd]);
    debouncers[atCmd] = setTimeout(function () {
        ATDevice.sendATCmd(atCmd, value);
    }, debounceTimeout);
};

ATDevice.refreshConfig = function () {
    return new Promise(function (resolve, reject) {
        ATDevice.sendAtCmdWithResult('AT LA').then(function (response) {
            _slots = parseConfig(response);
            _currentSlot = _currentSlot || _slots[0].name;
            resolve();
        }, function () {
            console.log("could not get config!");
            reject();
        });
    });
};

/**
 * saves the complete current configuration (all slots) to the FLipMouse
 *
 * @return {Promise}
 */
ATDevice.save = async function () {
    ATDevice.sendATCmd('AT SA', _currentSlot);
    return Promise.resolve();
};

ATDevice.setSlotChangeHandler = function (fn) {
    _slotChangeHandler = fn;
}

ATDevice.startLiveValueListener = function (handler) {
    _valueHandler = handler;
};

ATDevice.stopLiveValueListener = function () {
    _valueHandler = null;
};

ATDevice.getConfig = function (constant, slotName) {
    let slotConfig = ATDevice.getSlotConfigs(slotName || _currentSlot);
    if (slotConfig[constant]) {
        let value = slotConfig[constant] + '';
        let intValue = parseInt(value);
        return intValue + '' === value.trim() ? intValue : value;
    }
    return null;
};

ATDevice.getButtonActionATCmd = function (index, slot) {
    let action = ATDevice.getButtonAction(index, slot);
    return action ? action.substring(0, C.LENGTH_ATCMD_PREFIX).trim() : null;
}

ATDevice.getButtonActionATCmdSuffix = function (index, slot) {
    let action = ATDevice.getButtonAction(index, slot);
    return action ? action.substring(C.LENGTH_ATCMD_PREFIX).trim() : null;
}

ATDevice.setConfig = function (constant, value, slotName) {
    let slotConfig = ATDevice.getSlotConfigs(slotName || _currentSlot);
    if (slotConfig) {
        slotConfig[constant] = value;
    }
};

ATDevice.getSlots = function () {
    return _slots.map(slotObject => slotObject.name);
};

ATDevice.getAllSlotObjects = function () {
    return JSON.parse(JSON.stringify(_slots));
}

ATDevice.getSlotConfigs = function (slotName) {
    let object = _slots.filter(slot => slot.name === slotName)[0];
    return object && object.config ? object.config : {};
}

ATDevice.getSlotName = function (id) {
    id = id || 0;
    return _slots[id] ? _slots[id].name : '';
}

ATDevice.getCurrentSlot = function () {
    return _currentSlot;
};

ATDevice.setSlot = function (slot) {
    if (ATDevice.getSlots().includes(slot)) {
        _currentSlot = slot;
        ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, slot);
    }
    if (_slotChangeHandler) {
        _slotChangeHandler();
    }
};

ATDevice.createSlot = function (slotName) {
    if (!slotName || ATDevice.getSlots().includes(slotName)) {
        console.warn('slot not saved because no slot name or slot already existing!');
    }
    let slotConfig = ATDevice.getSlotConfigs(_currentSlot);
    _slots.push({
        name: slotName,
        config: L.deepCopy(slotConfig)
    });
    ATDevice.sendATCmd(C.AT_CMD_SAVE_SLOT, slotName);
    ATDevice.setSlot(slotName);
    if (_slotChangeHandler) {
        _slotChangeHandler();
    }
    return Promise.resolve();
};

ATDevice.deleteSlot = function (slotName) {
    if (!slotName || !ATDevice.getSlots().includes(slotName)) {
        console.warn('slot not deleted because no slot name or slot not existing!');
    }
    _slots = _slots.filter(slotObject => slotObject.name !== slotName);
    ATDevice.sendATCmd(C.AT_CMD_DELETE_SLOT, slotName);
    if (slotName === _currentSlot) {
        _currentSlot = ATDevice.getSlots()[0];
        if (_currentSlot) {
            ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, _currentSlot);
        }
    }
    if (_slotChangeHandler) {
        _slotChangeHandler();
    }
    return Promise.resolve();
};

ATDevice.getLiveData = function (constant) {
    if (constant) {
        return _liveData[constant];
    }
    return _liveData;
};

ATDevice.resetMinMaxLiveValues = function () {
    _liveData[ATDevice.LIVE_PRESSURE_MIN] = 1024;
    _liveData[ATDevice.LIVE_MOV_X_MIN] = 1024;
    _liveData[ATDevice.LIVE_MOV_Y_MIN] = 1024;
    _liveData[ATDevice.LIVE_PRESSURE_MAX] = -1;
    _liveData[ATDevice.LIVE_MOV_X_MAX] = -1;
    _liveData[ATDevice.LIVE_MOV_Y_MAX] = -1;
};

ATDevice.setButtonAction = function (buttonModeIndex, atCmd) {
    if (buttonModeIndex === undefined || !atCmd) {
        return;
    }
    buttonModeIndex = parseInt(buttonModeIndex);
    ATDevice.setConfig(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, atCmd);
    ATDevice.sendATCmd(C.AT_CMD_BTN_MODE, buttonModeIndex);
    ATDevice.sendATCmd(atCmd);
};

ATDevice.getButtonAction = function (buttonModeIndex, slot) {
    buttonModeIndex = parseInt(buttonModeIndex);
    return ATDevice.getConfig(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, slot);
}

ATDevice.restoreDefaultConfiguration = function () {
    ATDevice.sendATCmd('AT RS');
    _currentSlot = null;
    _slots = [];
    let promise = ATDevice.refreshConfig();
    promise.then(() => {
        if (_slotChangeHandler) {
            _slotChangeHandler();
        }
    })
    return promise;
};

ATDevice.setDeviceMode = function (modeNr, slot) {
    let originalSlot = _currentSlot;
    if (slot !== _currentSlot) {
        ATDevice.save();
        ATDevice.setSlot(slot);
    }
    ATDevice.sendATCmd(C.AT_CMD_DEVICE_MODE, modeNr);
    ATDevice.save();
    if (originalSlot !== _currentSlot) {
        ATDevice.setSlot(originalSlot);
    }
}

ATDevice.getVersion = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_VERSION).then(result => {
        return Promise.resolve(L.formatVersion(result));
    });
}

ATDevice.getBTVersion = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_BT_COMMAND, '$ID', 1000).then(result => {
        result = result || '';
        return Promise.resolve(result.trim() ? L.formatVersion(result) : '');
    });
}

function parseLiveValues(data) {
    if (!data) {
        console.log('error parsing live data: ' + data);
        return;
    }
    _liveValueIntervall = _valueHandler ? null : 300;

    if (!_liveValueIntervall || new Date().getTime() - _liveValueLastParse > _liveValueIntervall) {
        _liveValueLastParse = new Date().getTime();
        var valArray = data.split(':')[1].split(',');
        _liveData[ATDevice.LIVE_PRESSURE] = parseInt(valArray[0]);
        _liveData[ATDevice.LIVE_UP] = parseInt(valArray[1]);
        _liveData[ATDevice.LIVE_DOWN] = parseInt(valArray[2]);
        _liveData[ATDevice.LIVE_LEFT] = parseInt(valArray[3]);
        _liveData[ATDevice.LIVE_RIGHT] = parseInt(valArray[4]);
        _liveData[ATDevice.LIVE_MOV_X] = parseInt(valArray[5]);
        _liveData[ATDevice.LIVE_MOV_Y] = parseInt(valArray[6]);
        if (valArray[7]) {
            _liveData[ATDevice.LIVE_BUTTONS] = valArray[7].split('').map(v => v === "1");
        }
        if (valArray[8]) {
            let slot = ATDevice.getSlotName(parseInt(valArray[8]));
            if (slot && slot !== _currentSlot) {
                _currentSlot = slot;
                if (_slotChangeHandler) {
                    _slotChangeHandler();
                }
            }
        }
        _liveData[ATDevice.LIVE_PRESSURE_MIN] = Math.min(_liveData[ATDevice.LIVE_PRESSURE_MIN], _liveData[ATDevice.LIVE_PRESSURE]);
        _liveData[ATDevice.LIVE_MOV_X_MIN] = Math.min(_liveData[ATDevice.LIVE_MOV_X_MIN], _liveData[ATDevice.LIVE_MOV_X]);
        _liveData[ATDevice.LIVE_MOV_Y_MIN] = Math.min(_liveData[ATDevice.LIVE_MOV_Y_MIN], _liveData[ATDevice.LIVE_MOV_Y]);
        _liveData[ATDevice.LIVE_PRESSURE_MAX] = Math.max(_liveData[ATDevice.LIVE_PRESSURE_MAX], _liveData[ATDevice.LIVE_PRESSURE]);
        _liveData[ATDevice.LIVE_MOV_X_MAX] = Math.max(_liveData[ATDevice.LIVE_MOV_X_MAX], _liveData[ATDevice.LIVE_MOV_X]);
        _liveData[ATDevice.LIVE_MOV_Y_MAX] = Math.max(_liveData[ATDevice.LIVE_MOV_Y_MAX], _liveData[ATDevice.LIVE_MOV_Y]);

        if (L.isFunction(_valueHandler)) {
            _valueHandler(_liveData);
        }
    }
}

function parseConfig(atCmdsString) {
    atCmdsString = atCmdsString.replace(/\n\s*\n/g, '\n'); //replace doubled linebreaks with single one
    let elements = atCmdsString.split('\n');
    let parsedSlots = [];
    let currentParsedSlot = null;
    for (let i = 0; i < elements.length; i++) {
        let currentElement = elements[i];
        let nextElement = elements[i + 1] || '';
        if (currentElement.indexOf(_SLOT_CONSTANT) > -1) {
            let slotName = currentElement.substring(_SLOT_CONSTANT.length).trim();
            currentParsedSlot = {
                name: slotName,
                config: {}
            };
            parsedSlots.push(currentParsedSlot);
        } else {
            let currentAtCmd = currentElement.substring(0, C.LENGTH_ATCMD_PREFIX - 1).trim();
            if (currentAtCmd.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                let buttonModeIndex = parseInt(currentElement.substring(C.LENGTH_ATCMD_PREFIX - 1));
                currentParsedSlot.config[C.AT_CMD_BTN_MODE + ' ' + buttonModeIndex] = nextElement.trim();
            } else if (C.AT_CMDS_SETTINGS.indexOf(currentAtCmd) > -1) {
                currentParsedSlot.config[currentAtCmd] = currentElement.substring(C.LENGTH_ATCMD_PREFIX - 1).trim();
            }
        }
    }
    return parsedSlots;
}

ATDevice.getSlotConfigText = function (slotName) {
    let config = ATDevice.getSlotConfigs(slotName);
    let ret = "Slot:" + slotName + "\n";

    Object.keys(config).forEach(function (key) {
        if (key.indexOf(C.AT_CMD_BTN_MODE) > -1) {
            ret = ret + key + '\n' + config[key] + "\n";
        } else {
            ret = ret + key + ' ' + config[key] + "\n";
        }
    });

    return ret;
}

export {ATDevice};
