/**
 * ATDevice implements all functionality that is generic for FLipMouse, FABI and FlipPad devices.
 */
import {SerialCommunicator} from "../adapter/sercomm.js";
import {localStorageService} from "../localStorageService.js";

let ATDevice = {};
ATDevice.parseLiveData = true;

let _slots = [];
let _slotsBackup = [];
let _currentSlot = null;
let _slotChangeHandler = null;
let _lastSlotChangeTime = 0;
let _SLOT_CONSTANT = 'Slot';
let _valueHandler = null;
let _liveValueLastUpdate = 0;
let _sensorInfo = {};

let _communicator;
let _isInitialized = false;
let _inRawMode = false;
let _busyMethods = {};

let _atCmdQueue = [];
let _sendingAtCmds = false;
let _timestampLastAtCmd = new Date().getTime();

let _connectionTestIntervalHandler = null;
let _connectionTestCallbacks = [];
let _connected = true;

let _AT_CMD_BUSY_RESPONSE = 'BUSY';
let _AT_CMD_IR_TIMEOUT_RESPONSE = 'IR_TIMEOUT';
let _liveData = {};
let _liveValueHandler = null;
let _lastLiveValueParse = 0;

let _autoSaveTimeout = 750;
let _dontGetLiveValues = false;

let _lastVersionResult = null
let _lastVersionRawString = null


const TEST_MODE_OPTIONS = "TEST_MODE_OPTIONS";
let _testModeOptions = localStorageService.get(TEST_MODE_OPTIONS) || {
    enabled: false,
    countdownSeconds: 10,
    testSeconds: 90
};

localStorageService.save(TEST_MODE_OPTIONS, _testModeOptions);
let _currentlyTestingSlot = '';
let _currentDeviceSlot = '';
let _slotBeforeTest = '';


/**
 * initializes the instance of the device
 * @param dontGetLiveValues if true, live values are not requested by default
 * @return {Promise<* | void>} promise resolving with config of the current slot
 */
