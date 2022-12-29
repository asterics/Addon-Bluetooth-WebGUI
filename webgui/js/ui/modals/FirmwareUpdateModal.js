import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {FaIcon} from "../components/FaIcon.js";
import {ATDevice} from "../../communication/ATDevice.js";

const html = htm.bind(h);
class FirmwareUpdateModal extends Component {

    constructor(props) {
        super();
        this.props = props;
        this.state = {
            enteredDownloadMode: false
        }
    }

    enterDownloadMode() {
        if (ATDevice.Specific.enterFwDownloadMode) {
            ATDevice.Specific.enterFwDownloadMode();
            this.setState({
                enteredDownloadMode: true
            })
        }
    }

    close() {
        if (this.state.enteredDownloadMode) {
            return;
        }
        this.props.close();
    }
    
    render(props) {
        if (!props || !props.fwInfo) {
            return;
        }
        let index = props.fwInfo.originalDownloadUrl.lastIndexOf("/");
        let fwFileName = props.fwInfo.originalDownloadUrl.substring(index + 1);

        return html`
            <div class="modal-mask text-modal fwmodal">
                <div class="modal-wrapper">
                    <div class="modal-container">
                        <a class="close-button" href="javascript:void(0);" onclick="${() => this.close()}">X</a>
                        <div class="modal-header">
                            <h1 name="header">
                                <span>Firmware-Update</span>
                            </h1>
                        </div>
    
                        <div class="modal-body container-fluid p-0">
                            <div>
                                ${L.translate("Installed version: // Installierte Version:")} ${props.currentFwVersion}
                            </div>
                            <div>
                                ${L.translate("Available version: // Verfügbare Version:")} <a href="${props.fwInfo.infoUrl}" target="_blank">${props.fwInfo.version}</a>
                            </div>
                            <div class="mt-5">
                                ${L.translate('To update the firmware of your device, please follow these steps: // Um die Firmware Ihres Gerätes zu aktualisieren, führen Sie folgende Schritte aus:')}
                            </div>
                            <ol class="ml-0 ml-md-3 my-4">
                                <li>
                                    <span>Laden Sie die Firmware-Datei herunter: <a target="_blank" href="${props.fwInfo.originalDownloadUrl}">Download Firmware-Datei "${fwFileName}"</a></span>
                                </li>
                                <li>${L.translate('Put the device into download mode. Afterwards it will connect to the computer like an USB storage device. // Versetzen Sie das Gerät in den Download-Modus. Dadurch meldet es sich am PC als USB-Speicher an.')}
                                    <div class="d-flex mt-2">
                                        <div>
                                            <button onclick="${() => {this.enterDownloadMode()}}">${L.translate("Set device to download mode // Gerät in Download-Modus versetzen")}</button>
                                            ${this.state.enteredDownloadMode ? html`<${FaIcon} icon="fas check"/>` : ''}
                                        </div>
                                    </div>
                                </li>
                                <li>${L.translate('Copy the file "{?}" you\'ve downloaded before to the storage device connected to your computer (like an USB flash drive)^. // Kopieren Sie die heruntergeladene Datei "{?}" auf den am PC angeschlossenen USB-Speicher (wie auf einen USB-Stick).', fwFileName)}</li>
                                <li>${L.translate("The device will automatically reboot. Afterwards reload this page and connect again to the device. // Das Gerät wird automatisch neu starten. Laden Sie diese Seite danach neu und verbinden Sie sich erneut zum Gerät.")}</li>
                            </ol>
                            
                            <div class="mt-4 ${this.state.enteredDownloadMode ? '': 'd-none'}">
                                ${html`<${FaIcon} icon="fas info-circle"/>`}
                                ${L.translate("Hint: if you want to cancel the update process, disconnect and reconnect the device from the computer and reload this page. // Hinweis: Wenn Sie das Update abbrechen wollen, trennen und verbinden Sie das Gerät erneut. Laden Sie danach diese Seite neu.")}
                            </div>
                        </div>
    
                        <div class="modal-footer" style="margin-top: 4em">
                            <div class="row">
                                <div class="col">
                                    <button onclick="${() => this.close()}" class="button-primary ${this.state.enteredDownloadMode ? 'd-none': ''}">
                                        ${html`<${FaIcon} icon="fas times" invert="true"/>`}
                                        ${L.translate('Close // Schließen')}
                                    </button>
                                    <button onclick="${() => window.location.reload()}" class="button-primary ${this.state.enteredDownloadMode ? '': 'd-none'}">
                                        ${html`<${FaIcon} icon="fas arrow-rotate-right" invert="true"/>`}
                                        ${L.translate('Reload page // Seite neu laden')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ${FirmwareUpdateModal.style}`
    }
}

FirmwareUpdateModal.style = html`<style>
    .fwmodal ol li {
        margin-bottom: 1.5em;
    }
    
    .fwmodal ol button {
        width: unset;
        margin: auto;
    }
</style>`

export {FirmwareUpdateModal};