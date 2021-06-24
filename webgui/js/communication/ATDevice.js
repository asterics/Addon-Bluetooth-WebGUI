let ATDevice = {};

let _slots = [];
let _currentSlot = null;
let _slotChangeHandler = null;
let _SLOT_CONSTANT = 'Slot:';
let _valueHandler = null;
let _liveValueLastUpdate = 0;

let _communicator;
let _isInitialized = false;
let _inRawMode = false;

let _atCmdQueue = [];
let _sendingAtCmds = false;
let _timestampLastAtCmd = new Date().getTime();

let _connectionTestIntervalHandler = null;
let _connectionTestCallbacks = [];
let _connected = true;
let _AT_CMD_BUSY_RESPONSE = 'BUSY';

let _autoSaveTimeout = 10000;
let _dontGetLiveValues = false;

/**
 * initializes the instance of the device
 * @param dontGetLiveValues if true, live values are not requested by default
 * @return {Promise<* | void>} promise resolving with config of the current slot
 */
ATDevice.init = function (dontGetLiveValues) {
    _dontGetLiveValues = dontGetLiveValues;
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
        return ATDevice.refreshConfig();
    }).then(() => {
        if (!_dontGetLiveValues) {
            ATDevice.sendATCmd(C.AT_CMD_START_REPORTING_LIVE);
            _communicator.setValueHandler((data) => {
                _liveValueLastUpdate = new Date().getTime();
                if (_valueHandler) {
                    _valueHandler(data);
                }
            });
        }
        startTestingConnection();
        return Promise.resolve();
    }).catch((error) => {
        console.warn(error);
        return Promise.reject();
    });
}

ATDevice.isInitialized = function () {
    return _isInitialized;
}

ATDevice.getVersion = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_VERSION).then(result => {
        return Promise.resolve(L.formatVersion(result));
    });
}

ATDevice.getBTVersion = function () {
    ATDevice.sendATCmd(C.AT_CMD_STOP_REPORTING_LIVE);
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_ADDON_COMMAND, '$ID').then(result => {
        result = result || '';
        result = result.toUpperCase().replace('P32', ''); //remove ESP32 in order to prevent wrong version number parsing
        return Promise.resolve(result.trim() ? L.formatVersion(result) : '');
    }).finally(() => {
        if (!_dontGetLiveValues) ATDevice.sendATCmd(C.AT_CMD_START_REPORTING_LIVE);
    });
}