ATDevice.init = function (dontGetLiveValues) {
    _dontGetLiveValues = dontGetLiveValues;
    return Promise.resolve().then(() => {
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
    }).then(function () {
        _isInitialized = true;
        return ATDevice.sendAtCmdWithResultForce(C.AT_CMD_VERSION);
    }).then((versionString) => {
        _lastVersionRawString = versionString;
        _lastVersionResult = L.parseVersion(versionString);
        console.log("VersionString: " + versionString);
        if (versionString.toLowerCase().includes("fabi")) { 
            C.CURRENT_DEVICE = C.AT_DEVICE_FABI; 
            C.DEVICE_IS_FLIPPAD = false; 
            C.DEVICE_IS_FLIPMOUSE = false; 
            C.DEVICE_IS_FABI=true;
            C.PYHSICAL_BUTTON_COUNT = 5; // FABI has 5 physical buttons 
        }
        else if (versionString.toLowerCase().includes("flipmouse")) { 
            C.CURRENT_DEVICE = C.AT_DEVICE_FLIPMOUSE; 
            C.DEVICE_IS_FLIPPAD = false; 
            C.DEVICE_IS_FLIPMOUSE = true; 
            C.DEVICE_IS_FABI=false; 
            C.PYHSICAL_BUTTON_COUNT = 2; // FlipMouse has 2 physical buttons
        }
        else if (versionString.toLowerCase().includes("flippad")) { 
            C.CURRENT_DEVICE = C.AT_DEVICE_FLIPPAD; 
            C.DEVICE_IS_FLIPPAD = true; 
            C.DEVICE_IS_FLIPMOUSE = false; 
            C.DEVICE_IS_FABI=false; 
            C.PYHSICAL_BUTTON_COUNT = 2; // FlipPad has 2 physical buttons
        }
        else {
            if (_communicator.close) _communicator.close();
            return Promise.reject(C.ERROR_WRONG_DEVICE);
        }
        if (!L.isVersionNewer(C.MIN_FIRMWARE_VERSION, versionString) && !L.isVersionEqual(C.MIN_FIRMWARE_VERSION, versionString)) {
            if (_communicator.close) _communicator.close();
            return Promise.reject(C.ERROR_FIRMWARE_OUTDATED);
        }
        if (versionString.indexOf(C.PRESSURE_SENSOR_TYPE_NONE)>0) {
            _sensorInfo[C.PRESSURE_SENSOR]=false;
            console.log("No Pressure Sensor available");
        } else {
            _sensorInfo[C.PRESSURE_SENSOR]=true;
            console.log("Pressure Sensor found");
        }
        _sensorInfo[C.FORCE_SENSOR]=false;
        if ((versionString.indexOf(C.FORCE_SENSOR_TYPE_NAU7802)>0) ||
            (versionString.indexOf(C.FORCE_SENSOR_TYPE_ADC)>0)) {
            _sensorInfo[C.FORCE_SENSOR]=true;
            console.log("Force Sensor found");
        } else {
            console.log("No Force Sensor available");
        }
        return ATDevice.refreshConfig();
    }).then(() => {
        if (!_dontGetLiveValues) {
            ATDevice.sendAtCmdForce(C.AT_CMD_START_REPORTING_LIVE);
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
        return Promise.reject(error);
    });
}

ATDevice.isInitialized = function () {
    return _isInitialized;
}

ATDevice.getVersion = function () {
    return ATDevice.sendAtCmdWithResultForce(C.AT_CMD_VERSION).then(result => {
        _lastVersionRawString = result;
        _lastVersionResult = L.parseVersion(result);
        return Promise.resolve(L.formatVersion(result));
    });
}

ATDevice.getVersionSuffix = function () {
    if (!_lastVersionRawString) {
        return;
    }
    let parts = _lastVersionRawString.split(', ');
    if (parts.length > 1) { 
        parts.shift();
        return parts.join(', ');
    }
    return "";
}

ATDevice.isMajorVersion = function (numValue) {
    let currentVersion = _lastVersionResult || {};
    return currentVersion.major === numValue;
}

ATDevice.getMajorVersion = function () {
    let currentVersion = _lastVersionResult || {};
    return currentVersion.major;
}
ATDevice.getSensorInfo = function () {
    let currentSensorInfo = _sensorInfo || {};
    return currentSensorInfo;
}

/**
 * Sends the given AT command to the device. If sending of the last command is not completed yet, the given AT command
 * is added to a queue and will be sent later.
 * The order of sending the commands is always equal to the order of calls to this function.
 *
 * @param atCmd the AT command to send
 * @param param an optional parameter that is appended to the AT command
 * @param options.timeout maximum time after the returned promise resolves, regardless if data was received or not. Default 0ms.
 * @param options.onlyIfNotBusy if set to true, the command is sent only if no other AT command is currently waiting for a response
 * @param options.dontLog if set to true, there are no logs to console for this command
 * @param options.forceSend if set to true, AT command is send also in safe mode
 * @param options.close if set to true, the communicator is closed after sending the command
 * @return {Promise} which resolves to the result of the command or '' if no result was received.
 */
ATDevice.sendATCmd = function (atCmd, param, options) {
    options = options || {};
    if (_testModeOptions.enabled && !options.forceSend) {
        log.info(`not sending command ${atCmd} command because of safe mode.`);
        return Promise.resolve();
    }
    if (!ATDevice.isInitialized()) {
        return Promise.reject('cannot send AT command if not initialized.');
    }
    if (_inRawMode) {
        log.warn('not sending AT command because in raw mode.');
        return Promise.reject();
    }
    if ((options.onlyIfNotBusy && _atCmdQueue.length > 0)) {
        if (!options.dontLog) console.log('did not send cmd: "' + atCmd + "' because another command is executing.");
        return Promise.resolve(_AT_CMD_BUSY_RESPONSE);
    }
    if (_atCmdQueue.length > 0) {
        if (!options.dontLog) log.debug("adding cmd to queue: " + atCmd);
    }
    let queueElem = null;
    let cmd = param !== undefined ? atCmd + ' ' + param : atCmd;
    let promise = new Promise(function (resolve, reject) {
        queueElem = {
            timeout: options.timeout || 0,
            dontLog: options.dontLog,
            cmd: cmd.trim(),
            resolveFn: resolve,
            rejectFn: reject,
            options: options
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
                if (nextQueueElem.options.close) {
                    let communicator = ATDevice.getCommunicator();
                    if (communicator.close) {
                        log.info("closing communicator...");
                        communicator.close();
                    }
                } else {
                    sendNext();
                }
            });
        }, timeoutSend);
    }

    return promise;
};

