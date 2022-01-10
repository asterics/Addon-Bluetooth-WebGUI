import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {FaIcon} from "../components/FaIcon.js";
import {parsemd} from "../../../lib/parsemd.js";

const html = htm.bind(h);
class TextModal extends Component {

    constructor(props) {
        super();
        this.state = {
            text: '',
            currentUrl: ''
        }
    }
    
    render(props) {
        if (!this.props.textUrl) {
            return;
        }
        if (!this.state.text || props.textUrl !== this.state.currentUrl) {
            L.HTTPRequest(props.textUrl, 'GET', 'text').then(text => {
                this.setState({
                    text: text,
                    currentUrl: props.textUrl
                });
            });
        }

        return html`
            <div class="modal-mask text-modal">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <a class="close-button" href="javascript:void(0);" onclick="${() => props.close()}">X</a>
                        <div class="modal-header">
                            <h1 name="header">
                                <span>${props.header}</span>
                            </h1>
                        </div>
    
                        <div class="modal-body container-fluid p-0" dangerouslySetInnerHTML="${{__html: parsemd.parseMarkdown(this.state.text.replaceAll('\n* ', '\n- '))}}">
                        </div>
    
                        <div class="modal-footer mt-5">
                            <div class="row">
                                <div class="col">
                                    <button onclick="${() => props.close()}" class="button-primary">
                                        ${html`<${FaIcon} icon="fas times" invert="true"/>`}
                                        ${L.translate('Close // Schließen')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${TextModal.style}`
    }
}

TextModal.style = html`<style>
    .text-modal .modal-body h2 {
        font-size: 1.5em;
    }
    
    .text-modal .modal-body h3 {
        font-size: 1.2em;
    }
</style>`

export {TextModal};