import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {InputKeyboard} from "../components/InputKeyboard.js";
import {ManageIR} from "../../../js_fm/ui/components/ManageIR.js";
import {RadioFieldset} from "../components/RadioFieldset.js";
import {ATDevice} from "../../communication/ATDevice.js";
import {InputMacro} from "../components/InputMacro.js";
import {ActionButton} from "../components/ActionButton.js";
import {FaIcon} from "../components/FaIcon.js";

const html = htm.bind(h);
class ActionEditModal extends Component {

    constructor(props) {
        super();

        ActionEditModal.instance = this;
        ActionEditModal.ALL_CATEGORIES = 'ALL_CATEGORIES';

        this.props = props;
        let currentAtCmdString = ATDevice.getButtonActionATCmd(props.buttonMode.index, props.slot) || C.AT_CMD_NO_CMD;
        let currentAtCmdObject = C.AT_CMDS_ACTIONS.filter(atCmd => currentAtCmdString === atCmd.cmd)[0] || C.AT_CMDS_ACTIONS[0];
        currentAtCmdString = currentAtCmdObject.cmd;
        let showCategory = currentAtCmdString && currentAtCmdString !== C.AT_CMD_NO_CMD ? C.AT_CMDS_ACTIONS.filter(atCmd => atCmd.cmd === currentAtCmdString)[0].category: ActionEditModal.ALL_CATEGORIES;
        let possibleAtCmds = C.AT_CMDS_ACTIONS.filter(atCmd => showCategory === ActionEditModal.ALL_CATEGORIES || atCmd.category === showCategory);
        this.state = {
            showCategory: showCategory,
            atCmd: currentAtCmdObject,
            atCmdSuffix: ATDevice.getButtonActionATCmdSuffix(props.buttonMode.index, props.slot),
            atCmdSelectedByUser: false,
            possibleAtCmds: possibleAtCmds,
            selectOptions: [],
            shouldChangeMode: false,
            hasChanges: false
        }
        this.state.originalState = JSON.parse(JSON.stringify(this.state));
        this.updateSelect(currentAtCmdObject);
    }

    selectActionCategory(category, dontChangeAtCmd) {
        let possible = C.AT_CMDS_ACTIONS.filter(atCmd => category === ActionEditModal.ALL_CATEGORIES || atCmd.category === category);
        this.setState({
            showCategory: category,
            possibleAtCmds: possible
        });
        if (!dontChangeAtCmd) {
            let atCmd = possible.includes(this.state.atCmd) ? this.state.atCmd : possible[0];
            atCmd = !this.state.atCmdSelectedByUser && possible.map(atCmd => atCmd.cmd).includes(this.state.originalState.atCmd.cmd) ? this.state.originalState.atCmd : atCmd;
            this.setAtCmd(atCmd.cmd);
        }
    }

