import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js'
import {ATDevice} from "../../communication/ATDevice.js";
import {FaIcon} from "../components/FaIcon.js";
import {ActionButton} from "../components/ActionButton.js";
import {TextModal} from "../modals/TextModal.js";

const html = htm.bind(h);
class TabSlots extends Component {

    constructor() {
        super();

        TabSlots.instance = this;
        this.state = {
            newSlotName: '',
            slots: ATDevice.getSlots(),
            uploadedSlots: [],
            uploadProgress: 0,
            selectedUploadSlots: [],
            demoSettingSlots: [],
            demoSettingSelected: {},
            demoSettingSelectedText: {},
            demoSettings: [],
            showDemoDescription: false,
            selectedFileValid: undefined
        }
        let url = `https://api.github.com/repos/asterics/${C.CURRENT_DEVICE}/contents/Settings`;
        L.HTTPRequest(url, 'GET', 'json').then(result => {
            this.setState({
                demoSettings: result
            })
        })
    }

    createSlot() {
        let thiz = this;
        ATDevice.createSlot(this.state.newSlotName).then(function () {
            thiz.setState({
                newSlotName: '',
                slots: ATDevice.getSlots()
            });
        });
    }

    deleteSlot(slot) {
        let thiz = this;
        let confirmMessage = L.translate('Do you really want to delete the slot "{?}"? // Möchten Sie den Slot "{?}" wirklich löschen?', slot);
        if (!window.confirm(confirmMessage)) {
            return;
        }
        ATDevice.deleteSlot(slot).then(function () {
            thiz.setState({
                slots: ATDevice.getSlots()
            })
        });
    };

    fileUploadChanged(target) {
        let thiz = this;
        if (!target.files[0]) {
            return thiz.setState({
                uploadedSlots: [],
                selectedUploadSlots: [],
                selectedFile: ''
            })
        }
        let reader = new FileReader();
        reader.readAsText(target.files[0]);
        reader.onloadend = function(e) {
            let parsedSlots = ATDevice.parseConfig(e.target.result);
            let validConfig = parsedSlots.length > 0;
            validConfig = validConfig && C.DEVICE_IS_FM_OR_PAD ? !!parsedSlots[0].config[C.AT_CMD_DEADZONE_X] : !!parsedSlots[0].config[C.AT_CMD_ANTITREMOR_IDLE];
            parsedSlots.forEach(slot => { //prevent duplicated names
                slot.name = slot.name.substring(0, C.MAX_LENGTH_SLOTNAME);
                let originalSlotname = slot.name;
                let counter = 1;
                let otherSlotNames = parsedSlots.filter(s => s !== slot).map(slot => slot.name);
                slot.dedupedName = slot.name;
                while (thiz.state.slots.includes(slot.dedupedName) || otherSlotNames.includes(slot.dedupedName)) {
                    let postfix = ` (${counter})`;
                    let originalTrimmed = originalSlotname.substring(0, C.MAX_LENGTH_SLOTNAME - postfix.length);
                    slot.dedupedName = originalTrimmed + postfix;
                    counter++;
                }
            })
            thiz.setState({
                uploadedSlots: parsedSlots,
                selectedFile: target.files[0].name,
                selectedFileValid: validConfig
            })
        };
    }

    uploadSlots() {
        let thiz = this;
        thiz.setState({
            uploading: true
        })
        while (this.state.selectedUploadSlots.length + this.state.slots.length > C.MAX_NUMBER_SLOTS) {
            this.state.selectedUploadSlots.pop();
        }
        let uploadSlots = this.state.selectedUploadSlots.map(slot => {
            slot.name = slot.dedupedName;
            return slot;
        });
        ATDevice.uploadSlots(uploadSlots, (progress) => {
            thiz.setState({uploadProgress: progress})
        }).then(() => {
            thiz.resetUploadFile();
        });
    };

