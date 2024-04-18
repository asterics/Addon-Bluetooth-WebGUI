import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {styleUtil} from "../../../js/util/styleUtil.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {MouseAndKeyboardVisualization} from "../../../js/ui/components/MouseAndKeyboardVisualization.js";

const html = htm.bind(h);

class TabVisualization extends Component {
    constructor(props) {
        super(props);

        TabVisualization.instance = this;
        if (ATDevice.isMajorVersion(3)) {
          TabVisualization.BTN_NAMES = ["1", "2", "3", "4", "5", null, null, null, null, null, "Sip // Ansaugen", "Puff // Pusten", "Strong Sip // Starkes Ansaugen", "Strong Puff // Starkes Pusten"];

        } else {
          TabVisualization.BTN_NAMES = ["1", "2", "3", "4", "5", "6", "7", "8", null, "Sip // Ansaugen", "Puff // Pusten"];
          TabVisualization.BTN_NAMES_LONGPRESS = ["1", "2", "3", "4", "5", "6", "7", "8", null, "Sip // Ansaugen", "Puff // Pusten"];
        }
        this.setState({
            liveData: {}
        })
    }

    componentWillUnmount() {
        TabVisualization.instance = null;
    }

    render() {
        let data = this.state.liveData;
        if (!data.LIVE_BUTTONS) {
            return;
        }
        let circleRadius = Math.min(70, window.innerWidth / 7);
        let fontStyle = `text-align: center; line-height: ${circleRadius}px; font-size: 30px`;
        let longpressActive = ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS) > 0;
        let btnNames;
        if (ATDevice.isMajorVersion(3)) {
          btnNames = TabVisualization.BTN_NAMES;

        } else {
          btnNames = longpressActive ? TabVisualization.BTN_NAMES_LONGPRESS : TabVisualization.BTN_NAMES;
        }
        let longPressStates = longpressActive ? data.LIVE_BUTTONS.slice(6, 9) : [];
        return html`<h2 id="tabVisHeader" style="margin-bottom: 1em">${L.translate('Visualization of current button state // Visualisierung aktueller Button-Status')}</h2>
        <div aria-hidden="true" style="display: flex; flex-wrap: wrap;">
            ${!data.LIVE_BUTTONS ? '' : data.LIVE_BUTTONS.map((buttonState, index) => {
                if (!btnNames[index]) {
                    return '';
                }
                let color = buttonState ? 'orange' : 'transparent';
                if (longpressActive && longPressStates[index]) {
                    color = 'orangered';
                }
                return html`<div style="margin: 10px; ${styleUtil.getCircleStyle(circleRadius, color, 'medium solid')}; ${fontStyle}">${L.translate(btnNames[index])}</div>`
            })}
        </div>
        <h3 class="mt-5">${L.translate('Currently pressed buttons // Aktuell gedrückte Tasten')}</h3>
        <div>
            <${MouseAndKeyboardVisualization}/>
        </div>
            `;
    }
}

TabVisualization.valueHandler = function (data) {
    TabVisualization.instance.setState({
        liveData: data
    })
};

export {TabVisualization};
