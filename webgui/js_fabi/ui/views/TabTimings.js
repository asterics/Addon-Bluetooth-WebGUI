import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {Slider} from "../../../js/ui/components/Slider.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";

const html = htm.bind(h);

class TabTimings extends Component {
    constructor() {
        super();

        TabTimings.instance = this;
        this.state = {};
        this.updateState();
    }
    
    updateState() {
        let state = {};
        state[C.AT_CMD_THRESHOLD_LONGPRESS] = ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS);
        state[C.AT_CMD_THRESHOLD_DOUBLEPRESS] = ATDevice.getConfig(C.AT_CMD_THRESHOLD_DOUBLEPRESS);
        state[C.AT_CMD_THRESHOLD_AUTODWELL] = ATDevice.getConfig(C.AT_CMD_THRESHOLD_AUTODWELL);
        state[C.AT_CMD_ANTITREMOR_PRESS] = ATDevice.getConfig(C.AT_CMD_ANTITREMOR_PRESS);
        state[C.AT_CMD_ANTITREMOR_RELEASE] = ATDevice.getConfig(C.AT_CMD_ANTITREMOR_RELEASE);
        state[C.AT_CMD_ANTITREMOR_IDLE] = ATDevice.getConfig(C.AT_CMD_ANTITREMOR_IDLE);
        this.setState(state);
    }

    valueChanged(value, constants) {
        let state = {};
        constants.forEach(constant => {
            state[constant] = value;
            ATDevice.setConfig(constant, value);
        });
        this.setState(state);
    }
    
    render() {
        let state = this.state;

        return html`
            <h2>${L.translate('Timings configuration (Slot "{?}") // Timing-Konfiguration (Slot "{?}")', ATDevice.getCurrentSlot())}</h2>
            <h3>${L.translate('Antitremor settings // Antitremor-Einstellungen')}</h3>
            ${html`<${Slider} label="Antitremor time for press: // Antitremor Schwellenwert für Drücken:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ANTITREMOR_PRESS]}"
                        min="1" max="500" updateConstants="${[C.AT_CMD_ANTITREMOR_PRESS]}"/>`}
            ${html`<${Slider} label="Antitremor time for release: // Antitremor Schwellenwert für Loslassen:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ANTITREMOR_RELEASE]}"
                        min="1" max="500" updateConstants="${[C.AT_CMD_ANTITREMOR_RELEASE]}"/>`}
            ${html`<${Slider} label="Antitremor idle time: // Antitremor Wartezeit:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_ANTITREMOR_IDLE]}"
                        min="1" max="500" updateConstants="${[C.AT_CMD_ANTITREMOR_IDLE]}"/>`}
            
            <h3 class="mt-5">${L.translate('Timings for special functions // Schwellenwerte für Spezialfunktionen')}</h3>
            ${html`<${Slider} label="Threshold for long press: // Schwellenwert für langes Drücken:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_THRESHOLD_LONGPRESS]}"
                        min="0" max="9999" updateConstants="${[C.AT_CMD_THRESHOLD_LONGPRESS]}"/>`}
            ${html`<${Slider} label="Threshold for double press: // Schwellenwert für doppeltes Drücken:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_THRESHOLD_DOUBLEPRESS]}"
                        min="0" max="9999" updateConstants="${[C.AT_CMD_THRESHOLD_DOUBLEPRESS]}"/>`}
            ${html`<${Slider} label="Threshold automatic left click: // Schwellenwert für automatischen Linksklick:" oninput="${(value, constants) => this.valueChanged(value, constants)}" value="${state[C.AT_CMD_THRESHOLD_AUTODWELL]}"
                        min="0" max="5000" updateConstants="${[C.AT_CMD_THRESHOLD_AUTODWELL]}"/>`}
        `;
    }
}

TabTimings.slotChangeHandler = function (data) {
    if (TabTimings.instance) {
        TabTimings.instance.updateState();
    }
};

export {TabTimings};