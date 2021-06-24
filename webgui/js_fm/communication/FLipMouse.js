import {ATDevice} from "../../js/communication/ATDevice.js";

let FLipMouse = {};
FLipMouse.LIVE_PRESSURE = 'LIVE_PRESSURE';
FLipMouse.LIVE_UP = 'LIVE_UP';
FLipMouse.LIVE_DOWN = 'LIVE_DOWN';
FLipMouse.LIVE_LEFT = 'LIVE_LEFT';
FLipMouse.LIVE_RIGHT = 'LIVE_RIGHT';
FLipMouse.LIVE_MOV_X = 'LIVE_MOV_X';
FLipMouse.LIVE_MOV_Y = 'LIVE_MOV_Y';
FLipMouse.LIVE_MOV_X_MIN = 'LIVE_MOV_X_MIN';
FLipMouse.LIVE_MOV_X_MAX = 'LIVE_MOV_X_MAX';
FLipMouse.LIVE_MOV_Y_MIN = 'LIVE_MOV_Y_MIN';
FLipMouse.LIVE_MOV_Y_MAX = 'LIVE_MOV_Y_MAX';
FLipMouse.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
FLipMouse.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';
FLipMouse.LIVE_BUTTONS = 'LIVE_BUTTONS';

let _AT_CMD_IR_TIMEOUT_RESPONSE = 'IR_TIMEOUT';
let _liveData = {};
let _liveValueHandler = null;
let _lastLiveValueParse = 0;

FLipMouse.getIRCommands = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_LIST).then(result => {
        return Promise.resolve(result.split('\n').map(elem => elem.split(':')[1]).filter(elem => !!elem).map(e => e.trim()));
    });
};

FLipMouse.recordIrCommand = function (name) {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_RECORD, name, 11000).then(result => {
        let success = result && result.indexOf(_AT_CMD_IR_TIMEOUT_RESPONSE) === -1;
        return Promise.resolve(success);
    });
};

FLipMouse.rotate = function () {
    let currentOrientation = ATDevice.getConfig(C.AT_CMD_ORIENTATION_ANGLE);
    ATDevice.setConfig(C.AT_CMD_ORIENTATION_ANGLE, (currentOrientation + 90) % 360, 0);
    ATDevice.sendATCmd('AT CA');
    ATDevice.planSaving();
};

FLipMouse.calibrate = function () {
    ATDevice.sendATCmd('AT CA');
};

FLipMouse.setFlipmouseMode = function (index) {
    index = parseInt(index);
    if (!C.FLIPMOUSE_MODES.map(mode => mode.value).includes(index)) {
        return;
    }
    ATDevice.setConfig(C.AT_CMD_FLIPMOUSE_MODE, index, 0);
    ATDevice.planSaving();
};

FLipMouse.startLiveValueListener = function (handler) {
    _liveValueHandler = handler;
};

FLipMouse.stopLiveValueListener = function () {
    _liveValueHandler = null;
};

FLipMouse.getLiveData = function (constant) {
    if (constant) {
        return _liveData[constant];
    }
    return _liveData;
};

FLipMouse.resetMinMaxLiveValues = function () {
    _liveData[FLipMouse.LIVE_PRESSURE_MIN] = 1024;
    _liveData[FLipMouse.LIVE_MOV_X_MIN] = 1024;
    _liveData[FLipMouse.LIVE_MOV_Y_MIN] = 1024;
    _liveData[FLipMouse.LIVE_PRESSURE_MAX] = -1;
    _liveData[FLipMouse.LIVE_MOV_X_MAX] = -1;
    _liveData[FLipMouse.LIVE_MOV_Y_MAX] = -1;
};

function parseLiveData(data) {
    if (Object.keys(_liveData).length === 0) {
        FLipMouse.resetMinMaxLiveValues()
    }
    if (!data) {
        return;
    }

    let interval = _liveValueHandler ? 0 : 300;
    if (new Date().getTime() - _lastLiveValueParse > interval) {
        _lastLiveValueParse = new Date().getTime();
        let valArray = data.split(':')[1].split(',');
        _liveData[FLipMouse.LIVE_PRESSURE] = parseInt(valArray[0]);
        _liveData[FLipMouse.LIVE_UP] = parseInt(valArray[1]);
        _liveData[FLipMouse.LIVE_DOWN] = parseInt(valArray[2]);
        _liveData[FLipMouse.LIVE_LEFT] = parseInt(valArray[3]);
        _liveData[FLipMouse.LIVE_RIGHT] = parseInt(valArray[4]);
        _liveData[FLipMouse.LIVE_MOV_X] = parseInt(valArray[5]);
        _liveData[FLipMouse.LIVE_MOV_Y] = parseInt(valArray[6]);
        if (valArray[7]) {
            _liveData[FLipMouse.LIVE_BUTTONS] = valArray[7].split('').map(v => v === "1");
        }
        if (valArray[8]) {
            let slot = ATDevice.getSlotName(parseInt(valArray[8]));
            if (slot && slot !== ATDevice.getCurrentSlot()) {
                ATDevice.setSlot(slot, true);
            }
        }
        _liveData[FLipMouse.LIVE_PRESSURE_MIN] = Math.min(_liveData[FLipMouse.LIVE_PRESSURE_MIN], _liveData[FLipMouse.LIVE_PRESSURE]);
        _liveData[FLipMouse.LIVE_MOV_X_MIN] = Math.min(_liveData[FLipMouse.LIVE_MOV_X_MIN], _liveData[FLipMouse.LIVE_MOV_X]);
        _liveData[FLipMouse.LIVE_MOV_Y_MIN] = Math.min(_liveData[FLipMouse.LIVE_MOV_Y_MIN], _liveData[FLipMouse.LIVE_MOV_Y]);
        _liveData[FLipMouse.LIVE_PRESSURE_MAX] = Math.max(_liveData[FLipMouse.LIVE_PRESSURE_MAX], _liveData[FLipMouse.LIVE_PRESSURE]);
        _liveData[FLipMouse.LIVE_MOV_X_MAX] = Math.max(_liveData[FLipMouse.LIVE_MOV_X_MAX], _liveData[FLipMouse.LIVE_MOV_X]);
        _liveData[FLipMouse.LIVE_MOV_Y_MAX] = Math.max(_liveData[FLipMouse.LIVE_MOV_Y_MAX], _liveData[FLipMouse.LIVE_MOV_Y]);

        if (_liveValueHandler) {
            _liveValueHandler(_liveData);
        }
    }
}

ATDevice.setLiveValueHandler(parseLiveData);

export {FLipMouse};
export default FLipMouse;