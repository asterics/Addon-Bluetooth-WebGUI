import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { ATDevice } from "../../communication/ATDevice.js";
import { FaIcon } from "../components/FaIcon.js";
import { L } from "../../lquery.js";
import { firmwareUtil } from "../../util/firmwareUtil.js";
import { FirmwareUpdateModal } from "../modals/FirmwareUpdateModal.js";
import { Slider } from "../components/Slider.js";

const html = htm.bind(h);
let unknown = L.translate('(unknown) // (unbekannt)')

class TabGeneral extends Component {

    constructor() {
        super();

        TabGeneral.instance = this;
        this.state = {
            mainVersion: unknown,
            versionSuffix: null,
            newMainVersion: unknown,
            mainVersionFWInfo: null,
            newMainVersionUrl: '',
            btVersion: unknown,
            newBtVersion: unknown,
            newBtVersionUrl: '',
            mainUpgradeProgress: null,
            btUpgradeProgress: null,
            showFirmwareModal: false
        }

        this.getVersions();
    }

    getVersions() {
        firmwareUtil.getDeviceFWInfo().then(result => {
            this.setState({
                mainVersionFWInfo: result,
                newMainVersion: result.version,
                newMainVersionUrl: result.infoUrl
            });
        });
        firmwareUtil.getBTFWInfo().then(result => {
            this.setState({
                newBtVersion: result.version,
                newBtVersionUrl: result.infoUrl,
                newBtVersionDownloadUrl: result.downloadUrl
            });
        });
        this.getDeviceVersions();
    }

    getDeviceVersions() {
        ATDevice.getVersion().then(result => {
            this.setState({
                mainVersion: result
            });
        })
        let result = ATDevice.getVersionSuffix();
        this.setState({
            versionSuffix: result
        });
        ATDevice.getBTVersion().then(result => {
            this.setState({
                btVersion: result || unknown
            });
        })
    }

    updateBTFirmware() {
        let thiz = this;
        if (!confirm(L.translate('Do you want to update the firmware version of the BT-Addon to version {?}? Hint: keep this tab open and in foreground while updating! // Möchten Sie die Version des BT-Addons auf Version {?} aktualisieren? Hinweis: lassen Sie diesen Tab während dem Update im Vordergrund geöffnet!', this.state.newBtVersion))) {
            return;
        }
        L.HTTPRequest(this.state.newBtVersionDownloadUrl, 'GET', 'arraybuffer', 'BT_FIRMWARE').then(result => {
            thiz.setState({ btUpgradeProgress: 1 });
            ATDevice.upgradeBTAddon(result, (progress) => {
                thiz.setState({ btUpgradeProgress: progress || 1 });
            }).then(() => {
                thiz.setState({ btUpgradeProgress: null });
                setTimeout(() => {
                    thiz.getDeviceVersions();
                }, 1000);
            }).catch(() => {
                alert(L.translate('Update of BT-Addon firmware failed! Please try again and keep tab in foreground while updating. // Aktualisierung der Firmware des BT-Addons fehlgeschlagen! Bitte erneut versuchen und Tab während dem Vorgang im Vordergund geöffnet lassen.'));
                thiz.setState({
                    btVersion: unknown,
                    btUpgradeProgress: null
                });
            });
        });
    }

    updateFirmware() {
        let thiz = this;
        if (C.DEVICE_IS_FM && ATDevice.isMajorVersion(3)) {
            this.setState({
                showFirmwareModal: true
            });
        } else {
            firmwareUtil.updateDeviceFirmware(progress => {
                thiz.setState({ mainUpgradeProgress: progress || 1 });
            });
        }
    }

    resetConfig() {
        let confirmMessage = L.translate('Do you really want to reset the device to the default configuration? All slots will be deleted. // Möchten Sie das Gerät wirklich auf die Standardeinstellungen zurücksetzen? Alle Slots werden gelöscht.');
        if (!window.confirm(confirmMessage)) {
            return;
        }
        ATDevice.restoreDefaultConfiguration().then(() => {
            this.setState({
                slots: ATDevice.getSlots(),
                selectedSlot: ATDevice.getCurrentSlot()
            });
        });
    };

