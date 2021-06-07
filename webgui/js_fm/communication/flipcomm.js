function FlipMouse() {
    let thiz = this;
    thiz.AT_CMD_MAPPING = {};
    thiz.SENSITIVITY_X = 'SENSITIVITY_X';
    thiz.SENSITIVITY_Y = 'SENSITIVITY_Y';
    thiz.ACCELERATION = 'ACCELERATION';
    thiz.MAX_SPEED = 'MAX_SPEED';
    thiz.DEADZONE_X = 'DEADZONE_X';
    thiz.DEADZONE_Y = 'DEADZONE_Y';
    thiz.SIP_THRESHOLD = 'SIP_THRESHOLD';
    thiz.SIP_STRONG_THRESHOLD = 'SIP_STRONG_THRESHOLD';
    thiz.PUFF_THRESHOLD = 'PUFF_THRESHOLD';
    thiz.PUFF_STRONG_THRESHOLD = 'PUFF_STRONG_THRESHOLD';
    thiz.ORIENTATION_ANGLE = 'ORIENTATION_ANGLE';
    thiz.SLOT_ID = 'SLOT_ID';

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
    thiz.FLIPMOUSE_MODE = 'FLIPMOUSE_MODE';
    thiz.VERSION = '';

    thiz.SIP_PUFF_IDS = [
        L.getIDSelector(thiz.SIP_THRESHOLD),
        L.getIDSelector(thiz.SIP_STRONG_THRESHOLD),
        L.getIDSelector(thiz.PUFF_THRESHOLD),
        L.getIDSelector(thiz.PUFF_STRONG_THRESHOLD)
    ];
    
    thiz.inRawMode = false;

    let _config = {};
    let _unsavedConfig = {};
    let _liveData = {};
    let AT_CMD_LENGTH = 5;

    let AT_CMD_MAPPING = {};
    AT_CMD_MAPPING[thiz.SENSITIVITY_X] = 'AT AX';
    AT_CMD_MAPPING[thiz.SENSITIVITY_Y] = 'AT AY';
    AT_CMD_MAPPING[thiz.ACCELERATION] = 'AT AC';
    AT_CMD_MAPPING[thiz.MAX_SPEED] = 'AT MS';
    AT_CMD_MAPPING[thiz.DEADZONE_X] = 'AT DX';
    AT_CMD_MAPPING[thiz.DEADZONE_Y] = 'AT DY';
    AT_CMD_MAPPING[thiz.SIP_THRESHOLD] = 'AT TS';
    AT_CMD_MAPPING[thiz.SIP_STRONG_THRESHOLD] = 'AT SS';
    AT_CMD_MAPPING[thiz.PUFF_THRESHOLD] = 'AT TP';
    AT_CMD_MAPPING[thiz.PUFF_STRONG_THRESHOLD] = 'AT SP';
    AT_CMD_MAPPING[thiz.ORIENTATION_ANGLE] = 'AT RO';
    AT_CMD_MAPPING[thiz.FLIPMOUSE_MODE] = 'AT MM';
    AT_CMD_MAPPING[thiz.VERSION] = 'AT ID';
    let VALUE_AT_CMDS = Object.values(AT_CMD_MAPPING);
    let debouncers = {};
    let _valueHandler = null;
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
    let _connected = false;
    let _neverTestConnection = false;
    let _AT_CMD_IR_TIMEOUT_RESPONSE = 'IR_TIMEOUT';
    let _AT_CMD_BUSY_RESPONSE = 'BUSY';
    let _AT_CMD_OK_RESPONSE = 'OK';

    /**
     * initializes the FLipMouse instance
     * @return {Promise<* | void>} promise resolving with config of the current slot
     */
    thiz.init = function () {
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
            thiz.pauseLiveValueListener();
            thiz.resetMinMaxLiveValues();
            return thiz.refreshConfig();
        }).then((config) => {
            thiz.startTestingConnection();
            return Promise.resolve(_config[_currentSlot]);
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
        thiz.stopTestingConnection();
        let promise = thiz.sendATCmd(atCmd, param, timeout, onlyIfNotBusy, dontLog);
        promise.then(thiz.startTestingConnection);
        return promise;
    }
    
    thiz.sendRawData = function(data, timeout) {
        return _communicator.sendRawData(data, timeout);
    };

    thiz.startTestingConnection = function () {
        if (_connectionTestIntervalHandler || _neverTestConnection) {
            return;
        }
        function doTest() {
            testConnection(true).then(result => {
                _connectionTestCallbacks.forEach(fn => fn(result));
            });
        }
        doTest();
        _connectionTestIntervalHandler = setInterval(doTest, 10000);
    }

    thiz.stopTestingConnection = function () {
        clearInterval(_connectionTestIntervalHandler);
        _connectionTestIntervalHandler = null;
    }

    thiz.neverTestConnection = function () {
        _neverTestConnection = true;
        thiz.stopTestingConnection();
    }

    thiz.addConnectionTestCallback = function (fn) {
        _connectionTestCallbacks.push(fn);
        _connectionTestCallbacks.forEach(fn => fn(_connected));
    }

    thiz.isInitialized = function () {
        return _isInitialized;
    }

    thiz.setValue = function (valueConstant, value, debounceTimeout) {
        if (!debounceTimeout) {
            debounceTimeout = 300;
        }
        thiz.setConfig(valueConstant, parseInt(value));
        clearInterval(debouncers[valueConstant]);
        debouncers[valueConstant] = setTimeout(function () {
            var atCmd = AT_CMD_MAPPING[valueConstant];
            thiz.sendATCmd(atCmd, value);
        }, debounceTimeout);
    };

    thiz.refreshConfig = function () {
        return new Promise(function(resolve, reject) {
            thiz.sendAtCmdWithResult('AT LA').then(function (response) {
                _config = {};
                parseConfig(response);
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
        var currentOrientation = thiz.getConfig(thiz.ORIENTATION_ANGLE);
        thiz.setValue(thiz.ORIENTATION_ANGLE, (currentOrientation + 90) % 360, 0);
        thiz.sendATCmd('AT CA');
        return testConnection();
    };

    thiz.setSlotChangeHandler = function (fn) {
        _slotChangeHandler = fn;
    }

    thiz.startLiveValueListener = function (handler) {
        console.log('starting listening to live values...');
        setLiveValueHandler(handler);
    };

    thiz.stopLiveValueListener = function () {
        setLiveValueHandler(null);
        console.log('listening to live values stopped.');
    };

    thiz.pauseLiveValueListener = function () {
        thiz.sendATCmd('AT ER');
        console.log('listening to live values stopped.');
    };

    thiz.resumeLiveValueListener = function () {
        if (_valueHandler) {
            thiz.sendATCmd('AT SR');
            console.log('listening to live values resumed.');
        } else {
            console.log('listening to live values not resumed, because no value handler.');
        }
    };

    thiz.getConfig = function (constant, slot) {
        slot = slot || _currentSlot;
        return _config[slot] ? _config[slot][constant] : null;
    };

    thiz.getATCmd = function (constant, slot) {
        let config = thiz.getConfig(constant, slot);
        return config ? config.substring(0, C.LENGTH_ATCMD_PREFIX).trim() : null;
    }

    thiz.getATCmdSuffix = function (constant, slot) {
        let config = thiz.getConfig(constant, slot);
        return config ? config.substring(C.LENGTH_ATCMD_PREFIX).trim() : null;
    }

    thiz.getAllSlotConfigs = function () {
        return JSON.parse(JSON.stringify(_config));
    };

    thiz.isConfigUnsaved = function (constant, slot) {
        slot = slot || _currentSlot;
        return _unsavedConfig[slot] ? _unsavedConfig[slot].indexOf(constant) > -1 : false;
    };

    thiz.setConfig = function (constant, value, slot) {
        slot = slot || _currentSlot;
        if (_config[slot]) {
            _config[slot][constant] = value;
        }
    };

    thiz.getSlots = function () {
        return Object.keys(_config);
    };

    thiz.getSlotName = function (id) {
        return thiz.getSlots().reduce((total, current) => {
            return _config[current][thiz.SLOT_ID] === id ? current : total;
        }, '')
    }

    thiz.getCurrentSlot = function () {
        return _currentSlot;
    };

    thiz.setSlot = function (slot) {
        if (thiz.getSlots().includes(slot)) {
            _currentSlot = slot;
            thiz.sendATCmd(C.AT_CMD_LOAD_SLOT, slot);
        }
        return _config[_currentSlot];
    };

    thiz.createSlot = function (slotName) {
        if (!slotName || thiz.getSlots().includes(slotName)) {
            console.warn('slot not saved because no slot name or slot already existing!');
        }
        _config[slotName] = L.deepCopy(_config[_currentSlot]);
        thiz.sendATCmd(C.AT_CMD_SAVE_SLOT, slotName);
        thiz.setSlot(slotName);
        return testConnection();
    };

    thiz.deleteSlot = function (slotName) {
        if (!slotName || !thiz.getSlots().includes(slotName)) {
            console.warn('slot not deleted because no slot name or slot not existing!');
        }
        delete _config[slotName];
        thiz.sendATCmd(C.AT_CMD_DELETE_SLOT, slotName);
        if (slotName === _currentSlot) {
            _currentSlot = thiz.getSlots()[0];
            if (_currentSlot) {
                thiz.sendATCmd(C.AT_CMD_LOAD_SLOT, _currentSlot);
            }
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

    thiz.setButtonAction = function(buttonModeConstant, atCmd) {
        let index = C.BTN_MODES2.filter(btnMode => btnMode.constant === buttonModeConstant)[0].index;
        if (!index || !atCmd) {
            return;
        }
        thiz.setConfig(buttonModeConstant, atCmd);
        _unsavedConfig[_currentSlot] = _unsavedConfig[_currentSlot] || [];
        _unsavedConfig[_currentSlot].push(buttonModeConstant);

        thiz.sendATCmd(C.AT_CMD_BTN_MODE, index);
        thiz.sendATCmd(atCmd);
    };

    thiz.restoreDefaultConfiguration = function() {
        thiz.sendATCmd('AT RS');
        _currentSlot = null;
        _config = {};
        return thiz.refreshConfig();
    };

    thiz.setFlipmouseMode = function (index) {
        index = parseInt(index);
        if (!C.FLIPMOUSE_MODES.map(mode => mode.value).includes(index)) {
            return;
        }
        thiz.setConfig(thiz.FLIPMOUSE_MODE, index);
        thiz.sendATCmd(AT_CMD_MAPPING[thiz.FLIPMOUSE_MODE], index);
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
            _connected = response && (response.indexOf(_AT_CMD_OK_RESPONSE) > -1 || response.indexOf(_AT_CMD_BUSY_RESPONSE) > -1) ? true : false;
            return Promise.resolve(_connected);
        });
    };

    function setLiveValueHandler(handler) {
        _valueHandler = handler;
        if (L.isFunction(_valueHandler)) {
            thiz.sendATCmd('AT SR');
            _communicator.setValueHandler(parseLiveValues);
        } else {
            thiz.sendATCmd('AT ER');
        }
    }

    function parseLiveValues(data) {
        if (!L.isFunction(_valueHandler)) {
            _communicator.setValueHandler(null);
            return;
        }
        if (!data || data.indexOf('VALUES') == -1) {
            console.log('error parsing live data: ' + data);
            return;
        }

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
            if (slot !== _currentSlot) {
                _currentSlot = slot;
                if (_slotChangeHandler) {
                    _slotChangeHandler(slot, _config[slot]);
                }
            }
        }
        _liveData[thiz.LIVE_PRESSURE_MIN] = Math.min(_liveData[thiz.LIVE_PRESSURE_MIN], _liveData[thiz.LIVE_PRESSURE]);
        _liveData[thiz.LIVE_MOV_X_MIN] = Math.min(_liveData[thiz.LIVE_MOV_X_MIN], _liveData[thiz.LIVE_MOV_X]);
        _liveData[thiz.LIVE_MOV_Y_MIN] = Math.min(_liveData[thiz.LIVE_MOV_Y_MIN], _liveData[thiz.LIVE_MOV_Y]);
        _liveData[thiz.LIVE_PRESSURE_MAX] = Math.max(_liveData[thiz.LIVE_PRESSURE_MAX], _liveData[thiz.LIVE_PRESSURE]);
        _liveData[thiz.LIVE_MOV_X_MAX] = Math.max(_liveData[thiz.LIVE_MOV_X_MAX], _liveData[thiz.LIVE_MOV_X]);
        _liveData[thiz.LIVE_MOV_Y_MAX] = Math.max(_liveData[thiz.LIVE_MOV_Y_MAX], _liveData[thiz.LIVE_MOV_Y]);

        _valueHandler(_liveData);
    }

    function parseConfig(atCmdsString) {
        atCmdsString = atCmdsString.replace(/\n\s*\n/g, '\n'); //replace doubled linebreaks with single one
        return parseConfigElement(atCmdsString.split('\n'));
    }
    
    //TODO: do we need both versions? I didn't want to remove the other one to avoid breaking anything
    thiz.parseConfig = function(atCmdsString,ignoreSlotName) {
        atCmdsString = atCmdsString.replace(/\n\s*\n/g, '\n'); //replace doubled linebreaks with single one
        return parseConfigElement(atCmdsString.split('\n'),null,ignoreSlotName);
    }

    function parseConfigElement(remainingList, config, ignoreSlotName, id) {
        if (!remainingList || remainingList.length == 0) {
            return _config;
        }
        id = id || 0;
        config = config || {};
        var currentElement = remainingList[0];
        var nextElement = remainingList[1];

        if (currentElement.indexOf(_SLOT_CONSTANT) > -1) {
			if(!ignoreSlotName)
			{
				var slot = currentElement.substring(_SLOT_CONSTANT.length).trim();
				if (!_currentSlot) {
					_currentSlot = slot;
				}
                config = {};
                _config[slot] = config;
                _config[slot][thiz.SLOT_ID] = id;
                id++;
			}
        } else {
            var currentAtCmd = currentElement.substring(0, AT_CMD_LENGTH).trim();
            if (VALUE_AT_CMDS.includes(currentAtCmd)) {
                var key = L.val2key(currentAtCmd, AT_CMD_MAPPING);
                config[key] = parseInt(currentElement.substring(AT_CMD_LENGTH));
            } else if(currentAtCmd.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                var buttonModeIndex = parseInt(currentElement.substring(AT_CMD_LENGTH));
                if(C.BTN_MODES[buttonModeIndex-1]) {
                    config[C.BTN_MODES[buttonModeIndex-1]] = nextElement.trim();
                }
            }
        }
        return parseConfigElement(remainingList.slice(1), config, false, id);
    }

    function loadSlotByConfig(slotName) {
        let config = _config[slotName];
        Object.keys(config).forEach(function (key) {
            let atCmd = AT_CMD_MAPPING[key];
            if(C.BTN_MODES.includes(key)) {
                thiz.setButtonAction(key, config[key]);
            } else if(key === thiz.FLIPMOUSE_MODE) {
                thiz.setFlipmouseMode(config[key]);
            } else if (atCmd) {
                thiz.sendATCmd(atCmd, config[key]);
            }
        });
    }

    thiz.getSlotConfigText = function(slotName) {
        var config = _config[slotName];
        var ret = "Slot:"+slotName+"\n";

		Object.keys(config).forEach(function (key) {
			var atCmd = AT_CMD_MAPPING[key];
			if(C.BTN_MODES.includes(key)) {
				//TODO improve
			    var index = C.BTN_MODES.indexOf(key) + 1;
				var indexFormatted = ("0" + index).slice(-2); //1 => 01
				ret = ret + C.AT_CMD_BTN_MODE + ' ' + indexFormatted + "\n";
				ret = ret + config[key] + "\n";
            } else if (atCmd) {
                ret = ret + atCmd + ' ' + config[key] + "\n";
            }
        });
		
        return ret;
    }
}
