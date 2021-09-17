import {ATDevice} from "./communication/ATDevice.js";
import {MainView} from "./ui/views/MainView.js";
import {TabStick} from "../js_fm/ui/views/TabStick.js";
import {TabVisualization} from "../js_fm/ui/views/TabVisualization.js";

if (C.DEVICE_IS_FM) {
    window.addEventListener('keydown', event => {
        if (event.key === 'c' && event.ctrlKey) {
            if (ATDevice.isInitialized()) {
                ATDevice.Specific.calibrate();
            }
        }
        if (event.key === 'b' && event.ctrlKey) {
            event.preventDefault();
            if (TabStick.instance) {
                TabStick.instance.toggleShowBars();
            }
            if (TabVisualization.instance) {
                TabVisualization.instance.toggleState('showAnalogBars');
                TabVisualization.instance.toggleState('showAnalogValues');
            }
        }
    });
}

window.addEventListener('keydown', event => {
    if (event.key === ' ' && event.ctrlKey) {
        event.preventDefault();
        MainView.instance.toLastView();
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
