import {ATDevice} from "../../js/communication/ATDevice.js";

let FLipMouse = {};
let _AT_CMD_IR_TIMEOUT_RESPONSE = 'IR_TIMEOUT';

FLipMouse.getIRCommands = function () {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_LIST).then(result => {
        return Promise.resolve(result.split('\n').map(elem => elem.split(':')[1]).filter(elem => !!elem).map(e => e.trim()));
    });
}

FLipMouse.recordIrCommand = function (name) {
    return ATDevice.sendAtCmdWithResult(C.AT_CMD_IR_RECORD, name, 11000).then(result => {
        let success = result && result.indexOf(_AT_CMD_IR_TIMEOUT_RESPONSE) === -1;
        return Promise.resolve(success);
    });
}

export {FLipMouse};