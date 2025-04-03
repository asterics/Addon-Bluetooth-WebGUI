import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { FaIcon } from "./FaIcon.js";
const html = htm.bind(h);

class ActionButton extends Component { // ActionButton is a react component which is basically a button.

    constructor(props) {
        super();
        this.state = {
            actionPerforming: false
        }
        this.props = props;
    }

    doAction() {
        this.props.onclick = this.props.onclick || (() => { });
        this.props.resetSlidersTiming = this.props.resetSlidersTiming || (() => { }); // props stands for properties and is possibly used for passing data and functions from a parent component to a child component in React.js.
        this.props.resetSlidersPuffSip = this.props.resetSlidersPuffSip || (() => { }); 

        this.setState({
            actionPerforming: true
        });
        Promise.resolve(this.props.onclick()).then(() => {
            this.props.resetSlidersTiming();
            this.props.resetSlidersPuffSip();
            
            this.setState({
                actionPerforming: false
            });
        })
    }


    render(props) {
        props.label = props.label || '';
        props.progressLabel = props.progressLabel || this.props.label;
        props.disabled = props.disabled || false;
        props.faIcon = props.faIcon || '';
        props.title = props.title || '';
        return html`
            <button onclick="${() => this.doAction()}" disabled="${this.state.actionPerforming || props.disabled}" title="${props.title}">
                ${html`<${FaIcon} icon="${this.props.faIcon}"/>`}
                ${L.translate(this.state.actionPerforming ? props.progressLabel : props.label)}
            </button>`;
    }

}

export { ActionButton };