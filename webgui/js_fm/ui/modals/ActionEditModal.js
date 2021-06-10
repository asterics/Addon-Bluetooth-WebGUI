import { h, Component, render } from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js';
import {InputKeyboard} from "../components/InputKeyboard.js";
import {ManageIR} from "../components/ManageIR.js";
import {RadioFieldset} from "../components/RadioFieldset.js";

const html = htm.bind(h);
class ActionEditModal extends Component {

    constructor(props) {
        super();

        ActionEditModal.instance = this;
        this.props = props;

        let currentAtCmdString = flip.getButtonActionATCmd(props.buttonMode.index, props.slot) || C.AT_CMD_NO_CMD;
        let currentAtCmdObject = C.AT_CMDS_ACTIONS.filter(atCmd => currentAtCmdString === atCmd.cmd)[0] || C.AT_CMDS_ACTIONS[0];
        currentAtCmdString = currentAtCmdObject.cmd;
        let showCategory = currentAtCmdString && currentAtCmdString !== C.AT_CMD_NO_CMD ? C.AT_CMDS_ACTIONS.filter(atCmd => atCmd.cmd === currentAtCmdString)[0].category: null;
        let possibleAtCmds = C.AT_CMDS_ACTIONS.filter(atCmd => !showCategory || atCmd.category === showCategory);
        this.state = {
            showCategory: showCategory,
            atCmd: currentAtCmdObject,
            atCmdSuffix: flip.getButtonActionATCmdSuffix(props.buttonMode.index, props.slot),
            possibleAtCmds: possibleAtCmds,
            selectOptions: [],
            shouldChangeMode: false,
            hasChanges: false
        }
        this.updateSelect(currentAtCmdObject);
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
        let isAndWasKeyboard = atCmdObject.input === C.INPUTFIELD_TYPE_KEYBOARD && this.state.atCmd.input === C.INPUTFIELD_TYPE_KEYBOARD;
        this.setState({
            atCmdSuffix: isAndWasKeyboard ? this.state.atCmdSuffix : '',
            atCmd: atCmdObject,
            selectOptions: [],
            hasChanges: true
        });
        this.updateSelect(atCmdObject);
    }

    updateIrSelect(newName) {
        if (newName) {
            this.setAtCmdSuffix(newName);
        }
        this.updateSelect();
    }

    updateSelect(atCmdObject) {
        atCmdObject = atCmdObject || this.state.atCmd;
        if (atCmdObject.optionsFn) {
            let parts = atCmdObject.optionsFn.split('.');
            let fn = window;
            parts.forEach(part => {
                fn = fn[part];
            });
            Promise.resolve(fn()).then(result => {
                result = result || [];
                this.setState({
                    selectOptions: result,
                    atCmdSuffix: result.includes(this.state.atCmdSuffix) ? this.state.atCmdSuffix : result[0]
                });
            })
        }
    }

    setAtCmdSuffix(suffix) {
        this.setState({
            atCmdSuffix: suffix,
            hasChanges: true
        })
    }

    save() {
        if (this.state.shouldChangeMode) {
            flip.setFlipmouseMode(C.FLIPMOUSE_MODE_ALT.value)
        }
        if (this.state.hasChanges) {
            let atCmd = this.state.atCmdSuffix ? this.state.atCmd.cmd + ' ' + this.state.atCmdSuffix : this.state.atCmd.cmd;
            flip.setButtonAction(this.props.buttonMode.index, atCmd);
        }
        this.props.closeHandler();
    }
    
