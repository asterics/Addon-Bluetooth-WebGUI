import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../components/PositionVisualization.js";
import {preactUtil} from "../../util/preactUtil.js";
import {RadioFieldset} from "../../../js/ui/components/RadioFieldset.js";
import {Slider} from "../../../js/ui/components/Slider.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipMouse} from "../../communication/FLipMouse.js";
import {SlotsSelector} from "../../../js/ui/components/SlotsSelector.js";

const html = htm.bind(h);

class TabStick extends Component {
    constructor() {
        super();

        this.state = {
            splitSensitivity: ATDevice.getConfig(C.AT_CMD_SENSITIVITY_X) !== ATDevice.getConfig(C.AT_CMD_SENSITIVITY_Y),
            splitDeadzone: ATDevice.getConfig(C.AT_CMD_DEADZONE_X) !== ATDevice.getConfig(C.AT_CMD_DEADZONE_Y),
            mouseMode: ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE),
            applySlots: ATDevice.getSlots()
        }

        this.atCmds = [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y, C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION];
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
            let values = this.atCmds.map(atCmd => state[atCmd] || this.state[atCmd]);
            ATDevice.setConfigForSlots(this.atCmds, values, this.state.applySlots, 5000);
        });
        this.setState(state);
    }

    toggleState(toggleName, updateConstants) {
        preactUtil.toggleState(this, toggleName);
        this.valueChanged(this.state[updateConstants[0]], updateConstants);
    }
    
    render() {
        let state = this.state;
        let disable = state.applySlots.length === 0;

        return html`
            <h2>${L.translate('Stick configuration // Stick-Konfiguration')}</h2>
            <div class="row mt-5 mb-5">
                <div id="posVisBasic" class="six columns">
                    <${PositionVisualization} mode="tabStick"/>
                </div>
                <div class="five columns">
                    <button onclick="${() => FLipMouse.calibrate()}" disabled="${disable}">
                        <span>${L.translate('Calibrate middle position // Mittelposition kalibrieren')}</span>
                    </button>
                    <button onclick="${() => FLipMouse.rotate()}" disabled="${disable}">
                        <span>${L.translate('\u21BB Rotate right // \u21BB Nach rechts drehen')}</span>
                    </button>
                </div>
            </div>
            
            <div style="display: ${!state.splitSensitivity ? 'block' : 'none'}">
                ${html`<${Slider} label="Sensitivity: // Sensitivität:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y]}" disabled="${disable}"
                        toggleFn="${() => this.toggleState('splitSensitivity', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`}
            </div>
            <div style="display: ${state.splitSensitivity ? 'block' : 'none'}">
                ${html`<${Slider} label="Horizontal Sensitivity: // Sensitivität horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X]}" disabled="${disable}"
                        toggleFn="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>`}
                ${html`<${Slider} label="Vertical Sensitivity: // Sensitivität vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_Y]}"
                        min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_Y]}" disabled="${disable}"/>`}
            </div>
            <div class="mt-4">
                <div  style="display: ${!state.splitDeadzone ? 'block' : 'none'}">
                    ${html`<${Slider} label="<span lang="en">Deadzone:</span>" lang="en" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y]}" disabled="${disable}"
                        toggleFn="${() => this.toggleState('splitDeadzone', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt" disabled="${disable}"/>`}
                </div>
                <div style="display: ${state.splitDeadzone ? 'block' : 'none'}">
                    ${html`<${Slider} label="Horizontal Deadzone: // <span lang="en">Deadzone:</span> horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_X]}" disabled="${disable}" disabled="${disable}"
                        toggleFn="${() => this.toggleState('splitDeadzone', [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>`}
                    ${html`<${Slider} label="Vertical Deadzone: // <span lang="en">Deadzone:</span> vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_Y]}"
                        min="0" max="650" updateConstants="${[C.AT_CMD_DEADZONE_Y]}" disabled="${disable}"/>`}
                </div>
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Maximum speed: // Maximale Geschwindigkeit:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_MAX_SPEED]}"
                    min="0" max="100" updateConstants="${[C.AT_CMD_MAX_SPEED]}" disabled="${disable}"/>`}
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Acceleration: // Beschleunigung:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ACCELERATION]}"
                    min="0" max="100" updateConstants="${[C.AT_CMD_ACCELERATION]}" disabled="${disable}"/>`}
            </div>

            ${html`<${SlotsSelector} onchange="${(selectedSlots => this.setState({applySlots: selectedSlots}))}"/>`}
            `;
    }
}

TabStick.valueHandler = function (data) {
    if (PositionVisualization.instance) {
        PositionVisualization.instance.updateData(data);
    }
};

export {TabStick};