    async uploadAllSlots() {
        let confirmMsg = L.translate('Do you want to upload and replace all slots from file "{?}"? This will delete all existing slots on the device. // Möchten Sie alle Slots aus der Datei "{?}" hochladen und ersetzen? Dadurch werden alle bestehenden Slots gelöscht.', this.state.selectedFile);
        if (!confirm(confirmMsg)) {
            return;
        }
        ATDevice.deleteAllSlots();
        await ATDevice.uploadSlots(this.state.uploadedSlots, (progress) => {
            this.setState({uploadProgress: progress})
        });
        this.resetUploadFile();
    }

    resetUploadFile() {
        this.setState({
            slots: ATDevice.getSlots(),
            selectedUploadSlots: [],
            uploadedSlots: [],
            uploading: false,
            selectedFile: '',
            selectedFileValid: undefined,
            showAdvancedUpload: false
        });
        L('#fileInputSlotUpload').value = null;
    }

    downloadSlot(slot) {
        let datestr = new Date().toISOString().substr(0, 10);
        L.downloadasTextFile(`${C.CURRENT_DEVICE}-slot-${slot}-${datestr}.set`, ATDevice.getSlotConfigText(slot));
    };

    downloadAllSlots() {
        let configstr = "";
        ATDevice.getSlots().forEach(function (item) {
            configstr = configstr + ATDevice.getSlotConfigText(item) + "\n";
        });
        let d = new Date();
        let datestr = new Date().toISOString().substr(0, 10);
        L.downloadasTextFile(`${C.CURRENT_DEVICE}-config-${datestr}.set`, configstr);
    };

    uploadCheckboxChanged(slot, selected) {
        let currentList = this.state.selectedUploadSlots;
        if (selected) {
            currentList.push(slot);
        } else {
            currentList = currentList.filter(elem => elem !== slot);
        }
        this.setState({
            selectedUploadSlots: [...new Set(currentList)]
        });
    }

    colorChanged(slot, event) {
        ATDevice.setSlot(slot);
        ATDevice.setConfig(C.AT_CMD_SET_COLOR, event.target.value.replace('#', '0x'));
        this.forceUpdate();
        L.debounce(() => {
            ATDevice.save();
            ATDevice.sendATCmd(C.AT_CMD_LOAD_SLOT, ATDevice.getCurrentSlot());
        }, 500, "setcolordebounce");
    }

    demoSettingChanged(settingSha) {
        let setting = this.state.demoSettings.filter(s => s.sha === settingSha)[0];
        let settingText = this.state.demoSettings.filter(s => L.equalIgnoreCase(setting.name.replace('.set', ''), s.name.replace('.md', '')))[0];
        L.HTTPRequest(setting.download_url, 'GET', 'text').then(result => {
            let parsedSlots = ATDevice.parseConfig(result);
            this.setState({
                demoSettingSlots: parsedSlots,
                demoSettingSelected: setting,
                demoSettingSelectedText: settingText || {}
            });
        });
    }

    async applyDemoSettings() {
        let confirmMsg = L.translate('Do you want to apply demo setting "{?}"? This will delete all existing slots on the device. // Möchten Sie die Voreinstellung "{?}" anwenden? Dadurch werden alle bestehenden Slots gelöscht.', this.state.demoSettingSelected.name);
        if (!confirm(confirmMsg)) {
            return;
        }
        ATDevice.deleteAllSlots();
        await ATDevice.uploadSlots(this.state.demoSettingSlots, (progress) => {
            this.setState({uploadProgress: progress})
        });
        this.setState({
            slots: ATDevice.getSlots()
        })
    }

