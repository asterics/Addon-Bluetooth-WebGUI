import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../components/PositionVisualization.js";
import {preactUtil} from "../../util/preactUtil.js";
import {RadioFieldset} from "../../../js/ui/components/RadioFieldset.js";
import {Slider} from "../../../js/ui/components/Slider.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipMouse} from "../../communication/FLipMouse.js";
import {ActionButton} from "../../../js/ui/components/ActionButton.js";

const html = htm.bind(h);

class TabStick extends Component {
    constructor() {
        super();

        TabStick.instance = this;
        this.state = {};
        this.atCmds = [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y, C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION];
        this.initValues();
    }

    initValues() {
        this.setState({
            splitSensitivity: ATDevice.getConfig(C.AT_CMD_SENSITIVITY_X) !== ATDevice.getConfig(C.AT_CMD_SENSITIVITY_Y),
            splitDeadzone: ATDevice.getConfig(C.AT_CMD_DEADZONE_X) !== ATDevice.getConfig(C.AT_CMD_DEADZONE_Y)
        });
        let additionalState = {};
        this.atCmds.forEach(atCmd => {
            additionalState[atCmd] = ATDevice.getConfig(atCmd);
        });
        this.setState(additionalState);
        FLipMouse.resetMinMaxLiveValues();
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
                ${html`<${RadioFieldset} legend="Use stick for: // Verwende Stick für:" onchange="${(value) => FLipMouse.setFlipmouseMode(value)}" elements="${C.FLIPMOUSE_MODES}" value="${ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE)}"/>`}
            </div>
            <div class="row mt-3 mb-5">
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
            
            <div style="display: ${!state.splitSensitivity ? 'block' : 'none'}">
                ${html`<${Slider} label="Sensitivity: // Sensitivität:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y]}"
                        toggleFn="${() => this.toggleState('splitSensitivity', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`}
            </div>
            <div style="display: ${state.splitSensitivity ? 'block' : 'none'}">
                ${html`<${Slider} label="Horizontal Sensitivity: // Sensitivität horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X]}"
                        toggleFn="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>`}
                ${html`<${Slider} label="Vertical Sensitivity: // Sensitivität vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_Y]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_Y]}"/>`}
            </div>
            <div class="mt-4">
                <div  style="display: ${!state.splitDeadzone ? 'block' : 'none'}">
                    ${html`<${Slider} label="<span lang="en">Deadzone:</span>" lang="en" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y]}"
                        toggleFn="${() => this.toggleState('splitDeadzone', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`}
                </div>
                <div style="display: ${state.splitDeadzone ? 'block' : 'none'}">
                    ${html`<${Slider} label="Horizontal Deadzone: // <span lang="en">Deadzone:</span> horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_X]}"
                        toggleFn="${() => this.toggleState('splitDeadzone', [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>`}
                    ${html`<${Slider} label="Vertical Deadzone: // <span lang="en">Deadzone:</span> vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_Y]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_Y]}"/>`}
                </div>
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Maximum speed: // Maximale Geschwindigkeit:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_MAX_SPEED]}"
                    min="0" max="100" updateConstants="${[C.AT_CMD_MAX_SPEED]}"/>`}
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Acceleration: // Beschleunigung:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ACCELERATION]}"
                    min="0" max="100" updateConstants="${[C.AT_CMD_ACCELERATION]}"/>`}
            </div>
            <div class="row" style="margin-top: 4em">
                <div class="col">
                    ${html`<${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots(this.atCmds)}"
                                        label="Copy slider values to all slots // Regler-Werte auf alle Slots anwenden"
                                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..."/>`}
                </div>
                <div class="col">
                    ${html`<${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots([C.AT_CMD_FLIPMOUSE_MODE])}"
                                        label="Copy stick usage to all slots // Stick-Verwendung auf alle Slots anwenden"
                                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..."/>`}
                </div>
            </div>
            `;
    }
}

TabStick.valueHandler = function (data) {
    if (PositionVisualization.instance) {
        PositionVisualization.instance.updateData(data);
    }
};

TabStick.slotChangeHandler = function (data) {
    if (TabStick.instance) {
        TabStick.instance.initValues();
    }
};

export {TabStick};