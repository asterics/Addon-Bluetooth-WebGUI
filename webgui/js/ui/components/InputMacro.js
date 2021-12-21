import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class InputMacro extends Component {

    constructor(props) {
        super();

        this.selectATCMDS = C.AT_CMDS_ACTIONS.concat(C.AT_CMDS_MACRO).sort((a, b) => {
            if (!a.category) {
                return -1;
            }
            if (!b.category) {
                return 1;
            }
            return a.category.localeCompare(b.category) * (-1);
        }).filter(a => a.cmd !== C.AT_CMD_MACRO);
        this.selectATCMDStrings = this.selectATCMDS.map(cmd => cmd.cmd);
        this.optionsFnCache = {};
        this.props = props;
        this.state = {
            currentValue: props.value,
            commandList: [],
            selectedCmd: this.selectATCMDS[0].cmd,
            errorList: []
        };
        this.inputChanged(props.value, true);
    }

    inputChanged(value, dontEmit) {
        value = value || '';
        value = value.replace(/\\;/g, '#=#='); // mask \; in order to correctly split on ";"
        let list = value ? value.split(';').map(e => e.replace(/#=#=/g, '\\;')) : [];
        list = list.filter(elem => !!elem);
        value = value.replace(/#=#=/g, '\\;'); // unmask \;
        this.setState({
            commandList: list,
            currentValue: value
        });
        if (!dontEmit) {
            this.emitValue(value);
        }
        L.debounce(() => {
            this.updateErrorList(list);
        }, 300, 'INPUT_MACRO');
    }

    addToList(elem) {
        let list = this.state.commandList.concat([elem.replace('AT ', '')]);
        let value = list.join(';');
        this.setState({
            commandList: list,
            currentValue: value
        });
        this.emitValue(value);
        L.debounce(() => {
            this.updateErrorList(list);
        }, 300, 'INPUT_MACRO');
    }

    emitValue(value) {
        if (this.props.onchange) {
            // remove spaces before and after semicolons
            value = value.replace(/\\;/g, '#=#=');
            value = value.replace(/(\s*);(\s*)/g, ';');
            value = value.replace(/#=#=/g, '\\;');
            this.props.onchange(value);
        }
    }

    getAtCmdObject(cmd) {
        let atCmd = cmd.trim().substring(0, C.LENGTH_ATCMD_PREFIX - 1).toUpperCase();
        return this.selectATCMDS.filter(cmd => cmd.cmd === atCmd)[0];
    }

    async updateErrorList(list) {
        let errorList = await Promise.all(list.map(async cmd => {
            let atCmd = 'AT ' + cmd.trim();
            let atCmdObject = this.getAtCmdObject(atCmd);
            let atCmdValue = atCmd.substring(C.LENGTH_ATCMD_PREFIX).trim();
            let inputType = atCmdObject ? atCmdObject.input : null;
            let inputCategory = atCmdObject ? atCmdObject.category : null;
            let optionsFn = atCmdObject ? atCmdObject.optionsFn : null;
            let possibleValues = optionsFn ? (this.optionsFnCache[atCmdObject.optionsFn] || await Promise.resolve(atCmdObject.optionsFn())) : [];
            this.optionsFnCache[optionsFn] = possibleValues;
            if (!atCmdObject) {
                return L.translate('unknown command // unbekannter Befehl');
            } else if(inputType === C.INPUTFIELD_TYPE_KEYBOARD && atCmdValue.length > 0 && atCmdValue.indexOf('KEY_') !== 0) {
                return L.translate(`parameter must start with "KEY_" // Parameter muss mit "KEY_" beginnen`);
            } else if(inputType === C.INPUTFIELD_TYPE_SELECT && atCmdValue.length > 0 && possibleValues.length === 0 && inputCategory === C.AT_CMD_CAT_IR) {
                return L.translate(`no infrared commands stored on device // keine Infrarot-Kommandos am Gerät gespeichert`);
            } else if(inputType === C.INPUTFIELD_TYPE_SELECT && atCmdValue.length > 0 && possibleValues.indexOf(atCmdValue) === -1) {
                return L.translate(`parameter must be one of ${JSON.stringify(possibleValues)} // Parameter muss einer von ${JSON.stringify(possibleValues)} sein`);
            } else if(inputType === C.INPUTFIELD_TYPE_NUMBER && atCmdValue.length > 0 && !Number.isInteger(parseInt(atCmdValue))) {
                return L.translate(`parameter must be a number // Parameter muss eine Zahl sein`);
            } else if(inputType && !atCmdValue) {
                return L.translate('missing parameter for command // Befehl benötigt einen Parameter');
            }
            return null;
        }));
        this.setState({
            errorList: errorList
        })
    }

    render(props) {
        let state = this.state;
        return html`
            <div class="row">
                <label for="selectKeys" class="col-md-4">${L.translate('Add command // Befehl hinzufügen')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-9 col-md-8">
                            <select class="col-12" id="selectKeys" onchange="${(event) => this.setState({selectedCmd: event.target.value})}">
                                ${this.selectATCMDS.map(cmd => html`<option value="${cmd.cmd}">${cmd.cmd.replace('AT ', '') + ': ' + L.translate(cmd.macroLabel || cmd.label)}</option>`)}
                            </select>
                        </div>
                        <div class="col-3 col-md-4">
                            <button class="col-12" onclick="${() => this.addToList(state.selectedCmd)}">
                                <span class="d-none d-md-block">${L.translate('Add // Hinzufügen')}</span>
                                <span class="d-md-none">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <label for="InputMacro" class="col-md-4">${L.translate('Makro // Makro')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-12 col-md-8">
                            <input id="InputMacro" class="col-12" type="text" value="${this.state.currentValue}" oninput="${(event) => this.inputChanged(event.target.value)}" placeholder="${L.translate('Insert commands, separated by semicolons ";" // Befehle eingeben, getrennt durch Strichpunkt ";"')}"/>
                        </div>
                        <div class="col-12 col-md-4">
                            <button class="col-12" onclick="${() => this.inputChanged('')}">${L.translate('Clear // Löschen')}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row ${state.commandList.length > 0 ? '' : 'd-none'}">
                <strong class="col-md-4">${L.translate('Input help // Eingabehilfe')}</strong>
                <div class="col-md-8">
                    <ol style="list-style-type: none">
                        ${state.commandList.map((atCmd, index) => {
                            let atCmdObject = this.getAtCmdObject('AT ' + atCmd.trim());
                            let title = L.translate(atCmdObject ? atCmdObject.label : '');
                            return html`<li>
                                <span title="${title}" class="${C.IS_TOUCH_DEVICE ? 'd-none' : ''}">\u24D8 </span>
                                <span title="${title}">"${atCmd.trim()}"</span>
                                <span class="${state.errorList[index] !== null ? 'd-none' : ''}" style="color: darkgreen"> - ${L.translate('Command OK // Befehl OK')}</span>
                                <span class="${state.errorList[index] !== null ? '' : 'd-none'}" style="color: darkred"> - ${L.translate(state.errorList[index] || '')}</span>
                            </li>`
                        })}
                    </ol>
                </div>
            </div>
            `;
    }
}

export {InputMacro};