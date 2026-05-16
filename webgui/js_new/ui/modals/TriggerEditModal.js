import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { InputKeyboard } from "../components/InputKeyboard.js";
import { InputMacro } from "../components/InputMacro.js";
import { ManageIR } from "../components/ManageIR.js";
import { RadioFieldset } from "../components/RadioFieldset.js";
import { ActionButton } from "../components/ActionButton.js";
import { FaIcon } from "../components/FaIcon.js";
import { ATDevice } from "../../communication/ATDevice.js";
const html = htm.bind(h);

class TriggerEditModal extends Component {

    constructor(props) {
        super();
        TriggerEditModal.ALL_CATEGORIES = 'ALL_CATEGORIES';

        // Parse expression terms from existing trigger, or start with a default
        let terms = props.trigger
            ? TriggerEditModal.parseExpression(props.trigger.expression, props.buttonOptions)
            : [TriggerEditModal.defaultTerm(props.buttonOptions)];

        // Resolve action command object and suffix from trigger.action string
        let actionStr = props.trigger ? ((props.trigger.action || '').trim() || C.AT_CMD_NO_CMD) : C.AT_CMD_NO_CMD;
        let currentAtCmdObject = C.AT_CMDS_ACTIONS
            .filter(c => actionStr === c.cmd || actionStr.startsWith(c.cmd + ' '))
            .sort((a, b) => b.cmd.length - a.cmd.length)[0];
        if (!currentAtCmdObject) {
            currentAtCmdObject = C.AT_CMDS_ACTIONS.filter(c => c.cmd === C.AT_CMD_NO_CMD)[0] || C.AT_CMDS_ACTIONS[0];
        }
        let atCmdSuffix = actionStr.startsWith(currentAtCmdObject.cmd + ' ')
            ? actionStr.substring(currentAtCmdObject.cmd.length + 1).trim()
            : '';

        let showCategory = currentAtCmdObject.cmd && currentAtCmdObject.cmd !== C.AT_CMD_NO_CMD
            ? currentAtCmdObject.category
            : TriggerEditModal.ALL_CATEGORIES;
        let possibleAtCmds = C.AT_CMDS_ACTIONS.filter(c =>
            showCategory === TriggerEditModal.ALL_CATEGORIES || c.category === showCategory
        );

        this.state = {
            terms,
            showCategory,
            atCmd: currentAtCmdObject,
            atCmdSuffix,
            possibleAtCmds,
            selectOptions: [],
            busy: false,
            error: ''
        };

        this.updateSelect(currentAtCmdObject);
    }

    static defaultTerm(buttonOptions) {
        return {
            type: 'tap',
            button: (buttonOptions || [])[0] || 'B1',
            tapCount: 1,
            duration: ''
        };
    }