    setAtCmd(atCmdString) {
        let atCmdObject = C.AT_CMDS_ACTIONS.filter(atCmd => atCmdString === atCmd.cmd)[0];
        let isAndWasKeyboard = atCmdObject.input === C.INPUTFIELD_TYPE_KEYBOARD && this.state.atCmd.input === C.INPUTFIELD_TYPE_KEYBOARD;
        let atCmdSuffix = isAndWasKeyboard ? this.state.atCmdSuffix : '';
        if (!this.state.atCmdSelectedByUser && atCmdObject.cmd === this.state.originalState.atCmd.cmd) {
            atCmdSuffix = this.state.originalState.atCmdSuffix;
        }
        this.setState({
            atCmdSuffix: atCmdSuffix,
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
            Promise.resolve(atCmdObject.optionsFn()).then(result => {
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
            atCmdSelectedByUser: true,
            atCmdSuffix: suffix,
            hasChanges: true
        })
    }

    async save(forAllSlots) {
        await ATDevice.setSlot(this.props.slot);
        if (this.state.shouldChangeMode && ATDevice.Specific.setFlipmouseMode) {
            await ATDevice.Specific.setFlipmouseMode(C.DEVICE_IS_FLIPPAD ? C.FLIPPAD_MODE_PAD_ALTERNATIVE.value : C.FLIPMOUSE_MODE_ALT.value)
        }
        if (this.state.hasChanges) {
            let atCmd = this.state.atCmdSuffix ? this.state.atCmd.cmd + ' ' + this.state.atCmdSuffix : this.state.atCmd.cmd;
            ATDevice.setButtonAction(this.props.buttonMode.index, atCmd);
        }
        if (forAllSlots) {
            let constants = [C.AT_CMD_BTN_MODE + " " + this.props.buttonMode.index];
            if (C.DEVICE_IS_FM_OR_PAD && this.props.buttonMode.category === C.BTN_CAT_STICK) {
                constants.push(C.AT_CMD_FLIPMOUSE_MODE)
            }
            await ATDevice.copyConfigToAllSlots(constants, this.props.slot, true);
        }
        this.props.closeHandler();
    }

    saveButtonsDisabled() {
        if (this.state.atCmd.minValue !== undefined && this.state.atCmdSuffix < this.state.atCmd.minValue) {
            return true;
        }
        if (this.state.atCmd.maxValue !== undefined && this.state.atCmdSuffix > this.state.atCmd.maxValue) {
            return true;
        }
        return this.state.atCmd.input && !this.state.atCmdSuffix;
    }

    clearCommand() {
        this.setAtCmd(C.AT_CMD_NO_CMD);
        this.selectActionCategory(ActionEditModal.ALL_CATEGORIES, true);
        let originalState = JSON.parse(JSON.stringify(this.state.originalState));
        originalState.atCmd = C.AT_CMDS_ACTIONS.filter(atCmd => atCmd.cmd === C.AT_CMD_NO_CMD)[0];
        this.setState({
            atCmdSelectedByUser: true,
            originalState: originalState,
            atCmdSuffix: ''
        });
    }
    
    render(props) {
        let state = this.state;
        let btnMode = props.buttonMode;
        let categoryElements = C.AT_CMD_CATEGORIES.map(cat => {return {value: cat.constant, label: cat.label}});
        categoryElements = [{value: ActionEditModal.ALL_CATEGORIES, label: 'All categories // Alle Kategorien'}].concat(categoryElements);
        let flipmouseAltMode = C.DEVICE_IS_FM && ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, props.slot) === C.FLIPMOUSE_MODE_ALT.value;
        let flipadAltMode = C.DEVICE_IS_FLIPPAD && [C.FLIPPAD_MODE_PAD_ALTERNATIVE.value, C.FLIPPAD_MODE_STICK_ALTERNATIVE.value].includes(ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, props.slot));
        let showActionSelection = C.DEVICE_IS_FABI || flipmouseAltMode || flipadAltMode || btnMode.category !== C.BTN_CAT_STICK || state.shouldChangeMode;
        let modeLabel = C.DEVICE_IS_FM_OR_PAD ? C.FLIPMOUSE_MODES.filter(mode => mode.value === ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, props.slot))[0].label : '';

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
                                <span class="pr-2 ${C.DEVICE_IS_FM ? '' : 'd-none'}">${L.translate('Stick is currently used for: // Stick wird derzeit verwendet für:')}</span>
                                <span class="pr-2 ${C.DEVICE_IS_FLIPPAD ? '' : 'd-none'}">${L.translate('Pad is currently used for: // Pad wird derzeit verwendet für:')}</span>
                                <strong>${L.translate(modeLabel)}</strong>
                                <div>
                                    <a href="javascript:;" onclick="${() => this.setState({shouldChangeMode: true})}">
                                        <span>${L.translate('Deactivate {?} mode for defining an action // {?} deaktivieren um Aktion zu konfigurieren', modeLabel)}</span>
                                    </a>
                                </div>
                            </div>
                            <div class="${!showActionSelection ? 'd-none' : ''}">
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <span>${L.translate('Current action: // Aktuelle Aktion:')}</span> <span class="mr-3">${L.translate(state.originalState.atCmd.label)}</span>
                                        <button class="small-button my-3" onclick="${() => this.clearCommand()}" disabled="${state.originalState.atCmd.cmd === C.AT_CMD_NO_CMD}">${html`<${FaIcon} icon="far trash-alt"/>`} ${L.translate('Delete // Löschen')}</button>
                                    </div>
                                </div>
                                <div class="filter-buttons mb-4">
                                    ${html`<${RadioFieldset} legend="Show action categories: // Zeige Aktions-Kategorien:" onchange="${(value) => this.selectActionCategory(value)}" elements="${categoryElements}" value="${state.showCategory}"/>`}
                                </div>
                                <div class="row">
                                    <label for="actionSelect" class="col-md-4">${L.translate('Select action // Aktion auswählen')}</label>
                                    <div class="col-md-8">
                                        <select id="actionSelect" class="col-12" value="${state.atCmd.cmd}" onchange="${(event) => {this.setState({atCmdSelectedByUser: true}); this.setAtCmd(event.target.value)}}">
                                            ${state.possibleAtCmds.map(atCmd => html`<option value="${atCmd.cmd}">${L.translate(atCmd.label)}</option>`)}
                                        </select>
                                    </div>
                                </div>
                                ${(() => {
                                    switch (state.atCmd.input) {
                                        case C.INPUTFIELD_TYPE_TEXT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" value="${state.atCmdSuffix}" oninput="${(event) => this.setAtCmdSuffix(event.target.value)}" type="text" class="col-12" placeholder="${L.translate('Input text // Text eingeben')}"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_NUMBER:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <input id="inputText" value="${state.atCmdSuffix}" type="number" oninput="${(event) => this.setAtCmdSuffix(event.target.value)}" class="col-12"
                                                               placeholder="${L.translate('Input number // Zahl eingeben') + (state.atCmd.minValue !== undefined ? ` [${state.atCmd.minValue}-${this.state.atCmd.maxValue}]` : '')}"
                                                               min="${state.atCmd.minValue}" max="${state.atCmd.maxValue}"/>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_SELECT:
                                            return html`
                                                <div class="row">
                                                    <label for="inputText" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                    <div class="col-md-8">
                                                        <select class="col-12" value="${state.atCmdSuffix || state.selectOptions[0]}" onchange="${(event) => this.setAtCmdSuffix(event.target.value)}" disabled="${state.selectOptions.length === 0}">
                                                            ${state.selectOptions.length === 0 ? html`<option value="" disabled selected>${L.translate('(empty) // (leer)')}</option>` : ''}
                                                            ${state.selectOptions.map(option => html`<option value="${option}">${option}</option>`)}
                                                        </select>
                                                    </div>
                                                </div>`;
                                        case C.INPUTFIELD_TYPE_KEYBOARD:
                                            return html`<${InputKeyboard} value="${state.atCmdSuffix}"  onchange="${(value) => this.setAtCmdSuffix(value)}"/>`;
                                        case C.INPUTFIELD_TYPE_MACRO:
                                            return html`<${InputMacro} value="${state.atCmdSuffix}"  onchange="${(value) => this.setAtCmdSuffix(value)}"/>`;
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
                                        ${html`<${FaIcon} icon="fas times"/>`}
                                        ${L.translate('Cancel // Abbrechen')}
                                    </button>
                                </div>
                                <div class="col">
                                    <button onclick="${() => this.save()}" disabled="${this.saveButtonsDisabled()}" class="button-primary">
                                        ${html`<${FaIcon} icon="fas save" invert="true"/>`}
                                        ${L.translate('Save // Speichern')}
                                    </button>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 offset-6">
                                    ${html`<${ActionButton} onclick="${() => this.save(true)}"
                                        label="Save for alls slots // Für alle Slots speichern"
                                        progressLabel="Saving to all slots... // Speichern für alle Slots..." 
                                        disabled="${this.saveButtonsDisabled()}"
                                        faIcon="far clone"/>`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${ActionEditModal.style}`
    }
}

ActionEditModal.style = html`<style>
    .small-button {
        display: inline-block;
        padding: 0 10px !important;
        line-height: unset;
        width: unset;
        margin: 0.5em 0.5em 0.5em 0;
        text-transform: none;
    }
</style>`

export {ActionEditModal};