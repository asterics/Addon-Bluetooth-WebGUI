import {ATDevice} from "../../js/communication/ATDevice.js";
import {localStorageService} from "../../js/localStorageService.js";
import {ProMicroFirmwareUpdater} from "./ProMicroFirmwareUpdater.js";

let FABI = {};
FABI.LIVE_PRESSURE = 'LIVE_PRESSURE';
FABI.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
FABI.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';
FABI.LIVE_BUTTONS = 'LIVE_BUTTONS';

let _liveData = {};
let _liveValueHandler = null;
let _lastLiveValueParse = 0;

FABI.Updater = ProMicroFirmwareUpdater;

FABI.startLiveValueListener = function (handler) {
    _liveValueHandler = handler;
};

FABI.stopLiveValueListener = function () {
    _liveValueHandler = null;
};

FABI.getLiveData = function (constant) {
    if (constant) {
        return _liveData[constant];
    }
    return _liveData;
};

FABI.resetMinMaxLiveValues = function () {
    _liveData[FABI.LIVE_PRESSURE_MIN] = 1024;
    _liveData[FABI.LIVE_PRESSURE_MAX] = -1;
};

FABI.updateFirmware = async function (url, progressHandler, dontReset) {
    localStorageService.setFirmwareDownloadUrl('');
    let serialCommunicator = ATDevice.getCommunicator();
    if (!dontReset) {
        await serialCommunicator.close();
        await ProMicroFirmwareUpdater.resetDevice(serialCommunicator.getSerialPort());
    }
    await ProMicroFirmwareUpdater.uploadFirmware(url, progressHandler);
    if (!window.location.href.includes(C.SUCCESS_FIRMWAREUPDATE)) {
        window.location.replace(window.location.href = window.location.href + '?' + C.SUCCESS_FIRMWAREUPDATE);
    }
    setTimeout(() => {
        window.location.reload();
    }, 100);
}

function parseLiveData(data) {
    if (!ATDevice.parseLiveData) {
        return;
    }
    if (Object.keys(_liveData).length === 0) {
        FABI.resetMinMaxLiveValues()
    }
    if (!data) {
        return;
    }

    let interval = _liveValueHandler ? 0 : 300;
    if (new Date().getTime() - _lastLiveValueParse > interval) {
        _lastLiveValueParse = new Date().getTime();
        let valArray = data.split(':')[1].split(',');
        _liveData[FABI.LIVE_PRESSURE] = parseInt(valArray[0]);
        if (valArray[1]) {
            _liveData[FABI.LIVE_BUTTONS] = valArray[1].split('').map(v => v === "1");
        }
        if (valArray[2]) {
            let slot = ATDevice.getSlotName(parseInt(valArray[2]));
            ATDevice.handleSlotChangeFromDevice(slot);
        }
        _liveData[FABI.LIVE_PRESSURE_MIN] = L.robustMin(_liveData[FABI.LIVE_PRESSURE_MIN], _liveData[FABI.LIVE_PRESSURE]);
        _liveData[FABI.LIVE_PRESSURE_MAX] = L.robustMax(_liveData[FABI.LIVE_PRESSURE_MAX], _liveData[FABI.LIVE_PRESSURE]);

        if (_liveValueHandler) {
            _liveValueHandler(_liveData);
        }
    }
}

if (C.DEVICE_IS_FABI) {
    ATDevice.setLiveValueHandler(parseLiveData);
}

export {FABI};
export default FABI;