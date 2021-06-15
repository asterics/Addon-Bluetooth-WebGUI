import { h, Component, render } from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js'
import {ATDevice} from "../../../js/communication/ATDevice.js";

const html = htm.bind(h);
class TabSlots extends Component {

    constructor() {
        super();

        TabSlots.instance = this;
        this.state = {
            newSlotName: '',
            selectedSlot: ATDevice.getCurrentSlot(),
            slots: ATDevice.getSlots()
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

    uploadSlot() {
        //TODO
        var file = L('#selectSlotUpload').files;
        var slotName = L('#uploadSlotLabelEn') ? L('#uploadSlotLabelEn').value : L('#uploadSlotLabelDe').value;
        var reader=new FileReader();
        reader.readAsText(file[0]);
        reader.onloadend = function(e) {
            //TODO
            //config = ATDevice.parseConfig(e.target.result,true);
            ATDevice.createSlot(slotName,null);
        };
    };

    downloadSlot() {
        let d = new Date();
        let datestr = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear()
        L.downloadasTextFile(this.state.selectedSlot + "-" + datestr + ".set", ATDevice.getSlotConfigText(this.state.selectedSlot));
    };

    downloadAllSlots() {
        let configstr = "";
        ATDevice.getSlots().forEach(function (item) {
            configstr = configstr + ATDevice.getSlotConfigText(item) + "\n";
        });
        let d = new Date();
        let datestr = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear()
        L.downloadasTextFile("flipmouseconfig-" + datestr + ".set", configstr);
    };

    resetDevice() {
        let confirmMessage = L.translate('Do you really want to reset the FLipMouse to the default configuration? All current slots will be deleted. // Möchten Sie die FLipMouse wirklich auf die Standardeinstellungen zurücksetzen? Alle aktuellen Slots werden gelöscht.');
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

    resetCurrentSlot() {
        let confirmMessage = L.translate('Do you really want to reset current slot "{?}" to the default configuration? // Möchten Sie den aktuellen Slot "{?}" wirklich auf die Standardeinstellungen zurücksetzen?', ATDevice.getCurrentSlot());
        if(!window.confirm(confirmMessage)){
            return;
        }
        ATDevice.resetCurrentSlot().then(() => {
            this.setState({
                slots: ATDevice.getSlots(),
                selectedSlot: ATDevice.getCurrentSlot()
            });
        });
    };

    render() {
        let state = this.state;
        let slots = state.slots;

        return html`
            <h2>${L.translate('Slot configuration // Slot Konfiguration')}</h2>
            <div class="container-fluid px-0">
                <div class="row">
                    <div class="col-12">
                        <label for="selectSlots2">${L.translate('Select slot for action // Slot für Aktion auswählen')}</label>
                        <select id="selectSlots2" class="col-12" value="${state.selectedSlot}" onchange="${(event) => this.setState({selectedSlot: event.target.value})}">
                            ${slots.map(slot => html`<option value="${slot}">${slot}</option>`)}
                        </select>
                    </div>
                </div>
               
                <div class="row">
                    <div class="col-md-6">
                        <button onclick="${() => ATDevice.setSlot(this.state.selectedSlot)}">${L.translate('Activate Slot // Slot aktivieren')}</button>
                    </div>
                    <div class="col-md-6">
                        <button disabled="${slots.length <= 1}" onclick="${() => this.deleteSlot()}">
                            <span>${L.translate('Delete Slot // Slot löschen')}</span>
                        </button>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <button onclick="${() => this.downloadSlot()}">${L.translate('Download Slot // Slot herunterladen')}</button>
                    </div>
                    <div class="col-md-6">
                        <button onclick="${() => this.downloadAllSlots()}">${L.translate('Download all Slots // Alle Slots herunterladen')}</button>
                    </div>
                </div>
            
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="newSlotLabel">${L.translate('Create new slot // Neuen Slot anlegen')}</label>
                    </div>
                    <div class="col-12">
                        <input id="newSlotLabel" class="col-12" value="${state.newSlotName}" oninput="${(event) => this.setState({newSlotName: event.target.value})}" type="text" placeholder="${L.translate('insert name for new slot // Namen für neuen Slot eingeben')}" maxlength="15"/>
                    </div>
                    <div class="col-12">
                        <button disabled="${!state.newSlotName}" onclick="${() => this.createSlot()}" class="u-full-width">
                            <span>${L.translate('Create Slot // Slot anlegen')}</span>
                        </button>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="selectSlotUpload">${L.translate('Upload Slot(s) // Slot(s) hochladen')}</label>
                    </div>
                    <div class="col-12">
                        <input type=file id="selectSlotUpload" accept=".set"/>
                    </div>
                    <div class="col-12">
                        <input id="uploadSlotLabel" oninput="${(event) => this.setState({uploadSlotName: event.target.value})}"  type="text" class="col-12" placeholder="${L.translate('insert name for new slot // Namen für neuen Slot eingeben')}" maxlength="15"/>
                    </div>
                    <div class="col-12">
                        <button id="upload-slot-button" disabled="${!state.uploadSlotName}" onclick="${() => this.uploadSlot()}" class="u-full-width" style="position: relative;">
                            <span id="upload-slot-button-normal" style="position: relative">${L.translate('Upload Slot(s) // Slot(s) hochladen')}</span>
                        </button>
                    </div>
                </div>
    
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="reset-slot-button">${L.translate('Reset to default configuration // Rücksetzen auf Defaulteinstellungen')}</label>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <button onclick="${() => this.resetCurrentSlot()}" class="col-12">
                            <span>${L.translate('Reset current slot // Aktuellen Slot zurücksetzen')}</span>
                        </button>
                    </div>
                    <div class="col-md-6">
                        <button onclick="${() => this.resetDevice()}" class="col-12">
                            <span>${L.translate('Reset device // Gerät zurücksetzen')}</span>
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

export {TabSlots};