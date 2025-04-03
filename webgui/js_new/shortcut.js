import {ATDevice} from "./communication/ATDevice.js";
import {MainView} from "./ui/views/MainView.js";
import {helpUtil} from "./util/helpUtil.js";

if (C.DEVICE_IS_FM_OR_PAD) {
    window.addEventListener('keydown', event => {
        if (event.key === 'c' && event.ctrlKey) {
            if (ATDevice.isInitialized()) {
                ATDevice.Specific.calibrate();
            }
        }
        if (event.key === 'b' && event.ctrlKey) {
            event.preventDefault();
        }
    });
}

window.addEventListener('keydown', event => {
    if (event.key === ' ' && event.ctrlKey) {
        event.preventDefault();
        MainView.instance.toLastView();
    }
    if (event.key === 'F1') {
        event.preventDefault();
        helpUtil.openHelp();
    }
});

for (let i = 0; i < C.VIEWS.length; i++) {
    window.addEventListener('keydown', event => {
        if (event.key === (i + 1) + '' && event.ctrlKey) {
            event.preventDefault();
            MainView.instance.toView(C.VIEWS[i].hash);
        }
    })
}