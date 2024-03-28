import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { PositionVisualization } from "../components/PositionVisualization.js";
import { preactUtil } from "../../util/preactUtil.js";
import { RadioFieldset } from "../../../js/ui/components/RadioFieldset.js";
import { Slider } from "../../../js/ui/components/Slider.js";
import { ATDevice } from "../../../js/communication/ATDevice.js";
import { FLipMouse } from "../../communication/FLipMouse.js";
import { ActionButton } from "../../../js/ui/components/ActionButton.js";
import { FaIcon } from "../../../js/ui/components/FaIcon.js";
import { localStorageService } from "../../../js/localStorageService.js";


const html = htm.bind(h);

const KEY_TAB_STICK_SHOW_ADVANCED = 'KEY_TAB_STICK_SHOW_ADVANCED';
const KEY_TAB_STICK_SHOW_BARS = 'KEY_TAB_STICK_SHOW_BARS';

class TabStick extends Component {

    constructor() {
        super();

        TabStick.instance = this;
        this.state = {};
        this.atCmds = [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y, C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION,
        C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP, C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP, C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP, C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP];
        this.initValues();
    }

    componentWillUnmount() {
        TabStick.instance = null;
    }

    initValues() {
        this.setState({
            splitSensitivity: ATDevice.getConfig(C.AT_CMD_SENSITIVITY_X) !== ATDevice.getConfig(C.AT_CMD_SENSITIVITY_Y),
            splitDeadzone: ATDevice.getConfig(C.AT_CMD_DEADZONE_X) !== ATDevice.getConfig(C.AT_CMD_DEADZONE_Y),
            splitDriftcompRange: ATDevice.getConfig(C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP) !== ATDevice.getConfig(C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP),
            splitDriftcompGain: ATDevice.getConfig(C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP) !== ATDevice.getConfig(C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP),
            showAdvanced: localStorageService.hasKey(KEY_TAB_STICK_SHOW_ADVANCED) ? localStorageService.get(KEY_TAB_STICK_SHOW_ADVANCED) : false,
            showAnalogBars: localStorageService.hasKey(KEY_TAB_STICK_SHOW_BARS) ? localStorageService.get(KEY_TAB_STICK_SHOW_BARS) : false
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

    toggleShowBars() {
        localStorageService.save(KEY_TAB_STICK_SHOW_BARS, !this.state.showAnalogBars);
        this.setState({
            showAnalogBars: !this.state.showAnalogBars
        });
    }

    render() {
        let state = this.state;

        return html`
            <h2>${L.translate('Stick configuration (slot "{?}") // Stick-Konfiguration (Slot "{?}")', ATDevice.getCurrentSlot())}</h2>
            <span id="posLiveA11yLabel" class="sr-only">${L.translate('Current position of FLipMouse Stick // Aktuelle Position des Sticks der FLipMouse')}</span>
            <span id="posLiveA11y" aria-describedby="posLiveA11yLabel" class="onlyscreenreader" role="status" aria-live="off" accesskey="q" tabindex="-1"></span>

            <div class="row mb-4">
                <div class="col-12 col-md-6">
                    <div class="mb-5">
                        ${html`<${RadioFieldset} legend="Use stick for: // Verwende Stick für:" onchange="${(value) => FLipMouse.setFlipmouseMode(value)}" elements="${C.FLIPMOUSE_MODES}" value="${ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE)}"/>`}
                    </div>
                    <div class="mb-4">
                        <button onclick="${() => FLipMouse.calibrate()}">
                            ${html`<${FaIcon} icon="far dot-circle"/>`}
                            <span>${L.translate('Calibrate middle position // Mittelposition kalibrieren')}</span>
                        </button>
                        <button onclick="${() => FLipMouse.rotate()}">
                            ${html`<${FaIcon} icon="fas redo"/>`}
                            <span>${L.translate('Rotate right // Nach rechts drehen')}</span>
                        </button>
                    </div>
                </div>
                <div class="col-12 col-md-6 mt-4 mt-md-0">
                    <${PositionVisualization} showAnalogBars="${state.showAnalogBars}" showAnalogValues="${state.showAnalogBars}" showDeadzone="${true}" showDriftComp="${true}" showOrientation="${true}" showMaxPos="${true}" circleRadius="${10}" showZoom="${true}"/>
                </div>
            </div>
            
            <div>
                ${(() => {
                if (state.splitSensitivity) {
                    return html`
                        <${Slider} label="Horizontal Sensitivity: // Sensitivität horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                            min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X]}"
                            toggleFn="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>
                        <${Slider} label="Vertical Sensitivity: // Sensitivität vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_Y]}"
                                   min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_Y]}"/>`
                } else {
                    return html`
                        <${Slider} label="Sensitivity: // Sensitivität:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                            min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y]}"
                            toggleFn="${() => this.toggleState('splitSensitivity', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`
                }
            })()}
            </div>
            <div class="mt-4">
                ${(() => {
                if (state.splitDeadzone) {
                    return html`
                        <${Slider} label="Horizontal Deadzone: // <span lang="en">Deadzone</span> horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                            min="0" max="200" updateConstants="${[C.AT_CMD_DEADZONE_X]}"
                            toggleFn="${() => this.toggleState('splitDeadzone', [C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>
                        <${Slider} label="Vertical Deadzone: // <span lang="en">Deadzone</span> vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_Y]}"
                            min="0" max="200" updateConstants="${[C.AT_CMD_DEADZONE_Y]}"/>`
                } else {
                    return html`
                        <${Slider} label="<span lang="en">Deadzone:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_DEADZONE_X]}"
                            min="0" max="200" updateConstants="${[C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y]}"
                            toggleFn="${() => this.toggleState('splitDeadzone', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`
                }
            })()}
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Maximum speed: // Maximale Geschwindigkeit:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_MAX_SPEED]}"
                    min="0" max="100" updateConstants="${[C.AT_CMD_MAX_SPEED]}"/>`}
            </div>
            <div class="mt-4">
                ${html`<${Slider} label="Acceleration: // Beschleunigung:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ACCELERATION]}"
                        min="0" max="100" updateConstants="${[C.AT_CMD_ACCELERATION]}"/>`}
            </div>
            <div class="my-5">
                <a href="javascript:;" onclick="${() => { localStorageService.save(KEY_TAB_STICK_SHOW_ADVANCED, !state.showAdvanced); this.setState({ showAdvanced: !state.showAdvanced }) }}">
                    ${state.showAdvanced ? L.translate('Hide advanced options // Verstecke erweiterte Einstellungen') : L.translate('Show advanced options // Zeige erweiterte Einstellungen')}
                </a>
            </div>
            <div class="${state.showAdvanced ? '' : 'd-none'}">
                <div class="mt-4 ${ATDevice.isMajorVersion(2) ? '' : 'd-none'}">
                    ${(() => {
                if (state.splitDriftcompRange) {
                    return html`
                            <${Slider} label="<span lang="en">Horizontal drift compensation range:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP]}"
                                toggleFn="${() => this.toggleState('splitDriftcompRange', [C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP, C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>
                            <${Slider} label="<span lang="en">Vertical drift compensation range:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP]}"/>`
                } else {
                    return html`
                            <${Slider} label="<span lang="en">Drift compensation range:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP, C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP]}"
                                toggleFn="${() => this.toggleState('splitDriftcompRange', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`
                }
            })()}
                </div>
                <div class="mt-4 ${ATDevice.isMajorVersion(2) ? '' : 'd-none'}">
                    ${(() => {
                if (state.splitDriftcompGain) {
                    return html`
                            <${Slider} label="<span lang="en">Horizontal drift compensation gain:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP]}"
                                toggleFn="${() => this.toggleState('splitDriftcompGain', [C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP, C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>
                            <${Slider} label="<span lang="en">Vertical drift compensation gain:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP]}"/>`
                } else {
                    return html`
                            <${Slider} label="<span lang="en">Drift compensation gain:</span>" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP]}"
                                min="0" max="100" updateConstants="${[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP, C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP]}"
                                toggleFn="${() => this.toggleState('splitDriftcompGain', [])}" toggleFnLabel="show x/y separately // zeige x/y getrennt"/>`
                }
            })()}
                </div>
                <div class="mt-4 row ${ATDevice.isMajorVersion(3) ? '' : 'd-none'}">
                    <label class="col-12" for="selectProfile">${L.translate('Sensor-Profile // Sensor-Profil')}</label>
                    <div class="col-12">
                        <select id="selectProfile" value="${ATDevice.getConfig(C.AT_CMD_SENSORBOARD)}" oninput="${(event) => { ATDevice.setConfig(C.AT_CMD_SENSORBOARD, event.target.value, 0) }}">
                            <option value="0">${L.translate('High (SG) // Hoch (DMS)')}</option>
                            <option value="1">${L.translate('Medium (SG) // Mittel (DMS)')}</option>
                            <option value="2">${L.translate('Low (SG) // Gering (DMS)')}</option>
                            <option value="3">${L.translate('Very Low (SG) // Sehr gering (DMS)')}</option>
                            <option value="4">${L.translate('High (SMD) // Hoch (SMD)')}</option>
                            <option value="5">${L.translate('Medium (SMD) // Mittel (SMD)')}</option>
                            <option value="6">${L.translate('Low (SMD) // Gering (SMD)')}</option>
                            <option value="7">${L.translate('Very Low (SMD) // Sehr gering (SMD)')}</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="row" style="margin-top: 4em">
                <div class="col">
                    ${html`<${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots(this.atCmds)}"
                                        label="Copy slider values to all slots // Regler-Werte auf alle Slots anwenden"
                                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..." faIcon="far clone"/>`}
                </div>
                <div class="col">
                    ${html`<${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots([C.AT_CMD_FLIPMOUSE_MODE])}"
                                        label="Copy stick usage to all slots // Stick-Verwendung auf alle Slots anwenden"
                                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..." faIcon="far clone"/>`}
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

window.addEventListener(C.EVENT_REFRESH_MAIN, () => {

    if (TabStick.instance) {
        TabStick.instance.initValues();

    }
});

export { TabStick };