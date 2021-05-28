import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {PositionVisualization} from "../comp/PositionVisualization.js";
import {preactUtil} from "../preactUtil.js";
import {RadioFieldset} from "../comp/RadioFieldset.js";

const html = htm.bind(h);

class TabStick extends Component {
    constructor() {
        super();

        this.state = {
            SENSITIVITY_X: flip.getConfig(flip.SENSITIVITY_X),
            SENSITIVITY_Y: flip.getConfig(flip.SENSITIVITY_Y),
            DEADZONE_X: flip.getConfig(flip.DEADZONE_X),
            DEADZONE_Y: flip.getConfig(flip.DEADZONE_Y),
            splitSensitivity: flip.getConfig(flip.SENSITIVITY_X) !== flip.getConfig(flip.SENSITIVITY_Y),
            splitDeadzone: flip.getConfig(flip.DEADZONE_X) !== flip.getConfig(flip.DEADZONE_Y),
            mouseMode: flip.getConfig(flip.FLIPMOUSE_MODE)
        }
    }

    componentDidUpdate() {
        domI18nInstance.changeLanguage();
    }
    
    sliderChanged(event, constants) {
        this.valueChanged(event.target.value, constants);
    }

    valueChanged(value, constants) {
        let state = {};
        constants.forEach(constant => {
            state[constant] = value;
            flip.setValue(constant, value);
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
            <h2 data-i18n>Stick Configuration // Stick-Konfiguration</h2>
            <span id="posLiveA11yLabel" aria-hidden="false" class="hidden" data-i18n="">Current position of FLipMouse Stick // Aktuelle Position des Sticks der FLipMouse</span>
            <span id="posLiveA11y" aria-describedby="posLiveA11yLabel" class="onlyscreenreader" role="status" aria-live="off" accesskey="q" tabindex="-1"></span>
            <div class="mb-5">
                ${html`<${RadioFieldset} legend="Use stick for: // Verwende Stick für:" onchange="${(value) => flip.setFlipmouseMode(value)}" elements="${C.FLIPMOUSE_MODES}" value="${state.mouseMode}"/>`}
            </div>
            <div id="basic-SENSITIVITY-single" style="display: ${!state.splitSensitivity ? 'block' : 'none'}">
                <label for="SENSITIVITY" data-i18n>Sensitivity: // Sensitivität:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitSensitivity', [flip.SENSITIVITY_X, flip.SENSITIVITY_Y])}" data-i18n>show x/y separately // zeige x/y getrennt</a>
                <div class="row">
                    <span aria-hidden="true" id="SENSITIVITY_VAL" class="text-center one column">${state.SENSITIVITY_X}</span>
                    <input type="range" value="${state.SENSITIVITY_X}" oninput="${(event) => this.sliderChanged(event, [flip.SENSITIVITY_X, flip.SENSITIVITY_Y])}"
                           id="SENSITIVITY" min="0" max="255" class="eleven columns" accesskey="a"/>
                </div>
            </div>
            <div id="basic-SENSITIVITY-xy" style="display: ${state.splitSensitivity ? 'block' : 'none'}">
                <label for="SENSITIVITY_X" data-i18n>Horizontal Sensitivity: // Sensitivität horizontal:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitSensitivity', [flip.SENSITIVITY_X, flip.SENSITIVITY_Y])}" data-i18n>hide separate x/y // zeige  x/y gemeinsam</a>
                <div class="row">
                    <span id="SENSITIVITY_X_VAL" class="text-center one column">${state.SENSITIVITY_X}</span>
                    <input type="range" value="${state.SENSITIVITY_X}" oninput="${(event) => this.sliderChanged(event, [flip.SENSITIVITY_X])}"
                           id="SENSITIVITY_X" min="0" max="255" class="eleven columns"/>
                </div>
                <label for="SENSITIVITY_Y" data-i18n>Vertical Sensitivity: // Sensitivität vertikal:</label>
                <div class="row">
                    <span id="SENSITIVITY_Y_VAL" class="text-center one column">${state.SENSITIVITY_Y}</span>
                    <input type="range" value="${state.SENSITIVITY_Y}" oninput="${(event) => this.sliderChanged(event, [flip.SENSITIVITY_Y])}"
                           id="SENSITIVITY_Y" min="0" max="255" class="eleven columns"/>
                </div>
            </div>

            <br/>
            <div class="row">
                <div id="posVisBasic" class="six columns">
                    <${PositionVisualization}/>
                </div>
                <div class="five columns">
                    <button onclick="${() => actionAndToggle(flip.calibrate, [], ['#basic-button-calibrate', '#basic-button-calibrating'])}">
                        <span data-i18n id="basic-button-calibrate">Calibrate middle position // Mittelposition kalibrieren</span>
                        <span id="basic-button-calibrating" style="display: none;" data-i18n>Calibrating... // wird kalibriert...</span>
                    </button>
                    <button onclick="${() => actionAndToggle(flip.rotate, [], ['#basic-button-rotate', '#basic-button-rotating'])}">
                        <span data-i18n id="basic-button-rotate">\u21BB Rotate right // \u21BB Nach rechts drehen</span>
                        <span id="basic-button-rotating" style="display: none;" data-i18n>Rotating... // wird gedreht...</span>
                    </button>
                </div>
            </div>

            <br/>
            <div id="basic-DEADZONE-single" style="display: ${!state.splitDeadzone ? 'block' : 'none'}">
                <label lang="en" for="DEADZONE">Deadzone:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitDeadzone', [flip.DEADZONE_X, flip.DEADZONE_Y])}" data-i18n>show x/y separately // zeige x/y getrennt</a>
                <div class="row">
                    <span aria-hidden="true" id="DEADZONE_VAL" class="text-center one column">${state.DEADZONE_X}</span>
                    <input type="range" value="${state.DEADZONE_X}" oninput="${(event) => this.sliderChanged(event, [flip.DEADZONE_X, flip.DEADZONE_Y])}" id="DEADZONE" min="0" max="650" class="eleven columns" accesskey="s"/>
                </div>
            </div>
            <div id="basic-DEADZONE-xy" style="display: ${state.splitDeadzone ? 'block' : 'none'}">
                <label for="DEADZONE_X">Horizontal Deadzone:</label>
                <a aria-hidden="true" class="u-pull-right" href="javascript:;" onclick="${() => this.toggleState('splitDeadzone', [flip.DEADZONE_X, flip.DEADZONE_Y])}" data-i18n>hide separate x/y // zeige x/y gemeinsam</a>
                <div class="row">
                    <span id="DEADZONE_X_VAL" class="text-center one column">${state.DEADZONE_X}</span>
                    <input type="range" value="${state.DEADZONE_X}" oninput="${(event) => this.sliderChanged(event, [flip.DEADZONE_X])}" id="DEADZONE_X" min="0" max="650" class="eleven columns"/>
                </div>
                <label for="DEADZONE_Y">Vertical Deadzone:</label>
                <div class="row">
                    <span id="DEADZONE_Y_VAL" class="text-center one column">${state.DEADZONE_Y}</span>
                    <input type="range" value="${state.DEADZONE_Y}" oninput="${(event) => this.sliderChanged(event, [flip.DEADZONE_Y])}" id="DEADZONE_Y" min="0" max="650" class="eleven columns"/>
                </div>
            </div>


            <br/>
            <br/>
            <div class="row">
                <button id="basic-button" onclick="${() => actionAndToggle(flip.save, [], ['#basic-button-normal', '#basic-button-saving'], '#save-basic-value-bar')}" class="one-third" style="position: relative;">
                    <i id="save-basic-value-bar" class="value-bar color-lightercyan" style="width: 0%;"></i>
                    <span id="basic-button-normal" data-i18n>Save // Speichern</span>
                    <span id="basic-button-saving" style="display: none;" data-i18n>Saving... // Wird
                        gespeichert...
                    </span>
                </button>
            </div>`;
    }
}

TabStick.init = function () {
    render(html`<${TabStick}/>`, document.getElementById('viewContainer'));
    flip.resetMinMaxLiveValues();
    PositionVisualization.instance.prepareForTabStick();
};

TabStick.destroy = function () {
    render(null, document.getElementById('viewContainer'));
}

TabStick.valueHandler = function (data) {
    PositionVisualization.instance.updateData(data);
};

export {TabStick};