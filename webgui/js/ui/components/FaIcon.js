import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class ActionButton extends Component {

    constructor(props) {
        super();
        this.state = {
            actionPerforming: false
        }
        this.props = props;
    }

    doAction() {
        this.props.onclick = this.props.onclick || (() => {
        });
        this.setState({
            actionPerforming: true
        });
        Promise.resolve(this.props.onclick()).then(() => {
            this.setState({
                actionPerforming: false
            });
        })
    }

    render(props) {
        props.label = props.label || '';
        props.progressLabel = props.progressLabel || this.props.label;
        return html`
            <button onclick="${() => this.doAction()}" disabled="${this.state.actionPerforming}">
                ${L.translate(this.state.actionPerforming ? props.progressLabel : props.label)}
            </button>`;
    }
}

export {ActionButton};