    render(props) {
        let state = this.state;
        let btnMode = props.buttonMode;
        let categoryElements = C.AT_CMD_CATEGORIES.map(cat => {return {value: cat.constant, label: cat.label}});
        categoryElements = [{value: null, label: 'All categories // Alle Kategorien'}].concat(categoryElements);
        let showActionSelection = flip.getConfig(C.AT_CMD_FLIPMOUSE_MODE) === C.FLIPMOUSE_MODE_ALT.value || btnMode.category !== C.BTN_CAT_STICK || state.shouldChangeMode;
        let mode = C.FLIPMOUSE_MODES.filter(mode => mode.value === flip.getConfig(C.AT_CMD_FLIPMOUSE_MODE, props.slot))[0];

        return html`
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <a class="close-button" href="javascript:void(0);" onclick="${() => props.closeHandler()}">X</a>
                        <div class="modal-header">
                            <h1 name="header">
                                <span>${L.translate('Action for  // Aktion für ')}</span>
                                <span>"${L.translate(btnMode.label)}"</span>
                                <span> (Slot: ${props.slot})</span>
                            </h1>
                        </div>
    
                        <div class="modal-body container-fluid p-0">
                            <div class="${showActionSelection ? 'd-none' : ''}">
                                <span class="pr-2">${L.translate('Stick is currently used for: // Stick wird derzeit verwendet für:')}</span>
                                <strong>${L.translate(mode.label)}</strong>
                                <div>
                                    <a href="javascript:;" onclick="${() => this.setState({shouldChangeMode: true})}">
                                        <span>${L.translate('Deactivate {?} mode for defining an action // {?} deaktivieren um Aktion zu konfigurieren', mode.label)}</span>
                                    </a>
                                </div>
                            </div>
                            <div class="${!showActionSelection ? 'd-none' : ''}">
                                <div class="filter-buttons mb-4">
                                    ${html`<${RadioFieldset} legend="Show action categories: // Zeige Aktions-Kategorien:" onchange="${(value) => this.selectActionCategory(value)}" elements="${categoryElements}" value="${state.showCategory}"/>`}
                                </div>
                                <div class="row">
                                    <label for="actionSelect" class="col-md-4">${L.translate('Selection action // Aktion auswählen')}</label>
                                    <div class="col-md-8">
                                        <select id="actionSelect" class="col-12" value="${state.atCmd.cmd}" onchange="${(event) => this.setAtCmd(event.target.value)}">
                                            ${state.possibleAtCmds.map(atCmd => html`<option value="${atCmd.cmd}">${L.translate(atCmd.label)}</option>`)}
                                        </select>
                                    </div>
                                </div>
                                ${(() => {
                                    switch (state.atCmd.input) {
                                        case C.INPUTFIELD_TYPE_TEXT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" value="${state.atCmdSuffix}" oninput="${(event) => this.setAtCmdSuffix(event.target.value)}" type="text" class="col-12" placeholder="${L.translate('Input text // Text eingeben')}"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_NUMBER:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" value="${parseInt(state.atCmdSuffix)}" type="number" oninput="${(event) => this.setAtCmdSuffix(parseInt(event.target.value))}" placeholder="${L.translate('Input number // Zahl eingeben')}" class="col-12"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_SELECT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <select class="col-12" value="${state.atCmdSuffix || state.selectOptions[0]}" onchange="${(event) => this.setAtCmdSuffix(event.target.value)}" disabled="${state.selectOptions.length === 0}">
                                                            ${state.selectOptions.length === 0 ? html`<option value="" disabled selected>${L.translate('(empty) // (leer)')}</option>` : ''}
                                                            ${state.selectOptions.map(option => html`<option value="${option}">${option}</option>`)}
                                                        </select>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_KEYBOARD:
                                            return html`<${InputKeyboard} value="${state.atCmdSuffix}"  onchange="${(value) => this.setAtCmdSuffix(value)}"/>`;
                                    }
                                })()}
                                ${(() => {
                                    if (state.atCmd.category === C.AT_CMD_CAT_IR && state.atCmd.input === C.INPUTFIELD_TYPE_SELECT) {
                                            return html`<${ManageIR} irCmds="${state.selectOptions}" onchange="${(newName) => this.updateIrSelect(newName)}"/>`;
                                    }
                                })()}
                            </div>
                        </div>
    
                        <div class="modal-footer mt-5">
                            <div class="row">
                                <div class="col">
                                    <button onclick="${() => props.closeHandler()}">
                                        ${L.translate('Cancel // Abbrechen')}
                                    </button>
                                </div>
                                <div class="col">
                                    <button onclick="${() => this.save()}" disabled="${this.state.atCmd.input && !this.state.atCmdSuffix}" class="button-primary">${L.translate('Save // Speichern')}</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`
    }
}

export {ActionEditModal};