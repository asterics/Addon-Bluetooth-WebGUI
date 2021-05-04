import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {PositionVisualization} from "../comp/PositionVisualization.js";
import {BtnSipPuffVisualization} from "../comp/BtnSipPuffVisualization.js";
const html = htm.bind(h);

class TabVisualization extends Component {
    render() {
        return html`<h2 id="tabVisHeader" style="margin-bottom: 2em" data-i18n>Visualization of current state // Visualisierung aktueller Status</h2>
            <div class="row" style="margin-bottom: 2em">
                <div id="tabVisVisContainer" class="four columns">
                    <${PositionVisualization}/>
                </div>
                <div id="tabVisBtnSipVis" class="eight columns">
                    <${BtnSipPuffVisualization}/>
                </div>
            </div>
            <div class="row">
                <label for="sliderMaxRange" data-i18n="">Maximum position // Maximal angezeigte Auslenkung</label>
                <input type="range" id="sliderMaxRange" min="10" max="1024" onInput="${(event) => PositionVisualization.instance.updateState({maxPosManual: event.target.value})}"/>
                <span id="sliderMaxRangeValue">?</span>
            </div>
            <div class="row" style="margin-top: 2em">
                <div data-i18n="" style="margin-bottom: 1em; font-weight: bold">Show/hide elements // Elemente anzeigen/verstecken</div>
                <button class="two columns" onclick="${() => PositionVisualization.instance.toggleState('showDeadzone')}">Deadzone</button>
                <button class="two columns" onclick="${() => PositionVisualization.instance.toggleState('showAnalogBars')}">Bars</button>
                <button class="two columns" onclick="${() => PositionVisualization.instance.toggleState('showAnalogValues')}">Values</button>
                <button class="two columns" onclick="${() => PositionVisualization.instance.toggleState('showMaxPos')}">Max. Position</button>
                <button class="two columns" onclick="${() => PositionVisualization.instance.toggleState('showOrientation')}">Orientation</button>
            </div>`;
    }
}

TabVisualization.init = function () {
    render(html`<${TabVisualization}/>`, document.getElementById('viewContainer'));
};

TabVisualization.destroy = function () {
    render(null, document.getElementById('viewContainer'));
}

TabVisualization.valueHandler = function (data) {
    BtnSipPuffVisualization.instance.updateData(data);
    PositionVisualization.instance.updateData(data);
    PositionVisualization.instance.setStateListener((state) => {
        L('#sliderMaxRange').value = state.maxPos;
        L('#sliderMaxRangeValue').innerHTML = state.maxPos;
    })
};

export {TabVisualization};