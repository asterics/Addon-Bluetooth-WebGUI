import {ATDevice} from "../js/communication/ATDevice.js";
import {FLipMouse} from "./communication/FLipMouse.js";

window.addEventListener('keydown', event => {
    if (event.key === 'c' && event.ctrlKey) {
        if (ATDevice.isInitialized()) {
            FLipMouse.calibrate();
        }
    }
})
