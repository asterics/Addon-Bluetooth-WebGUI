import { L } from "../lquery.js";
import { ATDevice } from "../communication/ATDevice.js";


let firmwareUtil = {};

//credits: https://www.geeksforgeeks.org/how-to-delay-a-loop-in-javascript-using-async-await-with-promise/
firmwareUtil.wait = function (milliseconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('')
        }, milliseconds);
    })
}


firmwareUtil.getBTFWInfo = function () {
    return getFWInfo('https://api.github.com/repos/asterics/esp32_mouse_keyboard/releases/latest', '.bin');  // TBD: use .fm3 for new firmware versions?
}

firmwareUtil.getDeviceFWInfo = function (device, majorVersion) {
    // TBD: handle new firmware versions for different RP2040 devices!
    let repoName = C.CURRENT_DEVICE;
    let fileType = '.uf2';
    let fwInfo = getFWInfo(`https://api.github.com/repos/asterics/${repoName}/releases/latest`, '.uf2');  
    console.log('firmwareUtil.getDeviceFWInfo: ', repoName, fwInfo);
    return fwInfo;  
}

firmwareUtil.updateDeviceFirmware = function (progressHandler) {
    progressHandler = progressHandler || (() => { });
    firmwareUtil.getDeviceFWInfo().then(result => {

        let message, deviceName;

        message = 'Do you want to update the firmware to version {?}? After confirming this message, put the downloaded .UF2 file to the ("{?}") drive. // Möchten Sie die Firmware auf Version {?} aktualisieren? Nach Bestätigung dieser Meldung bitte die heruntergeladene .UF2 Datei im ("{?}") Laufwerk ablegen.';
        if (C.DEVICE_IS_FM) {
            deviceName = 'Arduino Nano RP2040 Connect';
        } else {
            deviceName = 'Raspberry Pi Pico';
        }

        if (!confirm(L.translate(message, result.version, deviceName))) {
            return;
        }
        progressHandler(1);
        ATDevice.updateFirmware(result.downloadUrl, progressHandler);
    });
}

function getFWInfo(apiUrl, binaryStringFilter) {
    return L.HTTPRequest(apiUrl, 'GET', 'json').then(result => {
        let binaryAsset = result.assets.filter(asset => asset.name.indexOf(binaryStringFilter) > -1)[0];
        return {
            version: L.formatVersion(result['tag_name']),
            infoUrl: result['html_url'],
            downloadUrl: 'https://proxy.asterics-foundation.org/proxybase64url.php?csurl=' + encodeURIComponent(btoa(binaryAsset.browser_download_url)),
            originalDownloadUrl: binaryAsset.browser_download_url
        };
    });
}

export { firmwareUtil };