    render() {
        let state = this.state;
        let slots = state.slots;
        let maxSlotsReached = this.state.slots.length === C.MAX_NUMBER_SLOTS;

        return html`
            <h2>${L.translate('Slot configuration // Slot-Konfiguration')}</h2>
            <div class="container-fluid px-0">
                <h3>${L.translate('Current slots // Aktuelle slots')}</h3>
                <div class="row">
                    <ol class="col-sm-12 col-lg-10">
                        ${slots.map((slot, index) => html`
                            <li class="my-2" style="${index % 2 === 0 ? 'background-color: rgb(224 224 224)' : ''}">
                                <div class="row d-flex align-items-center">
                                    <div class="col-4">
                                        <span class="mx-2 px-3 ${C.DEVICE_IS_FM_OR_PAD ? 'd-none' : ''}"
                                              style="background-color: ${ATDevice.getConfig(C.AT_CMD_SET_COLOR, slot).replace('0x', '#')}; border: 1px solid"></span>
                                        <a title="${L.translate('Slot "{?}": click to activate // Slot "{?}": zum Aktivieren klicken', slot)}"
                                           href="javascript:;" onclick="${() => ATDevice.setSlot(slot)}"
                                           class="mx-2 ${slot === ATDevice.getCurrentSlot() ? 'd-none' : ''}">
                                            <span>${slot}</span>
                                        </a>
                                        <span class="mx-2 ${slot === ATDevice.getCurrentSlot() ? 'd-inline-block' : 'd-none'}"
                                              style="font-weight: bold"><span
                                                class="sr-only">Slot: </span>${slot}</span>
                                    </div>
                                    <div class="col-8">
                                        <div class="row d-flex">
                                            <div class="col">
                                                <label for="colorinput${slot}"
                                                       class="small-button button py-2 py-md-0 ${C.DEVICE_IS_FM_OR_PAD ? 'd-none' : ''}">${html`
                                                    <${FaIcon} icon="fas palette"/>`}<span
                                                        class="d-none d-sm-inline">${L.translate('Set color // Farbe wählen')}</span></label>
                                                <input id="colorinput${slot}" type="color" class="sr-only ${C.DEVICE_IS_FM_OR_PAD ? 'd-none' : ''}"
                                                       oninput="${(event) => this.colorChanged(slot, event)}"/>
                                            </div>
                                            <div class="col d-flex">
                                                <button onclick="${() => this.deleteSlot(slot)}"
                                                        disabled="${this.state.slots.length <= 1}"
                                                        class="small-button py-2 py-md-0">${html`<${FaIcon} icon="fas trash-alt"/>`}<span class="d-none d-sm-inline">${L.translate('Delete // Löschen')}</span>
                                                </button>
                                            </div>
                                            <div class="col d-flex">
                                                <button onclick="${() => this.downloadSlot(slot)}"
                                                        class="small-button py-2 py-md-0">${html`
                                                    <${FaIcon} icon="fas download"/>`}<span
                                                        class="d-none d-sm-inline">${L.translate('Download')}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>`)}
                    </ol>
                </div>
            
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="newSlotLabel">${L.translate('Create new slot // Neuen Slot anlegen')}</label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-sm-6 col-lg-5">
                        <input disabled="${maxSlotsReached}" id="newSlotLabel" class="col-12" value="${state.newSlotName}" oninput="${(event) => this.setState({newSlotName: event.target.value})}" type="text" 
                               placeholder="${!maxSlotsReached ? L.translate('insert name for new slot // Namen für neuen Slot eingeben') : L.translate('Storage full, no space for more slots. // Speicher voll, kein Platz für weitere Slots.')}" maxlength="${C.MAX_LENGTH_SLOTNAME}"/>
                    </div>
                    <div class="col-sm-6 col-lg-5">
                        <button disabled="${!state.newSlotName || this.state.slots.includes(this.state.newSlotName) || maxSlotsReached}" onclick="${() => this.createSlot()}">
                            ${html`<${FaIcon} icon="fas plus-circle"/>`}
                            <span>${L.translate('Create Slot // Slot anlegen')}</span>
                        </button>
                    </div>
                </div>
                
                <h3 class="mt-5">${L.translate('Upload slots from file // Slots aus Datei hochladen')}</h3>
                <div class="row mt-4">
                    <div class="col-sm-6 col-lg-5">
                        <label for="fileInputSlotUpload" class="button">${html`<${FaIcon} icon="fas file"/>`} ${L.translate('Select file // Datei auswählen')}</label>
                        <input class="sr-only" type=file id="fileInputSlotUpload" accept=".set" onchange="${(event) => this.fileUploadChanged(event.target)}"/>
                    </div>
                    <div class="col-sm-6 col-lg-5">
                        <span>${L.translate('Selected file: // Gewählte Datei:')}</span> <span>${this.state.selectedFile || L.translate('(none) // (keine)')}</span><br/>
                        <span class="${this.state.selectedFile ? '' : 'd-none'}">${this.state.uploadedSlots.length} Slots: ${JSON.stringify(this.state.uploadedSlots.map(slot => slot.name)).replaceAll(',', ', ')}</span>
                    </div>
                    <div class="col-sm-6 col-lg-5 ${state.selectedFile && !state.selectedFileValid ? '' : 'd-none'}">
                        <span style="color: darkred">${L.translate('Selected file does not contain valid config for {?}! // Gewählte Datei beinhaltet keine gültige Konfiguration für {?}!', C.CURRENT_DEVICE)}</span>
                    </div>
                </div>
                <div class="row mt-3 ${!state.selectedFileValid ? 'd-none' : ''}">
                    <div class="col-sm-6 col-lg-5">
                        ${html`<${ActionButton} onclick="${() => this.uploadAllSlots()}"
                                            label="Upload and replace all Slots // Alle Slots hochladen und ersetzen"
                                            disabled="${state.uploadedSlots.length === 0}"
                                            progressLabel="${L.translate('Uploading slots {?}% ... // Slots hochladen {?}% ...', state.uploadProgress)}" faIcon="fas upload"/>`}
                    </div>
                </div>
                <div class="row mt-3 ${!state.selectedFileValid || maxSlotsReached ? 'd-none' : ''}">
                    <div class="col-12">
                        <a href="javascript:;" onclick="${() => {this.setState({showAdvancedUpload: !state.showAdvancedUpload})}}">
                            <span class="${!state.showAdvancedUpload ? '' : 'd-none'}">${L.translate("Show advanced options to upload single slots // Zeige erweiterte Optionen zum Hochladen einzelner Slots")}</span>
                            <span class="${state.showAdvancedUpload ? '' : 'd-none'}">${L.translate("Hide advanced options to upload single slots // Verstecke erweiterte Optionen zum Hochladen einzelner Slots")}</span>
                        </a>
                    </div>
                </div>
                
                <div class="mt-3 ${!state.selectedFileValid || !state.showAdvancedUpload ? 'd-none' : ''}">
                    <div class="row">
                        <fieldset class="mt-3 col-12">
                            <legend>${L.translate('Choose slots to upload // Wähle Slots zum Hochladen')}</legend>
                            ${state.uploadedSlots.map(slot => {
                                let disabled = !state.selectedUploadSlots.includes(slot) && state.selectedUploadSlots.length + state.slots.length >= C.MAX_NUMBER_SLOTS;
                                return html`
                                    <div>
                                        <input disabled="${disabled}" id="${slot.dedupedName + 'checkbox'}"
                                               type="checkbox" class="mr-2"
                                               onchange="${(event) => this.uploadCheckboxChanged(slot, event.target.checked)}"/>
                                        <label for="${slot.dedupedName + 'checkbox'}">${'Slot "' + slot.dedupedName + '"'}</label>
                                    </div>`
                            })}
                        </fieldset>
                    </div>
                    <div class="row mb-5 ${state.selectedUploadSlots.length + state.slots.length >= C.MAX_NUMBER_SLOTS ? '' : 'd-none'}">
                        <div class="col-12">
                            ${html`<${FaIcon} icon="fas exclamation-triangle"/>`}
                            <span>${L.translate("Maximum number of slots reached! // Maximale Anzahl an Slots erreicht!")}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 col-lg-5">
                            <button disabled="${state.selectedUploadSlots.length === 0 || state.uploading}" onclick="${() => this.uploadSlots()}">
                                ${html`<${FaIcon} icon="fas upload"/>`}
                                ${state.uploading ? L.translate('Uploading slot(s) {?}% ... // Slot(s) hochladen {?}% ...', state.uploadProgress) : L.translate('Upload selected Slot(s) // Gewählte Slot(s) hochladen')}
                            </button>
                        </div>
                    </div>
                </div>
                
                <h3 class="mt-5">${L.translate('Download all slots // Alle Slots herunterladen')}</h3>
                <div class="row mt-4">
                    <div class="col-sm-6 col-lg-5">
                        <button onclick="${() => this.downloadAllSlots()}">
                            ${html`<${FaIcon} icon="fas download"/>`}
                            ${L.translate('Download all slots // Alle Slots herunterladen')}
                        </button>
                    </div>
                </div>

                <div class="${state.demoSettings.length > 0 ? '' : 'd-none'}">
                    <h3 class="mt-5">${L.translate('Predefined settings // Demo-Voreinstellungen')}</h3>
                    <div class="row mt-4">
                        <div class="col-12">
                            <label for="selectDemoSettings">${L.translate('Select settings // Wähle Voreinstellung')}</label>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 col-lg-5">
                            <select id="selectDemoSettings" class="col-12" required onchange="${(event) => this.demoSettingChanged(event.target.value)}">
                                <option value="" disabled selected hidden>${L.translate('(select setting preset) // (Voreinstellung auswählen)')}</option>
                                ${state.demoSettings.filter(s => s.name.indexOf('.set') > -1).map(setting => html`<option value="${setting.sha}">${setting.name}</option>`)}
                            </select>
                        </div>
                        <div class="col-sm-6 col-lg-5 mb-4 ${state.demoSettingSlots.length > 0 ? '' : 'd-none'}">
                            <span>${state.demoSettingSlots.length} Slots: </span>
                            <ol class="d-inline">
                                ${state.demoSettingSlots.map((slot, index) => html`
                                <li class="d-inline">
                                    <span>${slot.name}</span>
                                    <span class="${index < state.demoSettingSlots.length - 1 ? '' : 'd-none'}">, </span>
                                </li>
                            `)}
                            </ol>
                        </div>
                    </div>
                    <div class="row ${state.demoSettingSelectedText.name ? '' : 'd-none'}">
                        <div class="col mb-4">
                            <a href="javascript:;" onclick="${() => this.setState({showDemoDescription: true})}">${L.translate('Show description for "{?}" // Zeige Beschreibung für "{?}"', state.demoSettingSelected.name)}</a>
                            <div class="${state.showDemoDescription ? '' : 'd-none'}">
                                ${html`<${TextModal} close="${() => this.setState({showDemoDescription: false})}" header="${L.translate('Details for "{?}" // Details für "{?}"', state.demoSettingSelected.name)}" textUrl="${state.demoSettingSelectedText.download_url}"/>`}
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-6 col-lg-5">
                            ${html`<${ActionButton} onclick="${() => this.applyDemoSettings()}"
                                            label="Apply settings preset // Voreinstellungen anwenden"
                                            disabled="${state.demoSettingSlots.length === 0}"
                                            progressLabel="${L.translate('Uploading slots {?}% ... // Slots hochladen {?}% ...', state.uploadProgress)}" faIcon="fas upload"/>`}
                        </div>
                    </div>
                </div>
            </div>
            ${TabSlots.style}`;
    }
}

TabSlots.style = html`<style>
    .small-button {
        display: inline-block;
        padding: 0 5px;
        line-height: unset;
        width: 100%;
        text-transform: none;
        margin: 0 !important;
    }
    
    ol {
       list-style-type: none; 
    }
</style>`;

export {TabSlots};