import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {PositionVisualization} from "../components/PositionVisualization.js";
import {BtnSipPuffVisualization} from "../components/BtnSipPuffVisualization.js";
import {preactUtil} from "../../util/preactUtil.js";

const html = htm.bind(h);

class TabVisualization extends Component {
    render() {
        return html`<h2 id="tabVisHeader" style="margin-bottom: 2em">${L.translate('Visualization of current state // Visualisierung aktueller Status')}</h2>
            <div class="row" style="margin-bottom: 2em">
                <div id="tabVisVisContainer" class="col-12 col-lg-3 col-xl-4">
                    <${PositionVisualization}/>
                </div>
                <div id="tabVisBtnSipVis" class="col-12 col-lg-9 col-xl-8">
                    <${BtnSipPuffVisualization}/>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row">
                    <label for="sliderMaxRange">${L.translate('Maximum position // Maximal angezeigte Auslenkung')}</label>
                    <input type="range" id="sliderMaxRange" min="10" max="1024" onInput="${(event) => PositionVisualization.instance.updateState({maxPosManual: event.target.value})}"/>
                    <span id="sliderMaxRangeValue">?</span>
                </div>
                <div class="row" style="margin-top: 2em">
                    <div style="font-weight: bold">${L.translate('Show/hide elements // Elemente anzeigen/verstecken')}</div>
                </div>
                <div class="row" style="margin-top: 1em">
                    <button class="col-12 col-md m-1" onclick="${() => preactUtil.toggleState(PositionVisualization.instance, 'showDeadzone')}">Deadzone</button>
                    <button class="col-12 col-md m-1" onclick="${() => preactUtil.toggleState(PositionVisualization.instance, 'showAnalogBars')}">Bars</button>
                    <button class="col-12 col-md m-1" onclick="${() => preactUtil.toggleState(PositionVisualization.instance, 'showAnalogValues')}">Values</button>
                    <button class="col-12 col-md m-1" onclick="${() => preactUtil.toggleState(PositionVisualization.instance, 'showMaxPos')}">Max. Position</button>
                    <button class="col-12 col-md m-1" onclick="${() => preactUtil.toggleState(PositionVisualization.instance, 'showOrientation')}">Orientation</button>
                </div>
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