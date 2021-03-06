import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipMouse} from "../../communication/FLipMouse.js";

const html = htm.bind(h);

class ManageIR extends Component {

    constructor(props) {
        super();

        this.props = props;
        this.state = {
            deleteIrName: null,
            irCmdName: '',
            isRecording: false
        };
    }

    recordIrCmd() {
        this.setState({isRecording: true});
        FLipMouse.recordIrCommand(this.state.irCmdName).then(success => {
            if (success) {
                this.props.onchange(this.state.irCmdName);
                this.setState({irCmdName: '', deleteIrName: this.state.irCmdName});
            }
            this.setState({isRecording: false});
        })
    }

    deleteIrCmd() {
        let deleteName = this.state.deleteIrName || this.props.irCmds[0];
        if (!confirm(L.translate('Do you really want to delete IR command "{?}"? // Möchten Sie das IR Kommando "{?}" wirklich löschen?', deleteName))) {
            return;
        }
        ATDevice.sendATCmd(C.AT_CMD_IR_DELETE, deleteName);
        let remainingCmds = this.props.irCmds.filter(cmd => cmd !== deleteName);
        this.setState({
            deleteIrName: remainingCmds.length > 0 ? remainingCmds[0] : ''
        })
        this.props.onchange();
    }

    deleteAllIrCmds() {
        if (!confirm(L.translate('Do you really want to delete all IR commands? // Möchten Sie wirklich alle IR Kommandos löschen?'))) {
            return;
        }
        ATDevice.sendATCmd(C.AT_CMD_IR_WIPE);
        this.props.onchange();
    }

    render(props) {
        let state = this.state;
        props.irCmds = props.irCmds || [];

        return html`
            <h2>${L.translate('Manage IR Commands // IR Kommandos verwalten')}</h2>
            <div class="row">
                <label for="inputIRName" class="col-12 col-md-4">${L.translate('New IR Command // Neues IR Kommando')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-md-6">
                            <input type="text" class="col-12" id="inputIRName" value="${state.irCmdName}" oninput="${(event) => this.setState({irCmdName: event.target.value})}" placeholder="Name"/>
                        </div>
                        <div class="col-md-6">
                            <button class="col-12" disabled="${!state.irCmdName}" onclick="${() => this.recordIrCmd()}">
                                <span class="${state.isRecording ? 'd-none' : ''}">${L.translate('Record // Aufnahme')}</span>
                                <span class="${!state.isRecording ? 'd-none' : ''}">${L.translate('Recording ... // Aufnahme ...')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <label for="selectIRDelete" class="col-12 col-md-4">${L.translate('Delete IR command // IR Kommando löschen')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-md-6">
                            <select class="col-12" value="${state.deleteIrName || props.irCmds[0]}" onchange="${(event) => this.setState({deleteIrName: event.target.value})}" disabled="${props.irCmds.length === 0}">
                                ${props.irCmds.length === 0 ? html`<option value="" disabled selected>${L.translate('(empty) // (leer)')}</option>` : ''}
                                ${props.irCmds.map(option => html`<option value="${option}">${option}</option>`)}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <button class="col-12" onclick="${() => this.deleteIrCmd()}" disabled="${props.irCmds.length === 0}">
                                <span>${L.translate('Delete // Löschen')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-8 offset-md-4">
                    <button class="col-12" onclick="${() => this.deleteAllIrCmds()}">
                        <span>${L.translate('Delete all // Alle löschen')}</span>
                    </button>
                </div>
            </div>
            `;
    }
}

export {ManageIR};