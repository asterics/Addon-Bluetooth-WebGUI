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

firmwareUtil.extractBoardValue = function (versionSuffix) {
    const match = versionSuffix.match(/Board=([^\s,]+)/);
    return match ? match[1].trim() : null;
}


firmwareUtil.getBTFWInfo = function () {
    return getFWInfo('https://api.github.com/repos/asterics/esp32_mouse_keyboard/releases/latest', '.bin');  // TBD: use .fm3 for new firmware versions?
}

firmwareUtil.getDeviceFWInfo = function (device, majorVersion) {

    let assetPostfix = C.CURRENT_DEVICE;
    let fwURL = 'https://api.github.com/repos/asterics/FabiWare/releases/latest';
    let boardValue = firmwareUtil.extractBoardValue(ATDevice.getVersionSuffix());
    if (boardValue === 'Raspberry_Pi_Pico_2W' || boardValue === 'Raspberry_Pi_Pico_2') {
        assetPostfix += '_RP2350.uf2';
    } else if (boardValue === 'Raspberry_Pi_Pico_W' || boardValue === 'Raspberry_Pi_Pico') {
        assetPostfix += '_RP2040.uf2';
    } else if (boardValue === 'ARDUINO_NANO_RP2040_CONNECT') {
        assetPostfix = 'FLIPMOUSE.uf2';
    }
    console.log('Microcontroller board=', boardValue );
    console.log('Release asset API URL='+ fwURL + ', Asset filter=' + assetPostfix);
 
     let fwInfo = getFWInfo(fwURL, assetPostfix);  
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
        let binaryAssets = result.assets;
        let filteredAsset= binaryAssets.filter(asset => asset.name.indexOf(binaryStringFilter) > -1)[0];
        console.log('Firmware assets:', binaryAssets);        
        console.log('Filtered asset:', filteredAsset);

        return {
            version: L.formatVersion(result['tag_name']),
            infoUrl: result['html_url'],
            downloadUrl: 'https://proxy.asterics-foundation.org/proxybase64url.php?csurl=' + encodeURIComponent(btoa(filteredAsset.browser_download_url)),
            originalDownloadUrl: filteredAsset.browser_download_url
        };
    });
}

export { firmwareUtil };