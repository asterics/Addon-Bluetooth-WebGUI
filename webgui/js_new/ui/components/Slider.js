import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class Slider extends Component {
    render(props) {
        props.label = props.label || '';
        props.lang = props.lang || '';
        props.oninput = props.oninput || (() => { });
        props.value = props.value !== undefined ? props.value : null;
        props.min = props.min !== undefined ? props.min : 0;
        props.max = props.max !== undefined ? props.max : 255;
        props.step = props.step !== undefined ? props.step : '';
        props.updateConstants = props.updateConstants || [];
        props.toggleFn = props.toggleFn || (() => { });
        props.toggleFnLabel = props.toggleFnLabel || '';
        props.viewFactor = props.viewFactor || 1;
        let id = props.updateConstants[0];

        return html`
            <div class="d-flex justify-content-between">
                <label for="${id}" lang="${props.lang}" dangerouslySetInnerHTML="${{ __html: L.translate(props.label) }}"></label>
                <a class="${!props.toggleFnLabel ? 'd-none' : ''}" href="javascript:;" onclick="${() => props.toggleFn()}">${L.translate(props.toggleFnLabel)}</a>
            </div>
            <div class="row">
                <span aria-hidden="true" class="col-sm-1">${props.value * props.viewFactor}</span>
                <input type="range" value="${props.value}" oninput="${(event) => props.oninput(event.target.value, props.updateConstants)}"
                       id="${id}" min="${props.min}" max="${props.max}" step="${props.step}" class="col-sm-11"/>
            </div>
            ${Slider.style}`;
    }
}

Slider.style = html`<style>

</style>`

export { Slider };