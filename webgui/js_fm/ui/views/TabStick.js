import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../components/PositionVisualization.js";
import {preactUtil} from "../../util/preactUtil.js";
import {RadioFieldset} from "../../../js/ui/components/RadioFieldset.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipMouse} from "../../communication/FLipMouse.js";

const html = htm.bind(h);

class TabStick extends Component {
    constructor() {
        super();

        this.state = {
            splitSensitivity: ATDevice.getConfig(C.AT_CMD_SENSITIVITY_X) !== ATDevice.getConfig(C.AT_CMD_SENSITIVITY_Y),
            splitDeadzone: ATDevice.getConfig(C.AT_CMD_DEADZONE_X) !== ATDevice.getConfig(C.AT_CMD_DEADZONE_Y),
            mouseMode: ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE)
        }

        let additionalState = {};
        additionalState[C.AT_CMD_SENSITIVITY_X] = ATDevice.getConfig(C.AT_CMD_SENSITIVITY_X);
        additionalState[C.AT_CMD_SENSITIVITY_Y] = ATDevice.getConfig(C.AT_CMD_SENSITIVITY_Y);
        additionalState[C.AT_CMD_DEADZONE_X] = ATDevice.getConfig(C.AT_CMD_DEADZONE_X);
        additionalState[C.AT_CMD_DEADZONE_Y] = ATDevice.getConfig(C.AT_CMD_DEADZONE_Y);
        this.setState(additionalState);

        FLipMouse.resetMinMaxLiveValues();
    }
    
    sliderChanged(event, constants) {
        this.valueChanged(event.target.value, constants);
    }

    valueChanged(value, constants) {
        let state = {};
        constants.forEach(constant => {
            state[constant] = value;
            ATDevice.setConfig(constant, value);
        });
        this.setState(state);
    }

    toggleState(toggleName, updateConstants) {
        preactUtil.toggleState(this, toggleName);
        this.valueChanged(this.state[updateConstants[0]], updateConstants);
    }
    
    render() {
        let state = this.state;

        return html`
            <h2>${L.translate('Stick configuration (slot "{?}") // Stick-Konfiguration (Slot "{?}")', ATDevice.getCurrentSlot())}</h2>
            <span id="posLiveA11yLabel" class="sr-only">${L.translate('Current position of FLipMouse Stick // Aktuelle Position des Sticks der FLipMouse')}</span>
            <span id="posLiveA11y" aria-describedby="posLiveA11yLabel" class="onlyscreenreader" role="status" aria-live="off" accesskey="q" tabindex="-1"></span>
            <div class="mb-5">
                ${html`<${RadioFieldset} legend="Use stick for: // Verwende Stick für:" onchange="${(value) => FLipMouse.setFlipmouseMode(value)}" elements="${C.FLIPMOUSE_MODES}" value="${state.mouseMode}"/>`}
            </div>
            <div id="basic-SENSITIVITY-single" style="display: ${!state.splitSensitivity ? 'block' : 'none'}">
                <label for="SENSITIVITY">${L.translate('Sensitivity: // Sensitivität:')}</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_X])}">${L.translate('show x/y separately // zeige x/y getrennt')}</a>
                <div class="row">
                    <span aria-hidden="true" id="SENSITIVITY_VAL" class="text-center one column">${state[C.AT_CMD_SENSITIVITY_X]}</span>
                    <input type="range" value="${state[C.AT_CMD_SENSITIVITY_X]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}"
                           id="SENSITIVITY" min="0" max="255" class="eleven columns" accesskey="a"/>
                </div>
            </div>
            <div id="basic-SENSITIVITY-xy" style="display: ${state.splitSensitivity ? 'block' : 'none'}">
                <label for="SENSITIVITY_X">${L.translate('Horizontal Sensitivity: // Sensitivität horizontal:')}</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}">${L.translate('hide separate x/y // zeige  x/y gemeinsam')}</a>
                <div class="row">
                    <span id="SENSITIVITY_X_VAL" class="text-center one column">${state[C.AT_CMD_SENSITIVITY_X]}</span>
                    <input type="range" value="${state[C.AT_CMD_SENSITIVITY_X]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_SENSITIVITY_X])}"
                           id="SENSITIVITY_X" min="0" max="255" class="eleven columns"/>
                </div>
                <label for="SENSITIVITY_Y">${L.translate('Vertical Sensitivity: // Sensitivität vertikal:')}</label>
                <div class="row">
                    <span id="SENSITIVITY_Y_VAL" class="text-center one column">${state[C.AT_CMD_SENSITIVITY_Y]}</span>
                    <input type="range" value="${state[C.AT_CMD_SENSITIVITY_Y]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_SENSITIVITY_Y])}"
                           id="SENSITIVITY_Y" min="0" max="255" class="eleven columns"/>
                </div>
            </div>

            <br/>
            <div class="row">
                <div id="posVisBasic" class="six columns">
                    <${PositionVisualization} mode="tabStick"/>
                </div>
                <div class="five columns">
                    <button onclick="${() => FLipMouse.calibrate()}">
                        <span>${L.translate('Calibrate middle position // Mittelposition kalibrieren')}</span>
                    </button>
                    <button onclick="${() => FLipMouse.rotate()}">
                        <span>${L.translate('\u21BB Rotate right // \u21BB Nach rechts drehen')}</span>
                    </button>
                </div>
            </div>

            <br/>
            <div id="basic-DEADZONE-single" style="display: ${!state.splitDeadzone ? 'block' : 'none'}">
                <label lang="en" for="DEADZONE">Deadzone:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitDeadzone', [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}">${L.translate('show x/y separately // zeige x/y getrennt')}</a>
                <div class="row">
                    <span aria-hidden="true" id="DEADZONE_VAL" class="text-center one column">${state[C.AT_CMD_DEADZONE_X]}</span>
                    <input type="range" value="${state[C.AT_CMD_DEADZONE_X]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}" id="DEADZONE" min="0" max="650" class="eleven columns" accesskey="s"/>
                </div>
            </div>
            <div id="basic-DEADZONE-xy" style="display: ${state.splitDeadzone ? 'block' : 'none'}">
                <label for="DEADZONE_X">Horizontal Deadzone:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitDeadzone', [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}">${L.translate('hide separate x/y // zeige x/y gemeinsam')}</a>
                <div class="row">
                    <span id="DEADZONE_X_VAL" class="text-center one column">${state[C.AT_CMD_DEADZONE_X]}</span>
                    <input type="range" value="${state[C.AT_CMD_DEADZONE_X]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_DEADZONE_X])}" id="DEADZONE_X" min="0" max="650" class="eleven columns"/>
                </div>
                <label for="DEADZONE_Y">Vertical Deadzone:</label>
                <div class="row">
                    <span id="DEADZONE_Y_VAL" class="text-center one column">${state[C.AT_CMD_DEADZONE_Y]}</span>
                    <input type="range" value="${state[C.AT_CMD_DEADZONE_Y]}" oninput="${(event) => this.sliderChanged(event, [C.AT_CMD_DEADZONE_Y])}" id="DEADZONE_Y" min="0" max="650" class="eleven columns"/>
                </div>
            </div>`;
    }
}

TabStick.valueHandler = function (data) {
    if (PositionVisualization.instance) {
        PositionVisualization.instance.updateData(data);
    }
};

export {TabStick};