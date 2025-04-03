import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../components/PositionVisualization.js";
import {BtnSipPuffVisualization} from "../components/BtnSipPuffVisualization.js";
import {localStorageService} from "../../../js/localStorageService.js";
import {MouseAndKeyboardVisualization} from "../../../js/ui/components/MouseAndKeyboardVisualization.js";

const html = htm.bind(h);

const KEY_TAB_VISUALIZATION_CONFIG = 'KEY_TAB_VISUALIZATION_CONFIG';
class TabVisualization extends Component {
    constructor(props) {
        super(props);

        let stored = localStorageService.get(KEY_TAB_VISUALIZATION_CONFIG) || {};
        TabVisualization.instance = this;
        this.setState({
            showDeadzone: stored.showDeadzone !== undefined ? stored.showDeadzone : false,
            showDriftComp: stored.showDriftComp !== undefined ? stored.showDriftComp : false,
            showAnalogBars: stored.showAnalogBars !== undefined ? stored.showAnalogBars : true,
            showAnalogValues: stored.showAnalogValues !== undefined ? stored.showAnalogValues : true,
            showMaxPos: stored.showMaxPos !== undefined ? stored.showMaxPos : false,
            showOrientation: stored.showOrientation !== undefined ? stored.showOrientation : false,
            maxPosManual: stored.maxPosManual
        })
    }

    componentWillUnmount() {
        TabVisualization.instance = null;
    }

    toggleState(constant) {
        let newState = {};
        newState[constant] = !this.state[constant];
        this.setState(newState);
    }

    render() {
        let state = this.state;
        localStorageService.save(KEY_TAB_VISUALIZATION_CONFIG, this.state);
        return html`<h2 id="tabVisHeader" style="margin-bottom: 2em">${L.translate('Visualization of current state // Visualisierung aktueller Status')}</h2>
            <div class="row" style="margin-bottom: 2em">
                <div id="tabVisVisContainer" class="col-12 col-lg-3 col-xl-4">
                    <${PositionVisualization} showDeadzone="${state.showDeadzone}" showDriftComp="${state.showDriftComp}" showAnalogBars="${state.showAnalogBars}" showAnalogValues="${state.showAnalogValues}" showMaxPos="${state.showMaxPos}" showOrientation="${state.showOrientation}" maxPosManual="${state.maxPosManual}"/>
                </div>
                <div id="tabVisBtnSipVis" class="col-12 col-lg-9 col-xl-8">
                    <${BtnSipPuffVisualization}/>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <label for="sliderMaxRange">${L.translate('Maximum position // Maximal angezeigte Auslenkung')}</label>
                    <input type="range" id="sliderMaxRange" min="10" max="1024" onInput="${(event) => this.setState({maxPosManual: event.target.value})}"/>
                    <span id="sliderMaxRangeValue">?</span>
                </div>
                <div class="row" style="margin-top: 2em">
                    <div style="font-weight: bold">${L.translate('Show/hide elements // Elemente anzeigen/verstecken')}</div>
                </div>
                <div class="row" style="margin-top: 1em">
                    <button class="col-12 col-md m-1" onclick="${() => this.toggleState('showDeadzone')}">Deadzone</button>
                    <button class="col-12 col-md m-1 ${C.DEVICE_IS_FLIPPAD ? 'd-none' : ''}" onclick="${() => this.toggleState('showDriftComp')}">Driftcomp</button>
                    <button class="col-12 col-md m-1" onclick="${() => this.toggleState('showAnalogBars')}">Bars</button>
                    <button class="col-12 col-md m-1" onclick="${() => this.toggleState('showAnalogValues')}">Values</button>
                    <button class="col-12 col-md m-1" onclick="${() => this.toggleState('showMaxPos')}">Max. Position</button>
                    <button class="col-12 col-md m-1" onclick="${() => this.toggleState('showOrientation')}">Orientation</button>
                </div>
            </div>
            <h3 class="mt-5">${L.translate('Currently pressed buttons // Aktuell gedrückte Tasten')}</h3>
            <div>
                <${MouseAndKeyboardVisualization}/>
            </div>
            `;
    }
}

TabVisualization.valueHandler = function (data) {
    if (BtnSipPuffVisualization.instance) {
        BtnSipPuffVisualization.instance.updateData(data);
    }
    if (PositionVisualization.instance) {
        PositionVisualization.instance.updateData(data);
        PositionVisualization.instance.setStateListener((state) => {
            L('#sliderMaxRange').value = state.maxPos;
            L('#sliderMaxRangeValue').innerHTML = state.maxPos;
        })
    }
};

export {TabVisualization};