    render() {
        let slots = ATDevice.getSlots();
        let state = this.state;

        return html`
        <h2>${L.translate('Slot test mode // Slot-Test Modus')}</h2>
         <div class="row">
            <div class="col-12">
                <input id="safeMode" type="checkbox" class="mr-2" onchange="${(event) => ATDevice.setSlotTestModeOptions({ enabled: event.target.checked })}" checked="${ATDevice.isSlotTestMode()}"/>
                <label for="safeMode">${L.translate('Enable slot test mode // Slot-Test Modus aktivieren')}</label>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-sm-6 col-lg-5">
                <${Slider} label="Countdown before Test [s] // Countdown vor Test [s]" oninput="${(value) => ATDevice.setSlotTestModeOptions({ countdownSeconds: parseInt(value) })}"
                           min="1" max="120" value="${ATDevice.getSlotTestModeOptions().countdownSeconds}"/>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6 col-lg-5">
                <${Slider} label="Test duration [s] // Test-Dauer [s]" oninput="${(value) => ATDevice.setSlotTestModeOptions({ testSeconds: parseInt(value) })}"
                           min="1" max="600" value="${ATDevice.getSlotTestModeOptions().testSeconds}"/>
            </div>
        </div>
        
        <h2 class="mt-5">${L.translate('Firmware versions // Firmware-Versionen')}</h2>
        <h3>${C.CURRENT_DEVICE} Firmware</h3>
        <div class="container-fluid p-0">
            <div class="row">
                <span class="col col-md-3">${L.translate('Installed version // Installierte Version')}</span>   
                <span class="col col-md-6">
                    <span>${this.state.mainVersion}</span>
                    <span class="${this.state.versionSuffix ? '' : 'd-none'}"> (${this.state.versionSuffix})</span>
                </span>
            </div>
            <div class="row">
                <span class="col col-md-3">${L.translate('Available version // Verfügbare Version')}</span>   
                <a rel="noreferrer" href="${this.state.newMainVersionUrl}" target="_blank" class="col col-md-3"> ${this.state.newMainVersion}</a>
            </div>
            <div class="row mt-3">
                <div class="col-12 col-md-4">
                    <button class="col-12" onclick="${() => this.updateFirmware()}" disabled="${this.state.mainUpgradeProgress}"> <!-- Once the button has been pressed, it will be deactivated. -->
                        <span class="${this.state.mainUpgradeProgress ? 'd-none' : ''}"> 
                            <span class="sr-only">${C.CURRENT_DEVICE}: </span>
                            ${L.isVersionNewer(this.state.mainVersion, this.state.newMainVersion) ? L.translate('Update firmware // Firmware aktualisieren') : L.translate('Overwrite firmware // Firmware überschreiben')}
                        </span>
                        <span class="${this.state.mainUpgradeProgress ? '' : 'd-none'}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.mainUpgradeProgress)}</span>
                    </button>   
                </div>
            </div>
        </div>
        <div class="${state.showFirmwareModal ? '' : 'd-none'}">
            ${html`<${FirmwareUpdateModal} close="${() => this.setState({ showFirmwareModal: false })}" fwInfo="${state.mainVersionFWInfo}" currentFwVersion="${this.state.mainVersion}"/>`}
        </div> 
        
    ${C.DEVICE_IS_FABI && !(ATDevice.isMajorVersion(3)) ? html` <!-- This is a glorified if. -->

        <h3 class="mt-5 ${C.DEVICE_IS_FM && ATDevice.isMajorVersion(3) ? 'd-none' : ''}">Firmware Bluetooth-Addon</h3> <!-- ASK: Is this relevant for the FM. -->
        <div class="container-fluid p-0 ${C.DEVICE_IS_FM && ATDevice.isMajorVersion(3) ? 'd-none' : ''}">
            <div class="row">
                <span class="col col-md-3">${L.translate('Installed version // Installierte Version')}</span>   
                <span class="col col-md-3"> ${this.state.btVersion}</span>   
            </div>
            <div class="row">
                <span class="col col-md-3">${L.translate('Available version // Verfügbare Version')}</span>   
                <a rel="noreferrer" href="${this.state.newBtVersionUrl}" target="_blank" class="col col-md-3"> ${this.state.newBtVersion}</a>   
            </div>
            <div class="row mt-3">
                <div class="col-12 col-md-4 mt-3 mt-md-0">
                    <button class="col-12" onclick="${() => this.updateBTFirmware()}" disabled="${this.state.btUpgradeProgress}">    
                        <span class="${this.state.btUpgradeProgress ? 'd-none' : ''}">
                            <span class="sr-only">Bluetooth-Addon: </span>
                                ${L.isVersionNewer(this.state.btVersion, this.state.newBtVersion) ? L.translate('Update bluetooth firmware // Bluetooth-Firmware aktualisieren') : L.translate('Overwrite bluetooth firmware // Bluetooth-Firmware überschreiben')}
                        </span>
                            <span class="${this.state.btUpgradeProgress ? '' : 'd-none'}"><span class="sr-only">Bluetooth-Addon: </span>
                                ${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.btUpgradeProgress)}
                            </span>
                    </button>   
                </div>
            </div>
        </div> 
    ` : ''} <!-- '' incase it is false. -->


        <h2 class="mt-5">${L.translate('Reset to default configuration // Rücksetzen auf Defaulteinstellungen')}</h2>
        <div class="row mt-2">
            <div class="col-12 col-md-4">
                <button onclick="${() => this.resetConfig()}">
                    ${html`<${FaIcon} icon="fas star-of-life"/>`}
                    <span>${L.translate('Reset device // Gerät zurücksetzen')}</span>
                </button>
            </div>
        </div>
        <h2 class="mt-5">${L.translate('Keyboard shortcuts // Tastenkombinationen')}</h2>
        <div class="row mt-2">
            <div class="col-12">
                <span>${L.translate('The following keyboard shortcuts can be used on this page: // Die folgenden Tastenkombinationen können auf dieser Seite verwendet werden:')}</span>
                <ul>
                    <li class="${C.DEVICE_IS_FM_OR_PAD ? '' : 'd-none'}"><b>${L.translate('Ctrl + C // Strg + C')}:</b> <span>${L.translate('Calibrate FLipMouse middle position // Mittelposition der FLipMouse kalibrieren')}</span></li>
                    <li><b>${L.translate('F1')}:</b> <span>${L.translate('Open manual section for the currently active tab // Benutzerhandbuch-Abschnitt zum aktuell geöffneten Tab öffnen')}</span></li>
                    <li><b>${L.translate('Ctrl + [1-{?}] // Strg + [1-{?}]', C.VIEWS.length)}:</b> <span>${L.translate('Jump to tab with the chosen number // Springe zu Tab mit der gewählten Nummer')}</span></li>
                    <li><b>${L.translate('Ctrl + Space // Strg + Leertaste')}:</b> <span>${L.translate('Jump to last tab // Springe zu vorherigem Tab')}</span></li>
                    <li class="${C.DEVICE_IS_FM_OR_PAD ? '' : 'd-none'}"><b>${L.translate('Ctrl + B // Strg + B')}:</b> <span>${L.translate('Show / hide analog values in visualization // Zeigen / Verstecken der analogen Werte in der Visualisierung')}</span></li>
                </ul>
            </div>
        </div>
        `;
    }
}

export { TabGeneral };