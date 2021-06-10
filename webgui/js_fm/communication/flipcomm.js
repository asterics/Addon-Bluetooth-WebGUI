function FlipMouse() {
    let thiz = this;

    thiz.LIVE_PRESSURE = 'LIVE_PRESSURE';
    thiz.LIVE_UP = 'LIVE_UP';
    thiz.LIVE_DOWN = 'LIVE_DOWN';
    thiz.LIVE_LEFT = 'LIVE_LEFT';
    thiz.LIVE_RIGHT = 'LIVE_RIGHT';
    thiz.LIVE_MOV_X = 'LIVE_MOV_X';
    thiz.LIVE_MOV_Y = 'LIVE_MOV_Y';
    thiz.LIVE_MOV_X_MIN = 'LIVE_MOV_X_MIN';
    thiz.LIVE_MOV_X_MAX = 'LIVE_MOV_X_MAX';
    thiz.LIVE_MOV_Y_MIN = 'LIVE_MOV_Y_MIN';
    thiz.LIVE_MOV_Y_MAX = 'LIVE_MOV_Y_MAX';
    thiz.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
    thiz.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
    thiz.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';
    thiz.LIVE_BUTTONS = 'LIVE_BUTTONS';
    
    thiz.inRawMode = false;

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

    let _AT_CMD_MIN_WAITTIME_MS = C.GUI_IS_HOSTED ? 25 : 20;
    let _atCmdQueue = [];
    let _sendingAtCmds = false;
    let _timestampLastAtCmd = new Date().getTime();

    let _connectionTestIntervalHandler = null;
    let _connectionTestCallbacks = [];
    let _connected = true;
    let _AT_CMD_IR_TIMEOUT_RESPONSE = 'IR_TIMEOUT';
    let _AT_CMD_BUSY_RESPONSE = 'BUSY';
    let _AT_CMD_OK_RESPONSE = 'OK';

    /**
     * initializes the FLipMouse instance
     * @param dontGetLiveValues if true, live values are not requested by default
     * @return {Promise<* | void>} promise resolving with config of the current slot
     */
    thiz.init = function (dontGetLiveValues) {
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
            thiz.resetMinMaxLiveValues();
            return thiz.refreshConfig();
        }).then((config) => {
            if (!dontGetLiveValues) {
                thiz.sendATCmd('AT SR');
                _communicator.setValueHandler(parseLiveValues);
            }
            thiz.startTestingConnection();
            return Promise.resolve();
        }).catch((error) => {
            console.warn(error);
        });
    }

    /**
     * Sends the given AT command to the FLipMouse. If sending of the last command is not completed yet, the given AT command
     * is added to a queue and will be sent later. The time between two sent commands is at least _AT_CMD_MIN_WAITTIME_MS.
     * The order of sending the commands is always equal to the order of calls to this function.
     *
     * @param atCmd the AT command to send
     * @param param an optional parameter that is appended to the AT command
     * @param timeout maximum time after the returned promise resolves, regardless if data was received or not. Default 0ms.
     * @param onlyIfNotBusy if set to true, the command is sent only if no other AT command is currently waiting for a response
     * @param dontLog if set to true, there are no logs to console for this command

     * @return {Promise} which resolves to the result of the command or '' if no result was received.
     */
    thiz.sendATCmd = function (atCmd, param, timeout, onlyIfNotBusy, dontLog) {
        if (!thiz.isInitialized()) {
            return Promise.reject('cannot send AT command if not initialized.');
        }
        if ((onlyIfNotBusy && _atCmdQueue.length > 0) || thiz.inRawMode) {
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
            let timeoutSend = Math.max(0, _AT_CMD_MIN_WAITTIME_MS - (new Date().getTime() - _timestampLastAtCmd));
            setTimeout(function () {
                if (!nextQueueElem.dontLog) console.log("sending to FlipMouse: " + nextQueueElem.cmd);
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
    thiz.sendAtCmdWithResult = function(atCmd, param, timeout, onlyIfNotBusy, dontLog) {
        timeout = timeout || 3000;
        let promise = thiz.sendATCmd(atCmd, param, timeout, onlyIfNotBusy, dontLog);
        return promise;
    }

    thiz.sendRawData = function(data, timeout) {
        return _communicator.sendRawData(data, timeout);
    };

    thiz.startTestingConnection = function () {
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

    thiz.addConnectionTestCallback = function (fn) {
        _connectionTestCallbacks.push(fn);
        _connectionTestCallbacks.forEach(fn => fn(_connected));
    }

    thiz.isInitialized = function () {
        return _isInitialized;
    }

    thiz.setValue = function (atCmd, value, debounceTimeout) {
        if (!debounceTimeout) {
            debounceTimeout = 300;
        }
        thiz.setConfig(atCmd, parseInt(value));
        clearInterval(debouncers[atCmd]);
        debouncers[atCmd] = setTimeout(function () {
            thiz.sendATCmd(atCmd, value);
        }, debounceTimeout);
    };

    thiz.refreshConfig = function () {
        return new Promise(function(resolve, reject) {
            thiz.sendAtCmdWithResult('AT LA').then(function (response) {
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
    thiz.save = async function () {
        thiz.sendATCmd('AT SA', _currentSlot);
        return Promise.resolve();
    };

    thiz.calibrate = function () {
        thiz.sendATCmd('AT CA');
        return testConnection();
    };

    thiz.rotate = function () {
        var currentOrientation = thiz.getConfig(C.AT_CMD_ORIENTATION_ANGLE);
        thiz.setValue(C.AT_CMD_ORIENTATION_ANGLE, (currentOrientation + 90) % 360, 0);
        thiz.sendATCmd('AT CA');
        return testConnection();
    };

    thiz.setSlotChangeHandler = function (fn) {
        _slotChangeHandler = fn;
    }

    thiz.startLiveValueListener = function (handler) {
        _valueHandler = handler;
    };

    thiz.stopLiveValueListener = function () {
        _valueHandler = null;
    };

    thiz.getConfig = function (constant, slotName) {
        let slotConfig = thiz.getSlotConfigs(slotName || _currentSlot);
        if (slotConfig[constant]) {
            let value = slotConfig[constant] + '';
            let intValue = parseInt(value);
            return intValue + '' === value.trim() ? intValue : value;
        }
        return null;
    };

    thiz.getButtonActionATCmd = function (index, slot) {
        let action = thiz.getButtonAction(index, slot);
        return action ? action.substring(0, C.LENGTH_ATCMD_PREFIX).trim() : null;
    }

    thiz.getButtonActionATCmdSuffix = function (index, slot) {
        let action = thiz.getButtonAction(index, slot);
        return action ? action.substring(C.LENGTH_ATCMD_PREFIX).trim() : null;
    }

    thiz.setConfig = function (constant, value, slotName) {
        let slotConfig = thiz.getSlotConfigs(slotName || _currentSlot);
        if (slotConfig) {
            slotConfig[constant] = value;
        }
    };

    thiz.getSlots = function () {
        return _slots.map(slotObject => slotObject.name);
    };

    thiz.getAllSlotObjects = function () {
        return JSON.parse(JSON.stringify(_slots));
    }

    thiz.getSlotConfigs = function (slotName) {
        let object = _slots.filter(slot => slot.name === slotName)[0];
        return object && object.config ? object.config : {};
    }

    thiz.getSlotName = function (id) {
        id = id || 0;
        return _slots[id] ? _slots[id].name : '';
    }

    thiz.getCurrentSlot = function () {
        return _currentSlot;
    };

    thiz.setSlot = function (slot) {
        if (thiz.getSlots().includes(slot)) {
            _currentSlot = slot;
            thiz.sendATCmd(C.AT_CMD_LOAD_SLOT, slot);
        }
        if (_slotChangeHandler) {
            _slotChangeHandler();
        }
    };

    thiz.createSlot = function (slotName) {
        if (!slotName || thiz.getSlots().includes(slotName)) {
            console.warn('slot not saved because no slot name or slot already existing!');
        }
        let slotConfig = thiz.getSlotConfigs(_currentSlot);
        _slots.push({
            name: slotName,
            config: L.deepCopy(slotConfig)
        });
        thiz.sendATCmd(C.AT_CMD_SAVE_SLOT, slotName);
        thiz.setSlot(slotName);
        if (_slotChangeHandler) {
            _slotChangeHandler();
        }
        return testConnection();
    };

    thiz.deleteSlot = function (slotName) {
        if (!slotName || !thiz.getSlots().includes(slotName)) {
            console.warn('slot not deleted because no slot name or slot not existing!');
        }
        _slots = _slots.filter(slotObject => slotObject.name !== slotName);
        thiz.sendATCmd(C.AT_CMD_DELETE_SLOT, slotName);
        if (slotName === _currentSlot) {
            _currentSlot = thiz.getSlots()[0];
            if (_currentSlot) {
                thiz.sendATCmd(C.AT_CMD_LOAD_SLOT, _currentSlot);
            }
        }
        if (_slotChangeHandler) {
            _slotChangeHandler();
        }
        return Promise.resolve();
    };

    thiz.getIRCommands = function () {
        return thiz.sendAtCmdWithResult(C.AT_CMD_IR_LIST).then(result => {
            return Promise.resolve(result.split('\n').map(elem => elem.split(':')[1]).filter(elem => !!elem).map(e => e.trim()));
        });
    }

    thiz.recordIrCommand = function (name) {
        return flip.sendAtCmdWithResult(C.AT_CMD_IR_RECORD, name, 11000).then(result => {
            let success = result && result.indexOf(_AT_CMD_IR_TIMEOUT_RESPONSE) === -1;
            return Promise.resolve(success);
        })
    }

    thiz.getLiveData = function (constant) {
        if (constant) {
            return _liveData[constant];
        }
        return _liveData;
    };

    thiz.resetMinMaxLiveValues = function () {
        _liveData[thiz.LIVE_PRESSURE_MIN] = 1024;
        _liveData[thiz.LIVE_MOV_X_MIN] = 1024;
        _liveData[thiz.LIVE_MOV_Y_MIN] = 1024;
        _liveData[thiz.LIVE_PRESSURE_MAX] = -1;
        _liveData[thiz.LIVE_MOV_X_MAX] = -1;
        _liveData[thiz.LIVE_MOV_Y_MAX] = -1;
    };

    thiz.setButtonAction = function(buttonModeIndex, atCmd) {
        if (buttonModeIndex === undefined || !atCmd) {
            return;
        }
        buttonModeIndex = parseInt(buttonModeIndex);
        thiz.setConfig(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, atCmd);
        thiz.sendATCmd(C.AT_CMD_BTN_MODE, buttonModeIndex);
        thiz.sendATCmd(atCmd);
    };

    thiz.getButtonAction = function (buttonModeIndex, slot) {
        buttonModeIndex = parseInt(buttonModeIndex);
        return thiz.getConfig(C.AT_CMD_BTN_MODE + " " + buttonModeIndex, slot);
    }

    thiz.restoreDefaultConfiguration = function () {
        thiz.sendATCmd('AT RS');
        _currentSlot = null;
        _slots = [];
        let promise = thiz.refreshConfig();
        promise.then(() => {
            if (_slotChangeHandler) {
                _slotChangeHandler();
            }
        })
        return promise;
    };

    thiz.setFlipmouseMode = function (index) {
        index = parseInt(index);
        if (!C.FLIPMOUSE_MODES.map(mode => mode.value).includes(index)) {
            return;
        }
        thiz.setConfig(C.AT_CMD_FLIPMOUSE_MODE, index);
        thiz.sendATCmd(C.AT_CMD_FLIPMOUSE_MODE, index);
    };

    thiz.setDeviceMode = function (modeNr, slot) {
        let originalSlot = _currentSlot;
        if (slot !== _currentSlot) {
            thiz.save();
            thiz.setSlot(slot);
        }
        thiz.sendATCmd(C.AT_CMD_DEVICE_MODE, modeNr);
        thiz.save();
        if (originalSlot !== _currentSlot) {
            thiz.setSlot(originalSlot);
        }
    }

    thiz.getVersion = function () {
        return thiz.sendAtCmdWithResult(C.AT_CMD_VERSION).then(result => {
            return Promise.resolve(L.formatVersion(result));
        });
    }

    thiz.getBTVersion = function () {
        return thiz.sendAtCmdWithResult(C.AT_BT_COMMAND, '$ID', 1000).then(result => {
            result = result || '';
            return Promise.resolve(result.trim() ? L.formatVersion(result) : '');
        });
    }

    /**
     * tests the connection to the flipmouse
     *
     * @param onlyIfNotBusy only do test if FLipMouse is not busy currently
     * @return {Promise}
     */
    function testConnection(onlyIfNotBusy) {
        return thiz.sendATCmd('AT', '', 3000, onlyIfNotBusy, false).then((response) => {
            let connected = response && (response.indexOf(_AT_CMD_OK_RESPONSE) > -1 || response.indexOf(_AT_CMD_BUSY_RESPONSE) > -1) ? true : false;
            return Promise.resolve(connected);
        });
    };

    function parseLiveValues(data) {
        if (!data) {
            console.log('error parsing live data: ' + data);
            return;
        }
        _liveValueIntervall = _valueHandler ? null : 300;

        if (!_liveValueIntervall || new Date().getTime() - _liveValueLastParse > _liveValueIntervall) {
            _liveValueLastParse = new Date().getTime();
            var valArray = data.split(':')[1].split(',');
            _liveData[thiz.LIVE_PRESSURE] = parseInt(valArray[0]);
            _liveData[thiz.LIVE_UP] = parseInt(valArray[1]);
            _liveData[thiz.LIVE_DOWN] = parseInt(valArray[2]);
            _liveData[thiz.LIVE_LEFT] = parseInt(valArray[3]);
            _liveData[thiz.LIVE_RIGHT] = parseInt(valArray[4]);
            _liveData[thiz.LIVE_MOV_X] = parseInt(valArray[5]);
            _liveData[thiz.LIVE_MOV_Y] = parseInt(valArray[6]);
            if (valArray[7]) {
                _liveData[thiz.LIVE_BUTTONS] = valArray[7].split('').map(v => v === "1");
            }
            if (valArray[8]) {
                let slot = thiz.getSlotName(parseInt(valArray[8]));
                if (slot && slot !== _currentSlot) {
                    _currentSlot = slot;
                    if (_slotChangeHandler) {
                        _slotChangeHandler();
                    }
                }
            }
            _liveData[thiz.LIVE_PRESSURE_MIN] = Math.min(_liveData[thiz.LIVE_PRESSURE_MIN], _liveData[thiz.LIVE_PRESSURE]);
            _liveData[thiz.LIVE_MOV_X_MIN] = Math.min(_liveData[thiz.LIVE_MOV_X_MIN], _liveData[thiz.LIVE_MOV_X]);
            _liveData[thiz.LIVE_MOV_Y_MIN] = Math.min(_liveData[thiz.LIVE_MOV_Y_MIN], _liveData[thiz.LIVE_MOV_Y]);
            _liveData[thiz.LIVE_PRESSURE_MAX] = Math.max(_liveData[thiz.LIVE_PRESSURE_MAX], _liveData[thiz.LIVE_PRESSURE]);
            _liveData[thiz.LIVE_MOV_X_MAX] = Math.max(_liveData[thiz.LIVE_MOV_X_MAX], _liveData[thiz.LIVE_MOV_X]);
            _liveData[thiz.LIVE_MOV_Y_MAX] = Math.max(_liveData[thiz.LIVE_MOV_Y_MAX], _liveData[thiz.LIVE_MOV_Y]);

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

    thiz.getSlotConfigText = function(slotName) {
        let config = thiz.getSlotConfigs(slotName);
        let ret = "Slot:"+slotName+"\n";

        Object.keys(config).forEach(function (key) {
            if (key.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                ret = ret + key + '\n' + config[key] + "\n";
            } else {
                ret = ret + key + ' ' + config[key] + "\n";
            }
        });
		
        return ret;
    }
}
