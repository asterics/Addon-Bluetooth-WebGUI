import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {styleUtil} from "../../../js/util/styleUtil.js";

const html = htm.bind(h);

class TabVisualization extends Component {
    constructor(props) {
        super(props);

        TabVisualization.instance = this;
        this.setState({
            liveData: {}
        })
    }

    componentWillUnmount() {
        TabVisualization.instance = null;
    }

    render() {
        let data = this.state.liveData;
        let circleRadius = Math.min(70, window.innerWidth / 7);
        let fontStyle = `text-align: center; line-height: ${circleRadius}px; font-size: 30px`;
        return html`<h2 id="tabVisHeader" style="margin-bottom: 1em">${L.translate('Visualization of current button state // Visualisierung aktueller Button-Status')}</h2>
        <div aria-hidden="true" style="display: flex; flex-wrap: wrap;">
            ${!data.LIVE_BUTTONS ? '' : data.LIVE_BUTTONS.map((buttonState, index) => html`
                <div style="margin: 10px; ${styleUtil.getCircleStyle(circleRadius, buttonState ? 'orange' : 'transparent', 'medium solid')}; ${fontStyle}">${index + 1}</div>
            `)}
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