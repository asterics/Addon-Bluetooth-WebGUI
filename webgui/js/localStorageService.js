let localStorageService = {};
let KEY_PREFIX = 'FMFABI_';
let KEY_FRIMWARE_DOWNLOAD_URL = 'WEBGUI_KEY_FRIMWARE_DOWNLOAD_URL';
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
            return storage.setItem(KEY_PREFIX + key, JSON.stringify(value));
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.get = function (key) {
    if (storage) {
        try {
            let value = storage.getItem(KEY_PREFIX + key);
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
    return storage.getItem(KEY_PREFIX + key) !== null;
}

localStorageService.getFirmwareDownloadUrl = function () {
    return localStorageService.get(KEY_FRIMWARE_DOWNLOAD_URL) || "";
};

localStorageService.setFirmwareDownloadUrl = function (downloadUrl) {
    return localStorageService.save(KEY_FRIMWARE_DOWNLOAD_URL, downloadUrl);
};

export {localStorageService};