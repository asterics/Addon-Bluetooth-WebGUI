import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {InputKeyboard} from "../comp/InputKeyboard.js";
import {RadioFieldset} from "../comp/RadioFieldset.js";

const html = htm.bind(h);
class ActionEditModal extends Component {

    constructor(props) {
        super();

        ActionEditModal.instance = this;

        let currentAtCmdString = flip.getATCmd(props.buttonMode.constant) || C.AT_CMD_NO_CMD;
        let currentAtCmdObject = C.AT_CMDS_ACTIONS.filter(atCmd => currentAtCmdString === atCmd.cmd)[0] || C.AT_CMDS_ACTIONS[0];
        currentAtCmdString = currentAtCmdObject.cmd;
        let showCategory = currentAtCmdString && currentAtCmdString !== C.AT_CMD_NO_CMD ? C.AT_CMDS_ACTIONS.filter(atCmd => atCmd.cmd === currentAtCmdString)[0].category: null;
        let possibleAtCmds = C.AT_CMDS_ACTIONS.filter(atCmd => !showCategory || atCmd.category === showCategory);
        this.state = {
            showCategory: showCategory,
            atCmd: currentAtCmdObject,
            atCmdSuffix: '',
            possibleAtCmds: possibleAtCmds,
            selectOptions: []
        }
    }

    selectActionCategory(category) {
        let possible = C.AT_CMDS_ACTIONS.filter(atCmd => !category || atCmd.category === category);
        let atCmd = possible.includes(this.state.atCmd) ? this.state.atCmd : possible[0];
        this.setState({
            showCategory: category,
            possibleAtCmds: possible
        });
        this.setAtCmd(atCmd.cmd);
    }

    setAtCmd(atCmdString) {
        let atCmdObject = C.AT_CMDS_ACTIONS.filter(atCmd => atCmdString === atCmd.cmd)[0];
        this.setState({
            atCmd: atCmdObject,
            selectOptions: []
        });
        if (atCmdObject.optionsFn) {
            let parts = atCmdObject.optionsFn.split('.');
            let fn = window;
            parts.forEach(part => {
                fn = fn[part];
            });
            Promise.resolve(fn()).then(result => {
                this.setState({
                    selectOptions: result
                });
            })
        }
    }

    setAtCmdSuffix(suffix) {
        this.setState({
            atCmdSuffix: suffix
        })
    }

    componentDidUpdate() {
        domI18nInstance.changeLanguage();
    }
    
    render(props) {
        let state = this.state;
        let btnMode = props.buttonMode;
        let categoryElements = C.AT_CMD_CATEGORIES.map(cat => {return {value: cat.constant, label: cat.label}});
        categoryElements = [{value: null, label: 'All categories // Alle Kategorien'}].concat(categoryElements);

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
                            <div class="filter-buttons mb-4">
                                ${html`<${RadioFieldset} legend="Show action categories: // Zeige Aktions-Kategorien:" onchange="${(value) => this.selectActionCategory(value)}" elements="${categoryElements}" value="${state.showCategory}"/>`}
                            </div>
                            <div class="row">
                                <label for="actionSelect" class="col-md-4" data-i18n="">Selection action // Aktion auswählen</label>
                                <div class="col-md-8" >
                                    <select id="actionSelect" class="col-12" value="${state.atCmd.cmd}" onchange="${(event) => this.setAtCmd(event.target.value)}">
                                        ${state.possibleAtCmds.map(atCmd => html`<option value="${atCmd.cmd}">${L.translate(atCmd.label)}</option>`)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                ${(() => {
                                    switch (state.atCmd.input) {
                                        case C.INPUTFIELD_TYPE_TEXT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" type="text" class="col-12"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_NUMBER:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" type="number" class="col-12"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_SELECT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <select class="col-12">
                                                            ${state.selectOptions.map(option => html`<option value="${option}">${option}</option>`)}
                                                        </select>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_KEYBOARD:
                                            return html`<${InputKeyboard} onchange="${(value) => this.setAtCmdSuffix(value)}"/>`;
                                    }
                                })()}
                            </div>
                        </div>
    
                        <div class="modal-footer mt-4">
                            <div class="button-container">
                                <button title="Keyboard: [Esc]" onclick="${() => props.closeHandler()}">
                                    <i class="fas fa-times"/> <span data-i18n>Cancel // Abbrechen</span>
                                </button>
                                <button title="Keyboard: [Ctrl + Enter]">
                                    <i class="fas fa-check"/> <span data-i18n>OK</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    }
}

export {ActionEditModal};