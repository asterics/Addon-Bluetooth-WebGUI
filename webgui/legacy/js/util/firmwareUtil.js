import { L } from "../lquery.js";
import { ATDevice } from "../communication/ATDevice.js";


let firmwareUtil = {};

// Intel HEX parser by https://github.com/bminer/intel-hex.js
//Intel Hex record types
const DATA = 0,
    END_OF_FILE = 1,
    EXT_SEGMENT_ADDR = 2,
    START_SEGMENT_ADDR = 3,
    EXT_LINEAR_ADDR = 4,
    START_LINEAR_ADDR = 5;

const EMPTY_VALUE = 0xFF;

//credits: https://stackoverflow.com/questions/38987784/how-to-convert-a-hexadecimal-string-to-uint8array-and-back-in-javascript
const fromHexString = hexString =>
    new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

//credits: https://www.geeksforgeeks.org/how-to-delay-a-loop-in-javascript-using-async-await-with-promise/
firmwareUtil.wait = function (milliseconds) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve('')
        }, milliseconds);
    })
}

/* intel_hex.parse(data)
`data` - Intel Hex file (string in ASCII format or Buffer Object)
`bufferSize` - the size of the Buffer containing the data (optional)

returns an Object with the following properties:
- data - data as a Buffer Object, padded with 0xFF
where data is empty.
- startSegmentAddress - the address provided by the last
start segment address record; null, if not given
- startLinearAddress - the address provided by the last
start linear address record; null, if not given
Special thanks to: http://en.wikipedia.org/wiki/Intel_HEX
*/
firmwareUtil.parseIntelHex = function (data, bufferSize) {
    //if(data instanceof Buffer)
    data = data.toString("ascii");
    //Initialization
    var buf = new Uint8Array(bufferSize); //max. words in mega32u4
    var bufLength = 0, //Length of data in the buffer
        highAddress = 0, //upper address
        startSegmentAddress = null,
        startLinearAddress = null,
        lineNum = 0, //Line number in the Intel Hex string
        pos = 0; //Current position in the Intel Hex string

    const SMALLEST_LINE = 11;

    while (pos + SMALLEST_LINE <= data.length) {
        //Parse an entire line
        if (data.charAt(pos++) != ":")
            throw new Error("Line " + (lineNum + 1) +
                " does not start with a colon (:).");
        else
            lineNum++;
        //Number of bytes (hex digit pairs) in the data field
        var dataLength = parseInt(data.substr(pos, 2), 16);
        pos += 2;
        //Get 16-bit address (big-endian)
        var lowAddress = parseInt(data.substr(pos, 4), 16);
        pos += 4;
        //Record type
        var recordType = parseInt(data.substr(pos, 2), 16);
        pos += 2;
        //Data field (hex-encoded string)
        var dataField = data.substr(pos, dataLength * 2);
        if (dataLength) var dataFieldBuf = fromHexString(dataField);
        else var dataFieldBuf = new Uint8Array();
        pos += dataLength * 2;
        //Checksum
        var checksum = parseInt(data.substr(pos, 2), 16);
        pos += 2;
        //Validate checksum
        var calcChecksum = (dataLength + (lowAddress >> 8) +
            lowAddress + recordType) & 0xFF;
        for (var i = 0; i < dataLength; i++)
            calcChecksum = (calcChecksum + dataFieldBuf[i]) & 0xFF;
        calcChecksum = (0x100 - calcChecksum) & 0xFF;
        if (checksum != calcChecksum)
            throw new Error("Invalid checksum on line " + lineNum +
                ": got " + checksum + ", but expected " + calcChecksum);
        //Parse the record based on its recordType
        switch (recordType) {
            case DATA:
                var absoluteAddress = highAddress + lowAddress;
                //Expand buf, if necessary
                /*if(absoluteAddress + dataLength >= buf.length)
                {
                    var tmp = Buffer.alloc((absoluteAddress + dataLength) * 2);
                    buf.copy(tmp, 0, 0, bufLength);
                    buf = tmp;
                }*/
                //Write over skipped bytes with EMPTY_VALUE
                if (absoluteAddress > bufLength)
                    buf.fill(EMPTY_VALUE, bufLength, absoluteAddress);
                //Write the dataFieldBuf to buf
                //dataFieldBuf.copy(buf, absoluteAddress);
                dataFieldBuf.forEach(function (val, index) {
                    buf[absoluteAddress + index] = val;
                });
                bufLength = Math.max(bufLength, absoluteAddress + dataLength);
                break;
            case END_OF_FILE:
                if (dataLength != 0)
                    throw new Error("Invalid EOF record on line " +
                        lineNum + ".");
                return {
                    "data": buf.slice(0, bufLength),
                    "startSegmentAddress": startSegmentAddress,
                    "startLinearAddress": startLinearAddress
                };
                break;
            case EXT_SEGMENT_ADDR:
                if (dataLength != 2 || lowAddress != 0)
                    throw new Error("Invalid extended segment address record on line " +
                        lineNum + ".");
                highAddress = parseInt(dataField, 16) << 4;
                break;
            case START_SEGMENT_ADDR:
                if (dataLength != 4 || lowAddress != 0)
                    throw new Error("Invalid start segment address record on line " +
                        lineNum + ".");
                startSegmentAddress = parseInt(dataField, 16);
                break;
            case EXT_LINEAR_ADDR:
                if (dataLength != 2 || lowAddress != 0)
                    throw new Error("Invalid extended linear address record on line " +
                        lineNum + ".");
                highAddress = parseInt(dataField, 16) << 16;
                break;
            case START_LINEAR_ADDR:
                if (dataLength != 4 || lowAddress != 0)
                    throw new Error("Invalid start linear address record on line " +
                        lineNum + ".");
                startLinearAddress = parseInt(dataField, 16);
                break;
            default:
                throw new Error("Invalid record type (" + recordType +
                    ") on line " + lineNum);
                break;
        }
        //Advance to the next line
        if (data.charAt(pos) == "\r")
            pos++;
        if (data.charAt(pos) == "\n")
            pos++;
    }
    throw new Error("Unexpected end of input: missing or invalid EOF record.");
};

