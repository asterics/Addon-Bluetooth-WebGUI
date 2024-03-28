import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { Slider } from "../../../js/ui/components/Slider.js";
import { ATDevice } from "../../../js/communication/ATDevice.js";
import { ActionButton } from "../../../js/ui/components/ActionButton.js";

const html = htm.bind(h);

class TabTimings extends Component {
    constructor() {
        super();

        TabTimings.instance = this;
        this.state = {};
        this.atCmds = [C.AT_CMD_THRESHOLD_LONGPRESS, C.AT_CMD_THRESHOLD_DOUBLEPRESS, C.AT_CMD_THRESHOLD_AUTODWELL,
        C.AT_CMD_ANTITREMOR_PRESS, C.AT_CMD_ANTITREMOR_RELEASE, C.AT_CMD_ANTITREMOR_IDLE];
        this.updateState();
    }

    updateState() {
        let state = {};
        for (let atCmd of this.atCmds) {
            state[atCmd] = ATDevice.getConfig(atCmd);
        }
        this.setState(state);
    }

    valueChanged(value, constants) { // Every element of constants (which is an array) gets iterated.
        let state = {};
        constants.forEach(constant => {
            state[constant] = value;
            ATDevice.setConfig(constant, value);
        });
        this.setState(state);
    }

    resetSlidersTiming() {
        const newValue = 0;
        const constants = [C.AT_CMD_THRESHOLD_LONGPRESS, C.AT_CMD_THRESHOLD_DOUBLEPRESS, C.AT_CMD_THRESHOLD_AUTODWELL, C.AT_CMD_ANTITREMOR_PRESS, C.AT_CMD_ANTITREMOR_RELEASE, C.AT_CMD_ANTITREMOR_IDLE];
        this.valueChanged(newValue, constants);
    }



    render() {
        let state = this.state;

        return html`
            <h2>${L.translate('Timings configuration (Slot "{?}") // Timing-Konfiguration (Slot "{?}")', ATDevice.getCurrentSlot())}
            </h2>
            <h3 class="mt-5">${L.translate('Timings for special functions // Schwellenwerte für Spezialfunktionen')}</h3>
            
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider}
                    id="slider" label="Threshold for long press [ms], 0=disable: // Schwellenwert für langes Drücken [ms], 0=deaktivieren:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_THRESHOLD_LONGPRESS]}" min="0" max="10000" step="100"
                    updateConstants="${[C.AT_CMD_THRESHOLD_LONGPRESS]}" />
                `} <!-- AT_CMD_THRESHOLD_LONGPRESS is AT TT. -->
            </div>

            
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider}
                    label="Threshold for slot change by double press [ms], 0=disable: // Schwellenwert für Slot-Weiterschalten durch doppeltes Drücken [ms], 0=deaktivieren:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_THRESHOLD_DOUBLEPRESS]}" min="0" max="10000" step="100"
                    updateConstants="${[C.AT_CMD_THRESHOLD_DOUBLEPRESS]}" />
                `}
            </div>
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider}
                    label="Threshold automatic left click [ms], 0=disable: // Schwellenwert für automatischen Linksklick [ms], 0=deaktivieren:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_THRESHOLD_AUTODWELL]}" min="0" max="5000" step="100"
                    updateConstants="${[C.AT_CMD_THRESHOLD_AUTODWELL]}" />
                `}
            </div>

            <h3>${L.translate('Antitremor settings // Antitremor-Einstellungen')}</h3>
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider} label="Antitremor time for press [ms]: // Antitremor Schwellenwert für Drücken [ms]:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_ANTITREMOR_PRESS]}" min="1" max="500"
                    updateConstants="${[C.AT_CMD_ANTITREMOR_PRESS]}" />
                `}
            </div>
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider} label="Antitremor time for release [ms]: // Antitremor Schwellenwert für Loslassen [ms]:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_ANTITREMOR_RELEASE]}" min="1" max="500"
                    updateConstants="${[C.AT_CMD_ANTITREMOR_RELEASE]}" />
                `}
            </div>
            <div class="mb-5 mb-md-2">
                ${html`
                <${Slider} label="Antitremor idle time [ms]: // Antitremor Wartezeit [ms]:"
                    oninput="${(value, constants) => this.valueChanged(value, constants)}"
                    value="${state[C.AT_CMD_ANTITREMOR_IDLE]}" min="1" max="500" updateConstants="${[C.AT_CMD_ANTITREMOR_IDLE]}" />
                `}
            </div>

            <div class="row" style="margin-top: 4em">
                <div class="col col-lg-6">
                    ${html`
                    <${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots(this.atCmds)}"
                        label="Copy config to all slots // Konfiguration auf alle Slots anwenden"
                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..." faIcon="far clone" />
                    `}
                </div>           
            </div>

        
            <div class="row" style="margin-top: 1em">
                <div class="col col-lg-6">
                    <${ActionButton}  resetSlidersTiming="${() => this.resetSlidersTiming()}" 
                    label="Resetting all Thresholds // Alle Schwellenwerte zurücksetzen" faIcon="fas undo" progressLabel="Resetting Thresholds... // Schwellenwerte werden zurückgesetzt..." /> <!-- fas undo is for the icon. -->
                </div>
            </div>

         `;
    }
}

TabTimings.slotChangeHandler = function (data) {
    if (TabTimings.instance) {
        TabTimings.instance.updateState();
    }
};

export { TabTimings };