ATDevice.sendAtCmdForce = function (atCmd, param, options) {
    options = options || {};
    options.forceSend = true;
    return ATDevice.sendATCmd(atCmd, param, options);
}

window.sendATCmd = (cmd) => {
    ATDevice.sendAtCmdWithResultForce(cmd);
}

window.sendATCmdNoResult = (cmd) => {
    ATDevice.sendAtCmdForce(cmd);
}

/**
 * Sends the given AT command to the device and waits for a response, details @see sendATCmd()
 *
 * @param atCmd
 * @param param
 * @param options.timeout the timeout to wait for a response, default: 3000ms
 * @return {Promise}
 */
ATDevice.sendAtCmdWithResult = function (atCmd, param, options) {
    options = options || {};
    options.timeout = options.timeout || 3000;
    let promise = ATDevice.sendATCmd(atCmd, param, options);
    return promise;
}

ATDevice.sendAtCmdWithResultForce = function (atCmd, param, options) {
    options = options || {};
    options.forceSend = true;
    return ATDevice.sendAtCmdWithResult(atCmd, param, options);
}

ATDevice.upgradeBTAddon = async function (firmwareArrayBuffer, progressCallback) {
    if (!_communicator.sendRawData) {
        log.warn('upgrade not supported by communicator!')
        return;
    }    
    stopTestingConnection();
    ATDevice.sendAtCmdForce(C.AT_CMD_STOP_REPORTING_LIVE);
    ATDevice.sendAtCmdForce(C.AT_CMD_UPGRADE_ADDON);
    _inRawMode = true;
    return _communicator.waitForReceiving('OTA:ready', 15000).then(() => {
        log.info('starting sending raw data');
        return _communicator.sendRawData(firmwareArrayBuffer, progressCallback);
    }).then(() => {
        return _communicator.waitForReceiving('OTA:$FIN', 20000);
    }).then(() => {
        log.info('bluetooth upgrade successful!');
        return Promise.resolve();
    }).catch((error) => {
        log.warn('BT addon update failed because: ' + error);
        return Promise.reject();
    }).finally(() => {
        _inRawMode = false;
        if (!_dontGetLiveValues) ATDevice.sendAtCmdForce(C.AT_CMD_START_REPORTING_LIVE);
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
    return '';
};

ATDevice.setConfig = async function (atCmd, value, debounceTimeout, slot) {
    value = value + '';
    setConfigInternal(atCmd, value, [slot]);
    return new Promise(resolve => {
        debounceTimeout = debounceTimeout === undefined ? 300 : debounceTimeout;
        L.debounce(async function () {
            if (_busyMethods['setConfig']) {
                log.warn("not doing command because device is busy.");
                return;
            }
            _busyMethods['setConfig'] = true;
            if (slot !== _currentSlot) {
                await ATDevice.setSlot(slot);
            }
            ATDevice.sendATCmd(atCmd, value);
            _busyMethods['setConfig'] = false;
            resolve();
            ATDevice.planSaving();
        }, debounceTimeout, atCmd);
    });
};

ATDevice.setConfigForSlot = async function(atCmd, value, slot, debounceTimeout) {
    debounceTimeout = debounceTimeout || 0;
    return ATDevice.setConfig(atCmd, value, debounceTimeout, slot);
}

/**
 * copies config values from one slot to all other slots
 * @param configConstants an array of config constants which values should be copied to all slots
 * @param sourceSlot (optional) the source slot to copy the values from, default: current slot
 * @param skipInitialSave if true the current slot is not saved (because already saved)
 */
ATDevice.copyConfigToAllSlots = async function (configConstants, sourceSlot, skipInitialSave) {
    if (!configConstants || configConstants.length === 0) {
        return;
    }
    let originalSlot = ATDevice.getCurrentSlot();
    sourceSlot = sourceSlot || ATDevice.getCurrentSlot();
    let sourceSlotObject = _slots.filter(slotObject => slotObject.name === sourceSlot)[0];
    if (!skipInitialSave) {
        ATDevice.save();
    }
    ATDevice.parseLiveData = false;
    for (let slotObject of _slots) {
        if (slotObject.name !== sourceSlot) {
            await ATDevice.sendAtCmdWithResult(C.AT_CMD_LOAD_SLOT, slotObject.name);
            let slotChanged = false;
            for (let constant of configConstants) {
                if (slotObject.config[constant] !== sourceSlotObject.config[constant]) {
                    slotChanged = true;
                    slotObject.config[constant] = sourceSlotObject.config[constant];
                    if (constant.indexOf(C.AT_CMD_BTN_MODE) !== -1) {
                        ATDevice.sendATCmd(constant);
                        ATDevice.sendATCmd(sourceSlotObject.config[constant]);
                    } else {
                        ATDevice.sendATCmd(constant, sourceSlotObject.config[constant]);
                    }
                }
            }
            if (slotChanged) {
                emitConfigChange();
                await ATDevice.save(slotObject.name);
            }
        }
    }
    await ATDevice.sendAtCmdWithResult(C.AT_CMD_LOAD_SLOT, originalSlot);
    ATDevice.parseLiveData = true;
    return Promise.resolve();
}

ATDevice.refreshConfig = function () {
    return new Promise(function (resolve, reject) {
        ATDevice.sendAtCmdForce(C.AT_CMD_STOP_REPORTING_LIVE);
        ATDevice.sendAtCmdWithResultForce(C.AT_CMD_LOAD_ALL).then(function (response) {
            _slots = ATDevice.parseConfig(response);
            _slotsBackup = JSON.parse(JSON.stringify(_slots));
            _currentSlot = _currentSlot || _slots[0].name;
            _currentDeviceSlot = _currentSlot;
            emitConfigChange();
            resolve();
        }, function () {
            console.log("could not get config!");
            reject();
        }).finally(() => {
            if (!_dontGetLiveValues) ATDevice.sendAtCmdForce(C.AT_CMD_START_REPORTING_LIVE);
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
    return action ? action.substring(0, C.LENGTH_AT_CMD_PREFIX).trim() : null;
}

ATDevice.getButtonActionATCmdSuffix = function (index, slot) {
    let action = ATDevice.getButtonAction(index, slot);
    return action ? action.substring(C.LENGTH_AT_CMD_PREFIX).trim() : null;
}

ATDevice.save = async function (slot, force) {
    slot = slot || _currentSlot;
    if (!slot) {
        return;
    }
    ATDevice.abortAutoSaving();
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_SAVE_SLOT, slot, {
        forceSend: force
    });
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

ATDevice.getAllSlotBackupObjects = function () {
    return JSON.parse(JSON.stringify(_slotsBackup));
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

ATDevice.handleSlotChangeFromDevice = function (deviceSlot) {
    if (!deviceSlot) {
        return;
    }
    if (ATDevice.isSlotTestMode() && ATDevice.isTesting()) {
        if (deviceSlot === _currentlyTestingSlot && _currentDeviceSlot !== deviceSlot) { // switched back to current testing slot on device
            applySlotChangesToDevice();
        }
    }
    _currentDeviceSlot = deviceSlot;
    if (!ATDevice.isSlotTestMode()) {
        ATDevice.setSlot(deviceSlot, true);
    }
}

ATDevice.setSlot = async function (slot, dontSendToDevice) {
    let promise = Promise.resolve();
    if (slot === _currentSlot) {
        return Promise.resolve();
    }
    if (_busyMethods['setSlot']) {
        log.warn("not doing command because device is busy.");
        return;
    }
    _busyMethods['setSlot'] = true;
    if (ATDevice.getSlots().includes(slot)) {
        if (!dontSendToDevice) {
            ATDevice.parseLiveData = false; //prevent to parse old slot from live values before new slot applied on device
            await ATDevice.save();
            promise = ATDevice.sendAtCmdWithResult(C.AT_CMD_LOAD_SLOT, slot);
            ATDevice.sendATCmd(C.AT_CMD_CALIBRATION);
        }
        _currentSlot = slot;
    }
    promise.finally(() => {
        ATDevice.parseLiveData = true;
        _busyMethods['setSlot'] = false;
    });
    emitSlotChange();
    return promise;
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
    ATDevice.save(slotName, true); //create new slot also in save mode
    ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, slotName);
    emitSlotChange();
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
    emitSlotChange();
    return Promise.resolve();
};

ATDevice.deleteAllSlots = function () {
    ATDevice.sendATCmd(C.AT_CMD_DELETE_SLOT);
    _slots = [];
    _currentSlot = '';
    emitSlotChange();
}

ATDevice.sendAudio =  async function(wavBuffer) {

    let serialCommunicator = ATDevice.getCommunicator();
    let failed = false;
    if (!serialCommunicator.sendRawData) {
        log.warn('audio upload not supported by communicator!')
        return;
    }

    try {
        console.log("Sending Wav File to FABI");
        await serialCommunicator.sendAudioData(wavBuffer);
        // console.log("Sent to serial:", wavBuffer);
        console.log("Done");
    } catch (error) {
        console.error("Error sending data to serial device:", error);
    }
}



ATDevice.uploadSlots = async function (slotObjects, progressHandler) {
    ATDevice.save();
    let slotObject = null;
    progressHandler = progressHandler || (() => {});
    progressHandler(1);
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
        await ATDevice.save(slotObject.name, true);
        progressHandler(Math.round((i+1) / slotObjects.length * 100));
        _slots.push(slotObject);
    }
    progressHandler(100);
    if (slotObjects[0]) {
        ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, slotObjects[0].name);
        _currentSlot = slotObjects[0].name;
        emitSlotChange();
    }
}

ATDevice.restoreDefaultConfiguration = function () {
    ATDevice.sendAtCmdForce(C.AT_CMD_RESET_DEVICE);
    _currentSlot = null;
    _slots = [];
    let promise = ATDevice.refreshConfig();
    promise.then(() => {
        emitSlotChange();
        ATDevice.calibrate();
    })
    return promise;
};

ATDevice.parseConfig = function(atCmdsString) {
    atCmdsString = atCmdsString.replace(/\n\s*\n/g, '\n'); //replace doubled linebreaks with single one
    let elements = atCmdsString.split('\n');
    let parsedSlots = [];
    let currentParsedSlot = null;
    for (let i = 0; i < elements.length; i++) {
        let currentElement = elements[i];
        let nextElement = elements[i + 1] || '';
        if (currentElement.indexOf(_SLOT_CONSTANT) > -1) {
            let slotName = currentElement.substring(currentElement.indexOf(':') + 1).trim();
            currentParsedSlot = {
                name: slotName,
                config: {}
            };
            parsedSlots.push(currentParsedSlot);
        } else {
            let currentAtCmd = currentElement.substring(0, C.LENGTH_AT_CMD_PREFIX - 1).trim();
            if (currentAtCmd.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                let buttonModeIndex = parseInt(currentElement.substring(C.LENGTH_AT_CMD_PREFIX - 1));
                currentParsedSlot.config[C.AT_CMD_BTN_MODE + ' ' + buttonModeIndex] = nextElement.trim();
            } else if (C.AT_CMDS_SETTINGS.indexOf(currentAtCmd) > -1) {
                currentParsedSlot.config[currentAtCmd] = currentElement.substring(C.LENGTH_AT_CMD_PREFIX - 1).trim();
            }
        }
    }
    return parsedSlots;
}

ATDevice.getCommunicator = function () {
    return _communicator;
}

ATDevice.isSlotTestMode = function () {
    return _testModeOptions.enabled;
}

ATDevice.setSlotTestModeOptions = function (options) {
    options = options || {};
    if (!_testModeOptions.enabled && options.enabled) {
        _slotsBackup = JSON.parse(JSON.stringify(_slots));
    }
    _testModeOptions = Object.assign(_testModeOptions, options);
    localStorageService.save(TEST_MODE_OPTIONS, _testModeOptions);
    if (_slotChangeHandler) { // repaint MainView
        _slotChangeHandler();
    }
}

ATDevice.getSlotTestModeOptions = function () {
    return JSON.parse(JSON.stringify(_testModeOptions));
}

ATDevice.revertCurrentSlot = function () {
    if (!_testModeOptions.enabled) {
        return;
    }
    ATDevice.stopTestingCurrentSlot();
    let backupSlotNames = _slotsBackup.map(slot => slot.name);
    let deviceSlot = _slotsBackup.filter(slot => slot.name === _currentSlot)[0];
    let guiSlot = _slots.filter(slot => slot.name === _currentSlot)[0];
    if (backupSlotNames.includes(_currentSlot)) {
        _slots[_slots.indexOf((guiSlot))] = JSON.parse(JSON.stringify(deviceSlot));
        emitSlotChange();
    }
    window.dispatchEvent(new CustomEvent(C.EVENT_REFRESH_MAIN));
}

ATDevice.testCurrentSlot = function () {
    _slotBeforeTest = _currentDeviceSlot;
    _currentlyTestingSlot = _currentSlot;
    if (_currentSlot !== _currentDeviceSlot) {
        ATDevice.sendAtCmdForce(C.AT_CMD_LOAD_SLOT, _currentSlot);
    }
    applySlotChangesToDevice();
    window.dispatchEvent(new CustomEvent(C.EVENT_REFRESH_MAIN));
}

ATDevice.isTesting = function () {
    return !!_currentlyTestingSlot;
}

ATDevice.stopTestingCurrentSlot = function () {
    if (_currentlyTestingSlot) {
        _currentlyTestingSlot = '';
        ATDevice.sendAtCmdForce(C.AT_CMD_LOAD_SLOT, _slotBeforeTest);
        window.dispatchEvent(new CustomEvent(C.EVENT_REFRESH_MAIN));
    }
}

ATDevice.approveCurrentSlot = function () {
    let originalSlot = _currentDeviceSlot;
    if (_currentSlot !== _currentDeviceSlot) {
        ATDevice.sendAtCmdForce(C.AT_CMD_LOAD_SLOT, _currentSlot);
    }
    applySlotChangesToDevice();
    ATDevice.sendAtCmdForce(C.AT_CMD_SAVE_SLOT, _currentSlot);
    ATDevice.sendAtCmdForce(C.AT_CMD_LOAD_SLOT, originalSlot);
    let backupSlotNames = _slotsBackup.map(slot => slot.name);
    let deviceSlot = _slotsBackup.filter(slot => slot.name === _currentSlot)[0];
    let guiSlot = _slots.filter(slot => slot.name === _currentSlot)[0];
    if (backupSlotNames.includes(_currentSlot)) {
        _slotsBackup[_slotsBackup.indexOf((deviceSlot))] = JSON.parse(JSON.stringify(guiSlot));
    } else {
        _slotsBackup.push(JSON.parse(JSON.stringify(guiSlot)));
    }
    window.dispatchEvent(new CustomEvent(C.EVENT_REFRESH_MAIN));
}

ATDevice.hasUnsavedChanges = function () {
    let guiSlotConfig = _slots.filter(slot => slot.name === _currentSlot)[0].config;
    let deviceSlot = _slotsBackup.filter(slot => slot.name === _currentSlot)[0];
    let deviceSlotConfig = deviceSlot ? deviceSlot.config : {};
    return JSON.stringify(guiSlotConfig) !== JSON.stringify(deviceSlotConfig) || _currentDeviceSlot !== _currentSlot;
}

function applySlotChangesToDevice() {
    let guiSlotConfig = _slots.filter(slot => slot.name === _currentSlot)[0].config;
    let deviceSlot = _slotsBackup.filter(slot => slot.name === _currentSlot)[0];
    let deviceSlotConfig = deviceSlot ? deviceSlot.config : {};
    let cmd = '';
    Object.keys(guiSlotConfig).forEach(key => {
        if (deviceSlotConfig[key] !== guiSlotConfig[key]) {
            if (key.indexOf(C.AT_CMD_BTN_MODE) > -1) {
                cmd += key + '\n';
                cmd += guiSlotConfig[key] + '\n';
            } else {
                cmd += key + " " + guiSlotConfig[key] + '\n';
            }
        }
    });
    ATDevice.sendAtCmdForce(cmd);
}

function emitSlotChange() {
    emitConfigChange();
    if (_slotChangeHandler && new Date().getTime() - _lastSlotChangeTime > 200) {
        _lastSlotChangeTime = new Date().getTime();
        _slotChangeHandler();
    }
}

function emitConfigChange() {
    window.dispatchEvent(new CustomEvent(C.EVENT_CONFIG_CHANGED));
}

function setConfigInternal(constant, value, slots) {
    slots = slots && slots[0] ? slots : [_currentSlot];
    slots.forEach(slot => {
        let slotConfig = ATDevice.getSlotConfig(slot);
        if (slotConfig) {
            slotConfig[constant] = value;
        }
    });
    emitConfigChange();
}

ATDevice.getIRCommands = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_LIST).then(result => {
        return Promise.resolve(result.split('\n').map(elem => elem.split(':')[1]).filter(elem => !!elem).map(e => e.trim()));
    });
};

ATDevice.recordIrCommand = function (name) {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_RECORD, name, {timeout: 11000}).then(result => {
        let success = result && result.indexOf(_AT_CMD_IR_TIMEOUT_RESPONSE) === -1;
        return Promise.resolve(success);
    });
};

ATDevice.rotate = function () {
    let currentOrientation = ATDevice.getConfig(C.AT_CMD_ORIENTATION_ANGLE);
    ATDevice.setConfig(C.AT_CMD_ORIENTATION_ANGLE, (currentOrientation + 90) % 360, 0);
    ATDevice.sendATCmd('AT CA');
    ATDevice.planSaving();
};

ATDevice.calibrate = function () {
    ATDevice.sendAtCmdForce('AT CA');
};

ATDevice.setStickMode = function (index) {
    index = parseInt(index);
    if (!C.STICK_MODES.map(mode => mode.value).includes(index)) {
        return;
    }
    ATDevice.planSaving();
    return ATDevice.setConfig(C.AT_CMD_STICK_MODE, index, 0);
};

ATDevice.setAudioVolume = function (volume) {
    let vol = parseInt(volume);
    // console.log("setAudioVolume", volume);
    ATDevice.planSaving();
    return ATDevice.setConfig(C.AT_CMD_AUDIO_VOLUME, vol, 0);
};

ATDevice.startLiveValueListener = function (handler) {
    _liveValueHandler = handler;
};

ATDevice.stopLiveValueListener = function () {
    _liveValueHandler = null;
};

ATDevice.getLiveData = function (constant) {
    if (constant) {
        return _liveData[constant];
    }
    return _liveData;
};

ATDevice.resetMinMaxLiveValues = function () {
    _liveData[C.LIVE_PRESSURE_MIN] = 1024;
    _liveData[C.LIVE_MOV_X_MIN] = 1024;
    _liveData[C.LIVE_MOV_Y_MIN] = 1024;
    _liveData[C.LIVE_PRESSURE_MAX] = -1;
    _liveData[C.LIVE_MOV_X_MAX] = -1;
    _liveData[C.LIVE_MOV_Y_MAX] = -1;
};

ATDevice.updateFirmware = async function (url, progressHandler, dontReset) {
    localStorageService.setFirmwareDownloadUrl(url);
    let serialCommunicator = ATDevice.getCommunicator();
    let failed = false;

    /*
    if (!dontReset) {
        await serialCommunicator.close();
        await TeensyFirmwareUpdater.resetDevice(serialCommunicator.getSerialPort());
    }
    await TeensyFirmwareUpdater.uploadFirmware(url, progressHandler).catch(() => {
        failed = true;
        window.location.reload();
    });
    if (!failed) {
        localStorageService.setFirmwareDownloadUrl('');
        
        if (!window.location.href.includes(C.SUCCESS_FIRMWAREUPDATE)) {
            window.location.replace(window.location.href = window.location.href + '?' + C.SUCCESS_FIRMWAREUPDATE);
        }
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
        */
}

ATDevice.enterFwDownloadMode = async function () {
    let serialCommunicator = ATDevice.getCommunicator();
    await serialCommunicator.close();
    //  await ProMicroFirmwareUpdater.resetDevice(serialCommunicator.getSerialPort());
}

function parseLiveData(data) {
    if (!ATDevice.parseLiveData) {
        return;
    }
    if (Object.keys(_liveData).length === 0) {
        ATDevice.resetMinMaxLiveValues()
    }
    if (!data) {
        return;
    }

    let interval = _liveValueHandler ? 0 : 300;
    if (new Date().getTime() - _lastLiveValueParse > interval) {
        _lastLiveValueParse = new Date().getTime();
        let valArray = data.split(':')[1].split(',');
        _liveData[C.LIVE_PRESSURE] = parseInt(valArray[0]);
        _liveData[C.LIVE_DOWN] = parseInt(valArray[1]);
        _liveData[C.LIVE_UP] = parseInt(valArray[2]);
        _liveData[C.LIVE_RIGHT] = parseInt(valArray[3]);
        _liveData[C.LIVE_LEFT] = parseInt(valArray[4]);
        _liveData[C.LIVE_MOV_X] = parseInt(valArray[5]);
        _liveData[C.LIVE_MOV_Y] = parseInt(valArray[6]);
        if (valArray[7]) {
            _liveData[C.LIVE_BUTTONS] = valArray[7].split('').map(v => v === "1");
        }
        if (valArray[8]) {
            let slot = ATDevice.getSlotName(parseInt(valArray[8]));
            ATDevice.handleSlotChangeFromDevice(slot);
        }
        _liveData[C.LIVE_PRESSURE_MIN] = L.robustMin(_liveData[C.LIVE_PRESSURE_MIN], _liveData[C.LIVE_PRESSURE]);
        _liveData[C.LIVE_MOV_X_MIN] = L.robustMin(_liveData[C.LIVE_MOV_X_MIN], _liveData[C.LIVE_MOV_X]);
        _liveData[C.LIVE_MOV_Y_MIN] = L.robustMin(_liveData[C.LIVE_MOV_Y_MIN], _liveData[C.LIVE_MOV_Y]);
        _liveData[C.LIVE_PRESSURE_MAX] = L.robustMax(_liveData[C.LIVE_PRESSURE_MAX], _liveData[C.LIVE_PRESSURE]);
        _liveData[C.LIVE_MOV_X_MAX] = L.robustMax(_liveData[C.LIVE_MOV_X_MAX], _liveData[C.LIVE_MOV_X]);
        _liveData[C.LIVE_MOV_Y_MAX] = L.robustMax(_liveData[C.LIVE_MOV_Y_MAX], _liveData[C.LIVE_MOV_Y]);

        if (_liveValueHandler) {
            _liveValueHandler(_liveData);
        }
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
        //sending in one command because two are not possible in beforeunload
        let cmd = C.AT_CMD_SAVE_SLOT + ' ' + _currentSlot + '\n' + C.AT_CMD_STOP_REPORTING_LIVE;
        if (_testModeOptions.enabled) {
            cmd = C.AT_CMD_LOAD_SLOT + ' ' + _currentDeviceSlot + '\n' + C.AT_CMD_STOP_REPORTING_LIVE;
        }
        ATDevice.sendAtCmdForce(cmd, "", {
            close: true
        });
    }
});


ATDevice.setLiveValueHandler(parseLiveData);

export {ATDevice};
