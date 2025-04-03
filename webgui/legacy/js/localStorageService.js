let localStorageService = {};
let KEY_FIRMWARE_DOWNLOAD_URL = 'WEBGUI_KEY_FIRMWARE_DOWNLOAD_URL';
let storage = null;

if (typeof (Storage) !== "undefined") {
    try {
        storage = window.localStorage;
    } catch (e) {
        log.error('could not access local storage, maybe disabled by user? Error: ' + e)
    }

}

localStorageService.save = function (key, value) {
    if (storage) {
        try {
            return storage.setItem(C.CURRENT_DEVICE + key, JSON.stringify(value));
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.get = function (key) {
    if (storage) {
        try {
            let value = storage.getItem(C.CURRENT_DEVICE + key);
            if (value === 'undefined') {
                return undefined;
            }
            return value ? JSON.parse(value) : value;
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.hasKey = function (key) {
    return storage.getItem(C.CURRENT_DEVICE + key) !== null;
}

localStorageService.getFirmwareDownloadUrl = function () {
    return localStorageService.get(KEY_FIRMWARE_DOWNLOAD_URL) || "";
};

localStorageService.setFirmwareDownloadUrl = function (downloadUrl) {
    return localStorageService.save(KEY_FIRMWARE_DOWNLOAD_URL, downloadUrl);
};

export {localStorageService};