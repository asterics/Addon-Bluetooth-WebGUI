import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js'
import {ATDevice} from "../../communication/ATDevice.js";

const html = htm.bind(h);
class TabSlots extends Component {

    constructor() {
        super();

        TabSlots.instance = this;
        this.state = {
            newSlotName: '',
            selectedSlot: ATDevice.getCurrentSlot(),
            slots: ATDevice.getSlots(),
            uploadedSlots: [],
            selectedUploadSlots: []
        }
    }

    createSlot() {
        let thiz = this;
        ATDevice.createSlot(this.state.newSlotName).then(function () {
            thiz.setState({
                newSlotName: '',
                slots: ATDevice.getSlots(),
                selectedSlot: ATDevice.getCurrentSlot()
            });
        });
    }

    deleteSlot() {
        let thiz = this;
        let confirmMessage = L.translate('Do you really want to delete the slot "{?}"? // Möchten Sie den Slot "{?}" wirklich löschen?', this.state.selectedSlot);
        if (!window.confirm(confirmMessage)) {
            return;
        }
        ATDevice.deleteSlot(this.state.selectedSlot).then(function () {
            thiz.setState({
                selectedSlot: ATDevice.getCurrentSlot(),
                slots: ATDevice.getSlots()
            })
        });
    };

    fileUploadChanged(target) {
        let thiz = this;
        if (!target.files[0]) {
            return thiz.setState({
                uploadedSlots: [],
                selectedUploadSlots: []
            })
        }
        let reader = new FileReader();
        reader.readAsText(target.files[0]);
        reader.onloadend = function(e) {
            let parsedSlots = ATDevice.parseConfig(e.target.result);
            parsedSlots.forEach(slot => { //prevent duplicated names
                let originalSlotname = slot.name;
                let counter = 1;
                while (thiz.state.slots.includes(slot.name)) {
                    slot.name = `${originalSlotname} (${counter++})`
                }
            })
            thiz.setState({
                uploadedSlots: parsedSlots
            })
        };
    }

    uploadSlots() {
        let thiz = this;
        thiz.setState({
            uploading: true
        })
        ATDevice.uploadSlots(this.state.selectedUploadSlots).then(() => {
            thiz.setState({
                slots: ATDevice.getSlots(),
                selectedSlot: ATDevice.getCurrentSlot(),
                selectedUploadSlots: [],
                uploadedSlots: [],
                uploading: false
            });
            L('#fileInputSlotUpload').value = null;
        });
    };

    downloadSlot() {
        let d = new Date();
        let datestr = new Date().toISOString().substr(0, 10);
        L.downloadasTextFile(`${C.CURRENT_DEVICE}-slot-${this.state.selectedSlot}-${datestr}.set`, ATDevice.getSlotConfigText(this.state.selectedSlot));
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

    resetConfig() {
        let confirmMessage = L.translate('Do you really want to reset the device to the default configuration? All slots will be deleted. // Möchten Sie das Gerät wirklich auf die Standardeinstellungen zurücksetzen? Alle Slots werden gelöscht.');
        if(!window.confirm(confirmMessage)){
            return;
        }
        ATDevice.restoreDefaultConfiguration().then(() => {
            this.setState({
                slots: ATDevice.getSlots(),
                selectedSlot: ATDevice.getCurrentSlot()
            });
        });
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

    render() {
        let state = this.state;
        let slots = state.slots;

        return html`
            <h2>${L.translate('Slot configuration // Slot-Konfiguration')}</h2>
            <div class="container-fluid px-0">
                <div class="row">
                    <div class="col-sm-12 col-md-10 col-lg-8">
                        <label for="selectSlots2">${L.translate('Select slot for action // Slot für Aktion auswählen')}</label>
                        <select id="selectSlots2" class="col-12" value="${state.selectedSlot}" onchange="${(event) => this.setState({selectedSlot: event.target.value})}">
                            ${slots.map(slot => html`<option value="${slot}">${slot}</option>`)}
                        </select>
                    </div>
                </div>
               
                <div class="row">
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button onclick="${() => ATDevice.setSlot(this.state.selectedSlot)}">${L.translate('Activate Slot // Slot aktivieren')}</button>
                    </div>
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button disabled="${slots.length <= 1}" onclick="${() => this.deleteSlot()}">
                            <span>${L.translate('Delete Slot // Slot löschen')}</span>
                        </button>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button onclick="${() => this.downloadSlot()}">${L.translate('Download Slot // Slot herunterladen')}</button>
                    </div>
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button onclick="${() => this.downloadAllSlots()}">${L.translate('Download all Slots // Alle Slots herunterladen')}</button>
                    </div>
                </div>
            
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="newSlotLabel">${L.translate('Create new slot // Neuen Slot anlegen')}</label>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <input id="newSlotLabel" class="col-12" value="${state.newSlotName}" oninput="${(event) => this.setState({newSlotName: event.target.value})}" type="text" placeholder="${L.translate('insert name for new slot // Namen für neuen Slot eingeben')}" maxlength="15"/>
                    </div>
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button disabled="${!state.newSlotName || this.state.slots.includes(this.state.newSlotName)}" onclick="${() => this.createSlot()}" class="u-full-width">
                            <span>${L.translate('Create Slot // Slot anlegen')}</span>
                        </button>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="fileInputSlotUpload">${L.translate('Upload Slot(s) // Slot(s) hochladen')}</label>
                    </div>
                    <div class="col-12">
                        <input type=file id="fileInputSlotUpload" accept=".set" onchange="${(event) => this.fileUploadChanged(event.target)}"/>
                    </div>
                    <fieldset class="col-12 ${this.state.uploadedSlots.length === 0 ? 'd-none' : ''}">
                        <legend>${L.translate('Choose slots to upload // Wähle Slots zum Hochladen')}</legend>
                        ${state.uploadedSlots.map(slot => html`
                            <div>
                                <input id="${slot.name + 'checkbox'}" type="checkbox" class="mr-2" onchange="${(event) => this.uploadCheckboxChanged(slot, event.target.checked)}"/>
                                <label for="${slot.name + 'checkbox'}">${'Slot "' + slot.name + '"'}</label>
                            </div>
                        `)}
                    </fieldset>
                </div>
                
                <div class="row">
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button disabled="${state.selectedUploadSlots.length === 0}" onclick="${() => this.uploadSlots()}">
                            ${state.uploading ? L.translate('Uploading Slot(s) ... // Slot(s) hochladen ...') : L.translate('Upload Slot(s) // Slot(s) hochladen')}
                        </button>
                    </div>
                </div>
    
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="reset-slot-button">${L.translate('Reset to default configuration // Rücksetzen auf Defaulteinstellungen')}</label>
                    </div>
                    <div class="col-sm-6 col-md-5 col-lg-4">
                        <button onclick="${() => this.resetConfig()}" class="u-full-width">
                            <span>${L.translate('Reset device // Gerät zurücksetzen')}</span>
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

export {TabSlots};