import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';

const html = htm.bind(h);
class ActionEditModal extends Component {

    constructor(props) {
        super();

        ActionEditModal.instance = this;
        this.state = {
        }
    }
    
    render(props) {
        let state = this.state;
        let btnMode = props.buttonMode;

        return html`
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <a class="close-button" href="javascript:void(0);" onclick="${() => props.closeHandler()}">X</a>
                        <div class="modal-header">
                            <h1 name="header">
                                <span data-i18n="">Action for  // Aktion für </span>
                                <span>"${L.translate(btnMode.label)}"</span>
                            </h1>
                        </div>
    
                        <div class="modal-body container-fluid">
                            <div class="row"></div>
                        </div>
    
                        <div class="modal-footer">
                            <div class="button-container">
                                <button title="Keyboard: [Esc]" onclick="${() => props.closeHandler()}">
                                    <i class="fas fa-times"/> <span data-i18n>Cancel // Abbrechen</span>
                                </button>
                                <button title="Keyboard: [Ctrl + Enter]">
                                    <i class="fas fa-check"/> <span data-i18n>Insert words // Wörter einfügen</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    }
}

export {ActionEditModal};