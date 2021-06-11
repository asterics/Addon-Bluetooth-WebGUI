import {ATDevice} from "../js/communication/ATDevice.js";

window.addEventListener('keydown', event => {
    if (event.key === 'c' && event.ctrlKey) {
        if (ATDevice.isInitialized()) {
            ATDevice.calibrate();
        }
    }
})
