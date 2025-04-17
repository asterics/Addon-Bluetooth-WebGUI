import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { styleUtil } from "../../util/styleUtil.js";
import { ATDevice } from "../../communication/ATDevice.js";
import { MouseAndKeyboardVisualization } from "../components/MouseAndKeyboardVisualization.js";

const html = htm.bind(h);

class TabVisualization extends Component {
    constructor(props) {
        super(props);

        TabVisualization.instance = this;

        // Dynamically initialize the first C.PHYSICAL_BUTTON_COUNT elements
        const physicalButtonCount = C.PHYSICAL_BUTTON_COUNT; 
        const physicalButtonNames = Array.from({ length: physicalButtonCount }, (_, i) => `${i + 1}`);

        // Add the remaining button (virtual button function) names
        const additionalButtonNames = ["Up // Rauf", "Down // Runter", "Left // Links", "Right // Rechts", "Sip // Ansaugen", "Strong Sip // Starkes Ansaugen", "Puff // Pusten", "Strong Puff // Starkes Pusten"];
        TabVisualization.BTN_NAMES = [...physicalButtonNames, ...additionalButtonNames];

        this.setState({
            liveData: {}
        })
    }

    componentWillUnmount() { // When changing the visualisation tab (GUI) it resets.
        TabVisualization.instance = null;
    }

    render() {
        let data = this.state.liveData;
        if (!data.LIVE_BUTTONS) {
            return;
        }
        let circleRadius = Math.min(70, window.innerWidth / 7);
        let fontStyle = `text-align: center; line-height: ${circleRadius}px; font-size: 25px`;
        let btnNames;
        btnNames = TabVisualization.BTN_NAMES;

        return html`<h2 id="tabVisHeader" style="margin-bottom: 1em">${L.translate('Visualization of current button state // Visualisierung aktueller Button-Status')}</h2>
        <div aria-hidden="true" style="display: flex; flex-wrap: wrap;">
            ${!data.LIVE_BUTTONS ? '' : data.LIVE_BUTTONS.map((buttonState, index) => {
            if (!btnNames[index]) {
                return '';
            }
            if ((!ATDevice.getSensorInfo()[C.FORCE_SENSOR]) && (index >= C.PHYSICAL_BUTTON_COUNT && index < C.PHYSICAL_BUTTON_COUNT+4)) {  // up, down, left, right buttons (functions)
                return '';
            }
            if ((!ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]) && (index >= C.PHYSICAL_BUTTON_COUNT+4)) {  // sip and puff buttons (functions)
                return '';
            }

            let color = buttonState ? 'orange' : 'transparent';
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

export { TabVisualization };
