import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';

const html = htm.bind(h);
class TabSlots extends Component {

    constructor() {
        super();

        TabSlots.instance = this;
        this.state = {
            newSlotName: '',
            selectedSlot: flip.getSlots()[0]
        }
    }

    createSlot(toggleElementList, progressBarId) {
        let thiz = this;
        actionAndToggle(flip.createSlot, [this.state.newSlotName], toggleElementList, progressBarId).then(function () {
            thiz.setState({
                newSlotName: ''
            });
        });
    }

    deleteSlot(toggleElementList, progressBarId) {
        let thiz = this;
        let confirmMessage = L.translate('CONFIRM_DELETE_SLOT', this.state.selectedSlot);
        if (!window.confirm(confirmMessage)) {
            return;
        }
        actionAndToggle(flip.deleteSlot, [this.state.selectedSlot], toggleElementList, progressBarId).then(function () {
            thiz.render();
        });
    };

    uploadSlot() {
        //TODO
        var file = L('#selectSlotUpload').files;
        var slotName = L('#uploadSlotLabelEn') ? L('#uploadSlotLabelEn').value : L('#uploadSlotLabelDe').value;
        var reader=new FileReader();
        reader.readAsText(file[0]);
        reader.onloadend = function(e) {
            //config = flip.parseConfig(e.target.result,true);
            flip.createSlot(slotName,null);
        };
    };

    downloadSlot() {
        let d = new Date();
        let datestr = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear()
        L.downloadasTextFile(this.state.selectedSlot + "-" + datestr + ".set", flip.getSlotConfigText(this.state.selectedSlot));
    };

    downloadAllSlots() {
        let configstr = "";
        flip.getSlots().forEach(function (item) {
            configstr = configstr + flip.getSlotConfigText(item) + "\n";
        });
        let d = new Date();
        let datestr = d.getDate() + "." + (d.getMonth() + 1) + "." + d.getFullYear()
        L.downloadasTextFile("flipmouseconfig-" + datestr + ".set", configstr);
    };

    resetConfig(toggleElementList, progressBarId) {
        let confirmMessage = L.translate('CONFIRM_RESET_SLOTS');
        if(!window.confirm(confirmMessage)){
            return;
        }
        actionAndToggle(flip.restoreDefaultConfiguration, [], toggleElementList, progressBarId).then(() => this.render());
    };

    componentDidUpdate() {
        domI18nInstance.changeLanguage();
    }
    
    render() {
        let state = this.state;
        let slots = flip.getSlots();

        return html`
            <h2 data-i18n="">Slot configuration // Slot Konfiguration</h2>
            <div class="container-fluid px-0">
                <div class="row">
                    <div class="col-12">
                        <label for="selectSlots2" data-i18n>Select slot for action // Slot für Aktion auswählen</label>
                        <select id="selectSlots2" class="col-12" onchange="${(event) => this.setState({selectedSlot: event.target.value})}">
                            ${slots.map(slot => html`<option value="${slot}">${slot}</option>`)}
                        </select>
                    </div>
                </div>
               
                <div class="row">
                    <div class="col-md-6">
                        <button onclick="${() => flip.setSlot(this.state.selectedSlot)}" data-i18n="">Activate Slot // Slot aktivieren</button>
                    </div>
                    <div class="col-md-6">
                        <button id="delete-slot-button" disabled="${slots.length === 0}" onclick="${() => this.deleteSlot(['#delete-slot-button-normal', '#delete-slot-button-saving'], '#delete-slot-value-bar')}" style="position: relative;">
                            <i id="delete-slot-value-bar" class="value-bar color-lightercyan" style="width: 0%;"></i>
                            <span id="delete-slot-button-normal" style="position: relative" data-i18n>Delete Slot // Slot löschen</span>
                            <span id="delete-slot-button-saving" style="display: none" data-i18n>deleting slot... // Slot wird gelöscht...</span>
                        </button>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <button onclick="${() => this.downloadSlot()}" data-i18n="">Download Slot // Slot herunterladen</button>
                    </div>
                    <div class="col-md-6">
                        <button onclick="${() => this.downloadAllSlots()}" data-i18n="">Download all Slots // Alle Slots herunterladen</button>
                    </div>
                </div>
            
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="newSlotLabel" data-i18n="">Create new slot // Neuen Slot anlegen</label>
                    </div>
                    <div class="col-12">
                        <input id="newSlotLabel" class="col-12" oninput="${(event) => this.setState({newSlotName: event.target.value})}" type="text" placeholder="${L.translate('insert name for new slot // Namen für neuen Slot eingeben')}" maxlength="15"/>
                    </div>
                    <div class="col-12">
                        <button id="create-slot-button" disabled="${!state.newSlotName}" onclick="${() => this.createSlot(['#create-slot-button-normal', '#create-slot-button-saving'], '#create-slot-value-bar')}" class="u-full-width" style="position: relative;">
                            <i id="create-slot-value-bar" class="value-bar color-lightercyan" style="width: 0%;"></i>
                            <span id="create-slot-button-normal" style="position: relative" data-i18n>Create Slot // Slot anlegen</span>
                            <span id="create-slot-button-saving" style="display: none" data-i18n>creating slot... // Slot wird anlgelegt...</span>
                        </button>
                    </div>
                </div>
                
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="selectSlotUpload" data-i18n>Upload Slot(s) // Slot(s) hochladen</label>
                    </div>
                    <div class="col-12">
                        <input type=file id="selectSlotUpload" accept=".set"/>
                    </div>
                    <div class="col-12">
                        <input id="uploadSlotLabel" oninput="${(event) => this.setState({uploadSlotName: event.target.value})}"  type="text" class="col-12" placeholder="${L.translate('insert name for new slot // Namen für neuen Slot eingeben')}" maxlength="15"/>
                    </div>
                    <div class="col-12">
                        <button id="upload-slot-button" disabled="${!state.uploadSlotName}" onclick="${() => this.uploadSlot()}" class="u-full-width" style="position: relative;">
                            <span id="upload-slot-button-normal" style="position: relative" data-i18n>Upload Slot(s) // Slot(s) hochladen</span>
                        </button>
                    </div>
                </div>
    
                <div class="row mt-4">
                    <div class="col-12">
                        <label for="reset-slot-button" data-i18n>Reset to default configuration // Rücksetzen auf Defaulteinstellungen</label>
                    </div>
                    <div class="col-12">
                        <button id="reset-slot-button" onclick="${() => this.resetConfig(['#reset-slot-button-normal', '#reset-slot-button-saving'], '#reset-slot-value-bar')}" class="u-full-width" style="position: relative;">
                            <i id="reset-slot-value-bar" class="value-bar color-lightercyan" style="width: 0%;"></i>
                            <span id="reset-slot-button-normal" style="position: relative" data-i18n>Reset // Zurücksetzen</span>
                            <span id="reset-slot-button-saving" style="display: none" data-i18n>Resetting... // Wird zurückgesetzt...</span>
                        </button>
                    </div>
                </div>
            </div>`;
    }
}

TabSlots.init = function () {
    render(html`<${TabSlots}/>`, document.getElementById('viewContainer'));
};

TabSlots.destroy = function () {
    render(null, document.getElementById('viewContainer'));
}

export {TabSlots};