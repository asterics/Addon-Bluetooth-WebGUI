import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class RadioFieldset extends Component {
    render(props) {
        props.onchange = props.onchange || (() => {});
        props.legend = props.legend || '';
        props.elements = props.elements || []; // objects with value and label property
        props.value = props.value !== undefined ? props.value : null;
        props.name = props.name || props.elements[0].value + props.elements[1].value;
        
        return html`
            <fieldset class="radio-fieldset m-0" role="radiogroup" onchange="${(event) => props.onchange(event.target.value || null)}">
                <legend>${L.translate(props.legend)}</legend>
                ${props.elements.map(el => html`
                    <div class="d-inline">
                        <input id="${props.name + '_' + el.value}" value="${el.value}" checked="${el.value === props.value}" name="${props.name}" type="radio" class="custom-radio"/>
                        <label for="${props.name + '_' + el.value}" class="button btnTransparent">${L.translate(el.label)}</label>
                    </div>
                `)}
            </fieldset>
            ${RadioFieldset.style}`;
    }
}

RadioFieldset.style = html`<style>
    .radio-fieldset .button {
        display: inline-block;
        padding: 0 5px !important;
        line-height: unset;
        width: unset;
        margin: 0.5em 0.5em 0.5em 0;
        text-transform: none;
    }
</style>`

export {RadioFieldset};