firmwareUtil.getBTFWInfo = function () {
    return getFWInfo('https://api.github.com/repos/asterics/esp32_mouse_keyboard/releases/latest', '.bin');
}

firmwareUtil.getDeviceFWInfo = function (device, majorVersion) {
    device = device || C.CURRENT_DEVICE;
    majorVersion = majorVersion || ATDevice.getMajorVersion();
    let deviceIsFM = device === C.AT_DEVICE_FLIPMOUSE;
    let repoName = C.CURRENT_DEVICE;
    if (deviceIsFM && majorVersion === 2) {
        repoName = "FLipMouse-v2";
    }
    let fileType = deviceIsFM && majorVersion === 3 ? '.uf2' : '.hex';
    return getFWInfo(`https://api.github.com/repos/asterics/${repoName}/releases/latest`, fileType);
}

firmwareUtil.updateDeviceFirmware = function (progressHandler) {
    progressHandler = progressHandler || (() => { });
    firmwareUtil.getDeviceFWInfo().then(result => {

        let message, deviceName;

        if ((ATDevice.isMajorVersion(2)) || (ATDevice.isMajorVersion(1)) && C.DEVICE_IS_FABI) {
            message = 'Fabi V2 or older: Do you want to update the firmware to version {?}? After confirming this message you have to re-select the device ("{?}") in a browser popup. Keep this tab open and in foreground while updating! // Möchten Sie die Firmware auf Version {?} aktualisieren? Nach Bestätigung dieser Meldung müssen Sie das Gerät erneut in einem Browser-Popup auswählen ("{?}"). Lassen Sie diesen Tab während dem Update im Vordergrund geöffnet!';
            deviceName = C.DEVICE_IS_FM_OR_PAD ? L.translate('Unknown device // Unbekanntes Gerät') : 'Arduino Leonardo/Mirco';

        } else if (ATDevice.isMajorVersion(3) && C.DEVICE_IS_FABI) {
            message = 'Fabi V3: Do you want to update the firmware to version {?}? After confirming this message you have to add the .UF2 file in the ("{?}") device and save it. // Möchten Sie die Firmware auf Version {?} aktualisieren? Nach Bestätigung dieser Meldung müssen Sie die .UF2 Datei im ("{?}") Gerät hinzufügen und speichern.';
            deviceName = C.DEVICE_IS_FM_OR_PAD ? L.translate('Unknown device // Unbekanntes Gerät') : 'RPi PicoW'; // ASK: Whether the device is correct. 

        } else if (C.DEVICE_IS_FM_OR_PAD) { // This is completely useless. For some weird reason it never comes in here and just uses the Modal (FirmwareUpdateModal).
            message = 'Reset Firmware on FM.';
            deviceName = C.DEVICE_IS_FABI ? L.translate('Unknown device // Unbekanntes Gerät') : 'Arduino Nano RP2040 Connect';
        }

        if (!confirm(L.translate(message, result.version, deviceName))) {
            return;
        }
        progressHandler(1);
        ATDevice.Specific.updateFirmware(result.downloadUrl, progressHandler);
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