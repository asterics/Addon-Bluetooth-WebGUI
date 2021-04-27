import { h, Component, render } from '../js/preact.min.js';
import htm from '../js/htm.min.js';
import {PositionVisualization} from "./comp/PositionVisualization.js"
import {BtnSipPuffVisualization} from "./comp/BtnSipPuffVisualization.js"
const html = htm.bind(h);

window.tabVis = {};

tabVis.init = function () {
    render(html`<${PositionVisualization}/>`, document.getElementById('tabVisVisContainer'));
    render(html`<${BtnSipPuffVisualization}/>`, document.getElementById('tabVisBtnSipVis'));
};

tabVis.destroy = function () {
    render(null, document.getElementById('tabVisVisContainer'));
    render(null, document.getElementById('tabVisBtnSipVis'));
}

window.tabVis.valueHandler = function (data) {
    BtnSipPuffVisualizationInstance.updateData(data);
    PositionVisualizationInstance.updateData(data);
    PositionVisualizationInstance.setStateListener((state) => {
        L('#sliderMaxRange').value = state.maxPos;
        L('#sliderMaxRangeValue').innerHTML = state.maxPos;
    })
};