    static parseExpression(expression, buttonOptions) {
        let chunks = (expression || '').split('+').map(e => e.trim()).filter(e => !!e);
        if (chunks.length === 0) return [TriggerEditModal.defaultTerm(buttonOptions)];
        let terms = chunks.map(chunk => {
            let match = chunk.match(/^(tap|press|release|long)\(([^,)]+)(?:,([0-9]+))?\)$/i);
            if (!match) return null;
            let type = match[1].toLowerCase();
            let button = match[2].trim();
            let param = match[3] ? parseInt(match[3]) : null;
            return {
                type,
                button,
                tapCount: type === 'tap' ? (param || 1) : 1,
                duration: type === 'long' ? (param || '') : ''
            };
        }).filter(e => !!e);
        return terms.length > 0 ? terms : [TriggerEditModal.defaultTerm(buttonOptions)];
    }

    static buildTermExpression(term) {
        let button = (term.button || '').trim();
        if (!button) return '';
        if (term.type === 'tap') {
            let tapCount = parseInt(term.tapCount || 1);
            return tapCount > 1 ? `tap(${button},${tapCount})` : `tap(${button})`;
        }
        if (term.type === 'long') {
            let duration = parseInt(term.duration || 0);
            return duration > 0 ? `long(${button},${duration})` : `long(${button})`;
        }
        if (term.type === 'press') return `press(${button})`;
        if (term.type === 'release') return `release(${button})`;
        return '';
    }

    buildTriggerExpression() {
        return this.state.terms
            .map(term => TriggerEditModal.buildTermExpression(term))
            .filter(e => !!e)
            .join('+');
    }

    updateTerm(idx, updates) {
        let terms = this.state.terms.map((t, i) => i === idx ? Object.assign({}, t, updates) : t);
        this.setState({ terms });
    }

    addTerm() {
        let terms = this.state.terms.concat([TriggerEditModal.defaultTerm(this.props.buttonOptions)]);
        this.setState({ terms });
    }

    removeTerm(idx) {
        if (this.state.terms.length <= 1) return;
        let terms = this.state.terms.filter((_, i) => i !== idx);
        this.setState({ terms });
    }

    selectActionCategory(category) {
        let possible = C.AT_CMDS_ACTIONS.filter(c =>
            category === TriggerEditModal.ALL_CATEGORIES || c.category === category
        );
        let atCmd = possible.includes(this.state.atCmd) ? this.state.atCmd : possible[0];
        this.setState({ showCategory: category, possibleAtCmds: possible });
        this.setAtCmd(atCmd.cmd);
    }

    setAtCmd(atCmdString) {
        let atCmdObject = C.AT_CMDS_ACTIONS.filter(c => c.cmd === atCmdString)[0];
        if (!atCmdObject) return;
        let isAndWasKeyboard = atCmdObject.input === C.INPUTFIELD_TYPE_KEYBOARD && this.state.atCmd.input === C.INPUTFIELD_TYPE_KEYBOARD;
        this.setState({
            atCmd: atCmdObject,
            atCmdSuffix: isAndWasKeyboard ? this.state.atCmdSuffix : '',
            selectOptions: []
        });
        this.updateSelect(atCmdObject);
    }

    updateIrSelect(newName) {
        if (newName) this.setAtCmdSuffix(newName);
        this.updateSelect();
    }

    updateSelect(atCmdObject) {
        atCmdObject = atCmdObject || this.state.atCmd;
        if (atCmdObject && atCmdObject.optionsFn) {
            Promise.resolve(atCmdObject.optionsFn()).then(result => {
                result = result || [];
                this.setState({
                    selectOptions: result,
                    atCmdSuffix: result.includes(this.state.atCmdSuffix) ? this.state.atCmdSuffix : (result[0] || '')
                });
            });
        }
    }

    setAtCmdSuffix(suffix) {
        this.setState({ atCmdSuffix: suffix });
    }

    saveButtonsDisabled() {
        let s = this.state;
        if (!this.buildTriggerExpression()) return true;
        if (s.atCmd && s.atCmd.minValue !== undefined && s.atCmdSuffix < s.atCmd.minValue) return true;
        if (s.atCmd && s.atCmd.maxValue !== undefined && s.atCmdSuffix > s.atCmd.maxValue) return true;
        return !!(s.atCmd && s.atCmd.input && !s.atCmdSuffix);
    }

    async save(forAllSlots) {
        let triggerExpr = this.buildTriggerExpression();
        if (!triggerExpr) {
            this.setState({ error: L.translate('Please configure at least one valid trigger condition. // Bitte mindestens eine gültige Trigger-Bedingung konfigurieren.') });
            return;
        }
        let s = this.state;
        let action = s.atCmdSuffix ? (s.atCmd.cmd + ' ' + s.atCmdSuffix) : s.atCmd.cmd;
        this.setState({ busy: true, error: '' });
        try {
            if (this.props.trigger) {
                await ATDevice.clearTrigger(this.props.trigger, this.props.slot);
            }
            await ATDevice.addTrigger(triggerExpr, action, this.props.slot);
            if (this.props.trigger) {
                await ATDevice.reloadTriggersFromDevice(this.props.slot);
            }
            if (forAllSlots) {
                await ATDevice.copyConfigToAllSlots([C.AT_CMD_TRIGGER], this.props.slot, true);
            }
            this.setState({ busy: false, error: '' });
            this.props.closeHandler(true);
        } catch (err) {
            console.warn(err);
            this.setState({ busy: false, error: L.translate('Could not save trigger. // Trigger konnte nicht gespeichert werden.') });
        }
    }

    render(props) {
        let state = this.state;
        let buttonOptions = props.buttonOptions || [];
        let categoryElements = C.AT_CMD_CATEGORIES.map(cat => ({ value: cat.constant, label: cat.label }));
        categoryElements = [{ value: TriggerEditModal.ALL_CATEGORIES, label: 'All categories // Alle Kategorien' }].concat(categoryElements);
        let expressionPreview = this.buildTriggerExpression();
        let isEditing = !!props.trigger;

        return html`
            <div class="modal-mask">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <a class="close-button" href="javascript:void(0);" onclick="${() => props.closeHandler(false)}">X</a>
                        <div class="modal-header">
                            <h1>
                                ${isEditing
                                    ? L.translate('Edit Trigger // Trigger bearbeiten')
                                    : L.translate('Add Trigger // Trigger hinzufügen')}
                                <span> (Slot: ${props.slot})</span>
                            </h1>
                        </div>

                        <div class="modal-body container-fluid p-0">

                            <div class="te-error-msg ${state.error ? '' : 'd-none'}">${state.error}</div>

                            <h3>${L.translate('Trigger condition // Trigger-Bedingung')}</h3>
                            ${state.terms.map((term, idx) => html`
                                <div class="row align-items-center mb-2">
                                    <div class="col-md-2">
                                        <select class="col-12" value="${term.type}" onchange="${(e) => this.updateTerm(idx, { type: e.target.value })}">
                                            <option value="tap">tap</option>
                                            <option value="press">press</option>
                                            <option value="release">release</option>
                                            <option value="long">long</option>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <select class="col-12" value="${term.button}" onchange="${(e) => this.updateTerm(idx, { button: e.target.value })}">
                                            ${buttonOptions.map(btn => html`<option value="${btn}">${btn}</option>`)}
                                        </select>
                                    </div>
                                    <div class="col-md-3 ${term.type === 'tap' ? '' : 'd-none'}">
                                        <input type="number" min="1" max="10" class="col-12" value="${term.tapCount}"
                                               oninput="${(e) => this.updateTerm(idx, { tapCount: e.target.value })}"
                                               placeholder="${L.translate('tap count // Anzahl Taps')}"/>
                                    </div>
                                    <div class="col-md-3 ${term.type === 'long' ? '' : 'd-none'}">
                                        <input type="number" min="0" class="col-12" value="${term.duration}"
                                               oninput="${(e) => this.updateTerm(idx, { duration: e.target.value })}"
                                               placeholder="${L.translate('duration ms // Dauer ms')}"/>
                                    </div>
                                    <div class="col-md-4 ${['press', 'release'].includes(term.type) ? '' : 'd-none'}"></div>
                                    <div class="col-md-2 text-right">
                                        <button class="small-button" disabled="${state.terms.length === 1}" onclick="${() => this.removeTerm(idx)}" title="${L.translate('Remove condition // Bedingung entfernen')}">
                                            ${html`<${FaIcon} icon="fas trash-alt"/>`}
                                        </button>
                                    </div>
                                </div>
                            `)}
                            <div class="row mb-1">
                                <div class="col-12">
                                    <button class="small-button" disabled="${state.terms.length >= 4}" onclick="${() => this.addTerm()}">
                                        ${html`<${FaIcon} icon="fas plus"/>`} ${L.translate('Add condition // Bedingung hinzufügen')}
                                    </button>
                                </div>
                            </div>
                            <div class="row mb-4">
                                <div class="col-12">
                                    ${L.translate('Expression // Ausdruck')}: <strong>${expressionPreview || '-'}</strong>
                                </div>
                            </div>

                            <h3>${L.translate('Action // Aktion')}</h3>
                            <div class="filter-buttons mb-4">
                                ${html`<${RadioFieldset} legend="Show action categories: // Zeige Aktions-Kategorien:" onchange="${(value) => this.selectActionCategory(value)}" elements="${categoryElements}" value="${state.showCategory}"/>`}
                            </div>
                            <div class="row">
                                <label for="triggerActionSelect" class="col-md-4">${L.translate('Select action // Aktion auswählen')}</label>
                                <div class="col-md-8">
                                    <select id="triggerActionSelect" class="col-12" value="${state.atCmd.cmd}"
                                            onchange="${(e) => this.setAtCmd(e.target.value)}">
                                        ${state.possibleAtCmds.map(atCmd => html`<option value="${atCmd.cmd}">${L.translate(atCmd.label)}</option>`)}
                                    </select>
                                </div>
                            </div>
                            ${(() => {
                                switch (state.atCmd.input) {
                                    case C.INPUTFIELD_TYPE_TEXT:
                                        return html`
                                            <div class="row">
                                                <label for="triggerInputText" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                <div class="col-md-8">
                                                    <input id="triggerInputText" value="${state.atCmdSuffix}" oninput="${(e) => this.setAtCmdSuffix(e.target.value)}" type="text" class="col-12" placeholder="${L.translate('Input text // Text eingeben')}"/>
                                                </div>
                                            </div>`;
                                    case C.INPUTFIELD_TYPE_NUMBER:
                                        return html`
                                            <div class="row">
                                                <label for="triggerInputNum" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                <div class="col-md-8">
                                                    <input id="triggerInputNum" value="${state.atCmdSuffix}" type="number" oninput="${(e) => this.setAtCmdSuffix(e.target.value)}" class="col-12"
                                                           placeholder="${L.translate('Input number // Zahl eingeben') + (state.atCmd.minValue !== undefined ? ` [${state.atCmd.minValue}-${state.atCmd.maxValue}]` : '')}"
                                                           min="${state.atCmd.minValue}" max="${state.atCmd.maxValue}"/>
                                                </div>
                                            </div>`;
                                    case C.INPUTFIELD_TYPE_SELECT:
                                        return html`
                                            <div class="row">
                                                <label for="triggerInputSel" class="col-md-4">${L.translate(state.atCmd.shortLabel || state.atCmd.label)}</label>
                                                <div class="col-md-8">
                                                    <select id="triggerInputSel" class="col-12" value="${state.atCmdSuffix || state.selectOptions[0]}" onchange="${(e) => this.setAtCmdSuffix(e.target.value)}" disabled="${state.selectOptions.length === 0}">
                                                        ${state.selectOptions.length === 0 ? html`<option value="" disabled selected>${L.translate('(empty) // (leer)')}</option>` : ''}
                                                        ${state.selectOptions.map(opt => html`<option value="${opt}">${opt}</option>`)}
                                                    </select>
                                                </div>
                                            </div>`;
                                    case C.INPUTFIELD_TYPE_KEYBOARD:
                                        return html`<${InputKeyboard} value="${state.atCmdSuffix}" onchange="${(v) => this.setAtCmdSuffix(v)}"/>`;
                                    case C.INPUTFIELD_TYPE_MACRO:
                                        return html`<${InputMacro} value="${state.atCmdSuffix}" onchange="${(v) => this.setAtCmdSuffix(v)}"/>`;
                                }
                            })()}
                            ${(() => {
                                if (state.atCmd.category === C.AT_CMD_CAT_IR && state.atCmd.input === C.INPUTFIELD_TYPE_SELECT) {
                                    return html`<${ManageIR} irCmds="${state.selectOptions}" onchange="${(newName) => this.updateIrSelect(newName)}"/>`;
                                }
                            })()}
                        </div>

                        <div class="modal-footer mt-5">
                            <div class="row">
                                <div class="col">
                                    <button onclick="${() => props.closeHandler(false)}">
                                        ${html`<${FaIcon} icon="fas times"/>`}
                                        ${L.translate('Cancel // Abbrechen')}
                                    </button>
                                </div>
                                <div class="col">
                                    <button onclick="${() => this.save(false)}" disabled="${this.saveButtonsDisabled() || state.busy}" class="button-primary">
                                        ${html`<${FaIcon} icon="fas save" invert="true"/>`}
                                        ${L.translate('Save // Speichern')}
                                    </button>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6 offset-6">
                                    ${html`<${ActionButton} onclick="${() => this.save(true)}"
                                        label="Save for all slots // Für alle Slots speichern"
                                        progressLabel="Saving to all slots... // Speichern für alle Slots..."
                                        disabled="${this.saveButtonsDisabled() || state.busy}"
                                        faIcon="far clone"/>`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${TriggerEditModal.style}`;
    }
}

TriggerEditModal.style = html`<style>
    .te-error-msg {
        color: #b00020;
        margin-bottom: 12px;
    }
    .small-button {
        display: inline-block;
        padding: 0 10px !important;
        line-height: unset;
        width: unset;
        margin: 0.5em 0.5em 0.5em 0;
        text-transform: none;
    }
</style>`

export { TriggerEditModal };
