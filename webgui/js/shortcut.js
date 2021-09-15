import {ATDevice} from "./communication/ATDevice.js";
import {MainView} from "./ui/views/MainView.js";

if (C.DEVICE_IS_FM) {
    window.addEventListener('keydown', event => {
        if (event.key === 'c' && event.ctrlKey) {
            if (ATDevice.isInitialized()) {
                ATDevice.Specific.calibrate();
            }
        }
    })
}

window.addEventListener('keydown', event => {
    if (event.key === ' ' && event.ctrlKey) {
        event.preventDefault();
        MainView.instance.toLastView();
    }
})

for (let i = 0; i < C.VIEWS.length; i++) {
    window.addEventListener('keydown', event => {
        if (event.key === (i + 1) + '' && event.ctrlKey) {
            event.preventDefault();
            MainView.instance.toView(C.VIEWS[i].hash);
        }
    })
}
