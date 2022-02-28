import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../../../js_fm/ui/components/PositionVisualization.js";
import {preactUtil} from "../../../js_fm/util/preactUtil.js";
import {RadioFieldset} from "../../../js/ui/components/RadioFieldset.js";
import {Slider} from "../../../js/ui/components/Slider.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipPad} from "../../communication/FLipPad.js";
import {ActionButton} from "../../../js/ui/components/ActionButton.js";
import {FaIcon} from "../../../js/ui/components/FaIcon.js";
import {localStorageService} from "../../../js/localStorageService.js";

const html = htm.bind(h);

const KEY_TAB_STICK_SHOW_ADVANCED = 'KEY_TAB_STICK_SHOW_ADVANCED';
const KEY_TAB_STICK_SHOW_BARS = 'KEY_TAB_STICK_SHOW_BARS';
class TabPad extends Component {
    constructor() {
        super();

        TabPad.instance = this;
        this.state = {};
        this.atCmds = [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y, C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION,
            C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP, C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP, C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP, C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP];
        this.initValues();
    }

    componentWillUnmount() {
        TabPad.instance = null;
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
        FLipPad.resetMinMaxLiveValues();
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
            <span id="posLiveA11yLabel" class="sr-only">${L.translate('Current position of FLipPad Stick // Aktuelle Position des Sticks der FLipPad')}</span>
            <span id="posLiveA11y" aria-describedby="posLiveA11yLabel" class="onlyscreenreader" role="status" aria-live="off" accesskey="q" tabindex="-1"></span>

            <div class="row mb-4">
                <div class="col-12 col-md-6">
                    <div class="mb-5">
                        ${html`<${RadioFieldset} legend="Use stick for: // Verwende Stick für:" onchange="${(value) => {FLipPad.setFlipmouseMode(value); this.forceUpdate();}}" elements="${C.FLIPMOUSE_MODES}" value="${ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE)}"/>`}
                    </div>
                    <div class="mb-4">
                        <button onclick="${() => FLipPad.rotate()}">
                            ${html`<${FaIcon} icon="fas redo"/>`}
                            <span>${L.translate('Rotate right // Nach rechts drehen')}</span>
                        </button>
                    </div>
                </div>
                <div class="col-12 col-md-6 mt-4 mt-md-0">
                    <${PositionVisualization} showAnalogBars="${state.showAnalogBars}" showAnalogValues="${state.showAnalogBars}" showDeadzone="${true}" showDrfitComp="${false}" showOrientation="${true}" showMaxPos="${true}" circleRadius="${10}" showZoom="${true}"/>
                </div>
            </div>
            
            <div>
                ${(() => {
                    if (state.splitSensitivity) {
                        return html`
                        <${Slider} label="Horizontal Speed: // Geschwindigkeit horizontal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
                            min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_X]}"
                            toggleFn="${() => this.toggleState('splitSensitivity', [C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y])}" toggleFnLabel="hide separate x/y // zeige  x/y gemeinsam"/>
                        <${Slider} label="Vertical Speed: // Geschwindigkeit vertikal:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_Y]}"
                                   min="0" max="255" updateConstants="${[C.AT_CMD_SENSITIVITY_Y]}"/>`
                    } else {
                        return html`
                        <${Slider} label="Speed: // Geschwindigkeit:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_SENSITIVITY_X]}"
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
            <div class="my-5">
                <a href="javascript:;" onclick="${() => {localStorageService.save(KEY_TAB_STICK_SHOW_ADVANCED, !state.showAdvanced); this.setState({showAdvanced: !state.showAdvanced})}}">
                    ${state.showAdvanced ? L.translate('Hide advanced options // Verstecke erweiterte Einstellungen') : L.translate('Show advanced options // Zeige erweiterte Einstellungen')}
                </a>
            </div>
            <div class="${state.showAdvanced ? '' : 'd-none'}">
                <div class="mt-4 ${ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE) === C.FLIPPAD_MODE_MOUSE.value ? '' : 'd-none'}">
                    ${html`<${Slider} label="Acceleration: // Beschleunigung:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ACCELERATION]}"
                        min="0" max="100" updateConstants="${[C.AT_CMD_ACCELERATION]}"/>`}
                </div>
                <div class="mt-4">
                    ${(() => {
                        return html`
                        <${Slider} label="Trackpad sensitivity // Trackpad-Sensitivität" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP]}"
                            min="0" max="100" updateConstants="${[C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP]}"/>`
                    })()}
                </div>
                <div class="mt-4">
                    ${(() => {
                        return html`
                        <${Slider} label="Maximum tap duration [ms] (0=disable) // Maximale Tap-Dauer [ms] (0=deaktiviert)" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP]}"
                            min="0" max="100" updateConstants="${[C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP]}" viewFactor="${10}"/>`
                    })()}
                </div>
                <div class="mt-4">
                    ${(() => {
                        return html`
                        <${Slider} label="Maximum duration of Tap + Slide gestures [ms] (0=disable) // Maximale Dauer von Tippen + Wischen Gesten [ms] (0=deaktiviert)" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP]}"
                            min="0" max="100" updateConstants="${[C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP]}" viewFactor="${10}"/>`
                    })()}
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

TabPad.valueHandler = function (data) {
    if (PositionVisualization.instance) {
        PositionVisualization.instance.updateData(data);
    }
};

TabPad.slotChangeHandler = function (data) {
    if (TabPad.instance) {
        TabPad.instance.initValues();
    }
};

export {TabPad};