/**
 * Sends the given AT command to the device. If sending of the last command is not completed yet, the given AT command
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
    if (_inRawMode) {
        log.warn('not sending AT command because in raw mode.');
        return Promise.reject();
    }
    if ((onlyIfNotBusy && _atCmdQueue.length > 0)) {
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
window.sendATCmd = function (cmd) {
    window.logReceived = true;
    ATDevice.sendATCmd(cmd);
}

/**
 * Sends the given AT command to the device and waits for a response, details @see sendATCmd()
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

ATDevice.upgradeBTAddon = async function (firmwareArrayBuffer, progressCallback) {
    if (!_communicator.sendRawData) {
        log.warn('upgrade not supported by communicator!')
        return;
    }
    stopTestingConnection();
    ATDevice.sendATCmd(C.AT_CMD_STOP_REPORTING_LIVE);
    ATDevice.sendATCmd(C.AT_CMD_UPGRADE_ADDON);
    _inRawMode = true;
    return _communicator.waitForReceiving('OTA:ready', 15000).then(() => {
        log.info('starting sending raw data');
        return _communicator.sendRawData(firmwareArrayBuffer, progressCallback);
    }).then(() => {
        return _communicator.waitForReceiving('OTA:$FIN', 15000);
    }).then(() => {
        log.info('bluetooth upgrade successful!');
        return Promise.resolve();
    }).catch((error) => {
        log.warn('BT addon update failed because: ' + error);
        return Promise.reject();
    }).finally(() => {
        _inRawMode = false;
        if (!_dontGetLiveValues) ATDevice.sendATCmd(C.AT_CMD_START_REPORTING_LIVE);
        startTestingConnection();
    });
}

ATDevice.addConnectionTestHandler = function (fn) {
    _connectionTestCallbacks.push(fn);
    _connectionTestCallbacks.forEach(fn => fn(_connected));
}

ATDevice.setSlotChangeHandler = function (fn) {
    _slotChangeHandler = fn;
}

ATDevice.setLiveValueHandler = function (handler) {
    _valueHandler = handler;
};


ATDevice.getConfig = function (constant, slotName) {
    let slotConfig = ATDevice.getSlotConfig(slotName || _currentSlot);
    if (slotConfig[constant] !== undefined) {
        let value = slotConfig[constant] + '';
        let intValue = parseInt(value);
        return intValue + '' === value.trim() ? intValue : value;
    }
    return null;
};

ATDevice.setConfig = function (atCmd, value, debounceTimeout) {
    if (debounceTimeout === undefined) {
        debounceTimeout = 300;
    }
    setConfigInternal(atCmd, value);
    L.debounce(function () {
        ATDevice.sendATCmd(atCmd, value);
    }, debounceTimeout, atCmd);
    ATDevice.planSaving();
};

ATDevice.refreshConfig = function () {
    return new Promise(function (resolve, reject) {
        ATDevice.sendATCmd(C.AT_CMD_STOP_REPORTING_LIVE);
        ATDevice.sendAtCmdWithResult(C.AT_CMD_LOAD_ALL).then(function (response) {
            _slots = ATDevice.parseConfig(response);
            _currentSlot = _currentSlot || _slots[0].name;
            resolve();
        }, function () {
            console.log("could not get config!");
            reject();
        }).finally(() => {
            if (!_dontGetLiveValues) ATDevice.sendATCmd(C.AT_CMD_START_REPORTING_LIVE);
        });
    });
};

ATDevice.getButtonAction = function (buttonModeIndex, slot) {
    buttonModeIndex = parseInt(buttonModeIndex);
    return ATDevice.getConfig(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, slot);
}

ATDevice.setButtonAction = function (buttonModeIndex, atCmd) {
    if (buttonModeIndex === undefined || !atCmd) {
        return;
    }
    buttonModeIndex = parseInt(buttonModeIndex);
    setConfigInternal(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, atCmd);
    ATDevice.sendATCmd(C.AT_CMD_BTN_MODE, buttonModeIndex);
    ATDevice.sendATCmd(atCmd);
    ATDevice.save();
};

ATDevice.getButtonActionATCmd = function (index, slot) {
    let action = ATDevice.getButtonAction(index, slot);
    return action ? action.substring(0, C.LENGTH_ATCMD_PREFIX).trim() : null;
}

ATDevice.getButtonActionATCmdSuffix = function (index, slot) {
    let action = ATDevice.getButtonAction(index, slot);
    return action ? action.substring(C.LENGTH_ATCMD_PREFIX).trim() : null;
}

ATDevice.save = async function () {
    ATDevice.abortAutoSaving();
    ATDevice.sendATCmd('AT SA', _currentSlot);
    return Promise.resolve();
};

ATDevice.planSaving = function () {
    L.debounce(() => {
        ATDevice.save();
    }, _autoSaveTimeout, 'ATDEVICE_SAVE');
}

ATDevice.abortAutoSaving = function () {
    L.clearDebounce('ATDEVICE_SAVE');
}

ATDevice.getSlots = function () {
    return _slots.map(slotObject => slotObject.name);
};

ATDevice.getAllSlotObjects = function () {
    return JSON.parse(JSON.stringify(_slots));
}

ATDevice.getSlotConfig = function (slotName) {
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

ATDevice.getSlotConfigText = function (slotName) {
    let config = ATDevice.getSlotConfig(slotName);
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

ATDevice.setSlot = function (slot, dontSendToDevice) {
    if (slot === _currentSlot) {
        return;
    }
    if (ATDevice.getSlots().includes(slot)) {
        if (!dontSendToDevice) {
            ATDevice.save();
            ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, slot);
        }
        _currentSlot = slot;
    }
    if (_slotChangeHandler) {
        _slotChangeHandler();
    }
};

ATDevice.createSlot = function (slotName) {
    if (!slotName || ATDevice.getSlots().includes(slotName)) {
        console.warn('slot not saved because no slot name or slot already existing!');
    }
    ATDevice.save();
    let slotConfig = ATDevice.getSlotConfig(_currentSlot);
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

ATDevice.uploadSlots = async function (slotObjects) {
    ATDevice.save();
    let slotObject = null;
    for (let i = 0; i < slotObjects.length; i++) {
        slotObject = slotObjects[i];
        Object.keys(slotObject.config).forEach(function (key) {
            if (key.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                ATDevice.sendATCmd(key);
                ATDevice.sendATCmd(slotObject.config[key]);
            } else {
                ATDevice.sendATCmd(key, slotObject.config[key]);
            }
        });
        await ATDevice.sendAtCmdWithResult(C.AT_CMD_SAVE_SLOT, slotObject.name);
        _slots.push(slotObject);
    }
    if (slotObject) {
        ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, slotObject.name);
        _currentSlot = slotObject.name;
        if (_slotChangeHandler) {
            _slotChangeHandler();
        }
    }
}

ATDevice.restoreDefaultConfiguration = function () {
    ATDevice.sendATCmd(C.AT_CMD_RESET_DEVICE);
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

ATDevice.parseConfig = function(atCmdsString) {
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

function setConfigInternal(constant, value, slotName) {
    let slotConfig = ATDevice.getSlotConfig(slotName || _currentSlot);
    if (slotConfig) {
        slotConfig[constant] = value;
    }
}

function startTestingConnection() {
    if (_connectionTestIntervalHandler) {
        return;
    }

    function doTest() {
        _connected = !_liveValueLastUpdate || new Date().getTime() - _liveValueLastUpdate < 1000;
        _connectionTestCallbacks.forEach(fn => fn(_connected));
    }

    doTest();
    _connectionTestIntervalHandler = setInterval(doTest, 500);
}

function stopTestingConnection() {
    clearInterval(_connectionTestIntervalHandler);
}



window.addEventListener('beforeunload', () => {
    if (ATDevice.isInitialized()) {
        log.info('saving config before closing...');
        ATDevice.save();
        ATDevice.sendATCmd(C.AT_CMD_STOP_REPORTING_LIVE);
    }
});

export {ATDevice};