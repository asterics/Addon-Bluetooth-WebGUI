let localStorageService = {};
let KEY_FRIMWARE_DOWNLOAD_URL = 'FMFABI_WEBGUI_KEY_FRIMWARE_DOWNLOAD_URL';
let KEY_CONFIG_TAB_ACTIONS = 'FMFABI_KEY_CONFIG_TAB_ACTIONS';
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
            return storage.setItem(key, value);
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.get = function (key) {
    if (storage) {
        try {
            return storage.getItem(key);
        } catch (e) {
            log.error(e)
        }
    }
};

localStorageService.getFirmwareDownloadUrl = function () {
    return localStorageService.get(KEY_FRIMWARE_DOWNLOAD_URL) || "";
};

localStorageService.setFirmwareDownloadUrl = function (downloadUrl) {
    return localStorageService.save(KEY_FRIMWARE_DOWNLOAD_URL, downloadUrl);
};

localStorageService.getTabActionConfig = function () {
    let value = localStorageService.get(KEY_CONFIG_TAB_ACTIONS);
    return value ? JSON.parse(value) : {};
};

localStorageService.setTabActionConfig = function (value) {
    return localStorageService.save(KEY_CONFIG_TAB_ACTIONS, JSON.stringify(value));
};

export {localStorageService};