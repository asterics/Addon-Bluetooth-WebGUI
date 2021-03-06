import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
import {FaIcon} from "../components/FaIcon.js";
import {L} from "../../lquery.js";

const html = htm.bind(h);
let unknown = L.translate('(unknown) // (unbekannt)')
window.showUpgradeButton = false;
class TabGeneral extends Component {

    constructor() {
        super();

        TabGeneral.instance = this;
        this.state = {
            mainVersion: unknown,
            newMainVersion: unknown,
            newMainVersionUrl: '',
            btVersion: unknown,
            newBtVersion: unknown,
            newBtVersionUrl: '',
            mainUpgradeProgress: null,
            btUpgradeProgress: null
        }

        this.getVersions();
    }

    getVersions() {
        let mainDeviceURL = `https://api.github.com/repos/asterics/${C.CURRENT_DEVICE}/releases/latest`
        L.CachedHTTPRequest(mainDeviceURL, 'GET', 'json').then(result => {
            let binaryAsset = result.assets.filter(asset => asset.name.indexOf('.hex') > -1)[0];
            this.setState({
                newMainVersion: L.formatVersion(result['tag_name']),
                newMainVersionUrl: result['html_url'],
                newMainVersionDownloadUrl: binaryAsset.browser_download_url
            });
        });
        L.CachedHTTPRequest('https://api.github.com/repos/asterics/esp32_mouse_keyboard/releases/latest', 'GET', 'json').then(result => {
            let binaryAsset = result.assets.filter(asset => asset.name.indexOf('.bin') > -1)[0];
            this.setState({
                newBtVersion: L.formatVersion(result['tag_name']),
                newBtVersionUrl: result['html_url'],
                newBtVersionDownloadUrl: binaryAsset.browser_download_url
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
        ATDevice.getBTVersion().then(result => {
            this.setState({
                btVersion: result || unknown
            });
        })
    }

    updateBTFirmware() {
        let thiz = this;
        if (!confirm(L.translate('Do you want to update the firmware version of the BT-Addon to version {?}? Hint: keep this tab open and in foreground while updating! // M??chten Sie die Version des BT-Addons auf Version {?} aktualisieren? Hinweis: lassen Sie diesen Tab w??hrend dem Update im Vordergrund ge??ffnet!', this.state.newBtVersion))) {
            return;
        }
        let url = 'https://proxy.asterics-foundation.org/proxybase64url.php?csurl=' + encodeURIComponent(btoa(this.state.newBtVersionDownloadUrl));
        L.CachedHTTPRequest(url, 'GET', 'arraybuffer', 'BT_FIRMWARE').then(result => {
            thiz.setState({btUpgradeProgress: 1});
            ATDevice.upgradeBTAddon(result, (progress) => {
                thiz.setState({btUpgradeProgress: progress || 1});
            }).then(() => {
                thiz.setState({btUpgradeProgress: null});
                setTimeout(() => {
                    thiz.getDeviceVersions();
                }, 1000);
            });
        });
    }

    updateFirmware() {
        let thiz = this;
        let url = 'https://proxy.asterics-foundation.org/proxybase64url.php?csurl=' + encodeURIComponent(btoa(this.state.newMainVersionDownloadUrl));
        let message = 'Do you want to update the firmware to version {?}? After confirming this message you have to re-select the device ("{?}") in a browser popup. Keep this tab open and in foreground while updating! // M??chten Sie die Firmware auf Version {?} aktualisieren? Nach Best??tigung dieser Meldung m??ssen Sie das Ger??t erneut in einem Browser-Popup ausw??hlen ("{?}"). Lassen Sie diesen Tab w??hrend dem Update im Vordergrund ge??ffnet!';
        let deviceName = C.DEVICE_IS_FM ? L.translate('Unknown device // Unbekanntes Ger??t') : 'Arduino Leonardo';
        if (!confirm(L.translate(message, this.state.newMainVersion, deviceName))) {
            return;
        }
        thiz.setState({mainUpgradeProgress: 1});
        ATDevice.Specific.updateFirmware(url, (progress) => {
            thiz.setState({mainUpgradeProgress: progress || 1});
        });
    }


    resetConfig() {
        let confirmMessage = L.translate('Do you really want to reset the device to the default configuration? All slots will be deleted. // M??chten Sie das Ger??t wirklich auf die Standardeinstellungen zur??cksetzen? Alle Slots werden gel??scht.');
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
    
    render() {
        let slots = ATDevice.getSlots();
        let state = this.state;

        return html`
        <h2>${L.translate('General settings // Allgemeine Einstellungen')}</h2>
        <h3>${L.translate('Usage via USB oder Bluetooth // Verwendung ??ber USB oder Bluetooth')}</h3>
        <div class="container-fluid p-0">
            ${slots.map(slot => html`
                <div class="row">
                    <label class="col-md-4" for="${'devicemode' + slot}">${L.translate('Mode for Slot "{?}" // Modus f??r Slot "{?}"', slot)}</label>
                    <div class="col-md-6">
                        <select class="col-12" id="${'devicemode' + slot}" onchange="${(event) => ATDevice.setDeviceMode(event.target.value, slot)}" value="${ATDevice.getConfig(C.AT_CMD_DEVICE_MODE, slot)}">
                            <option value="1">USB</option>
                            <option value="2">Bluetooth</option>
                            <option value="3">USB + Bluetooth</option>
                        </select>
                    </div>
                    
                </div>
            `)}
        </div>
        <h2>${L.translate('Firmware versions // Firmware-Versionen')}</h2>
        <h3>${C.CURRENT_DEVICE} Firmware</h3>
        <div class="container-fluid p-0">
            <div class="row">
                <span class="col col-md-4">${L.translate('Installed version // Installierte Version')}</span>   
                <span class="col col-md-3"> ${this.state.mainVersion}</span>   
            </div>
            <div class="row">
                <span class="col col-md-4">${L.translate('Available version // Verf??gbare Version')}</span>   
                <a rel="noreferrer" href="${this.state.newMainVersionUrl}" target="_blank" class="col col-md-3"> ${this.state.newMainVersion}</a>   
                <div class="col-12 col-md-4 mt-3 mt-md-0 ${L.isVersionNewer(this.state.mainVersion, this.state.newMainVersion) || window.showUpgradeButton ? '' : 'd-none'}">
                    <button class="col-12" onclick="${() => this.updateFirmware()}" disabled="${this.state.mainUpgradeProgress}">
                        <span class="${this.state.mainUpgradeProgress ? 'd-none' : ''}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Update firmware // Firmware aktualisieren')}</span>
                        <span class="${this.state.mainUpgradeProgress ? '' : 'd-none'}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.mainUpgradeProgress)}</span>
                    </button>   
                </div>
                <div class="col-12 col-md-4 mt-3 mt-md-0 ${L.isVersionNewer(this.state.mainVersion, this.state.newMainVersion) || this.state.mainVersion === unknown ? 'd-none' : ''}">
                    <span style="color: green">${L.translate('{?} firmware is up-to-date! // {?} Firmware ist aktuell!', C.CURRENT_DEVICE)}</span>
                </div>
            </div>
        </div>
        <h3 class="mt-5">Firmware Bluetooth-Addon</h3>
        <div class="container-fluid p-0">
            <div class="row">
                <span class="col col-md-4">${L.translate('Installed version // Installierte Version')}</span>   
                <span class="col col-md-3"> ${this.state.btVersion}</span>   
            </div>
            <div class="row">
                <span class="col col-md-4">${L.translate('Available version // Verf??gbare Version')}</span>   
                <a rel="noreferrer" href="${this.state.newBtVersionUrl}" target="_blank" class="col col-md-3"> ${this.state.newBtVersion}</a>   
                <div class="col-12 col-md-4 mt-3 mt-md-0 ${L.isVersionNewer(this.state.btVersion, this.state.newBtVersion) || window.showUpgradeButton ? '' : 'd-none'}">
                    <button class="col-12" onclick="${() => this.updateBTFirmware()}" disabled="${this.state.btUpgradeProgress}">
                        <span class="${this.state.btUpgradeProgress ? 'd-none' : ''}"><span class="sr-only">Bluetooth-Addon: </span>${L.translate('Update bluetooth firmware // Bluetooth-Firmware aktualisieren')}</span>
                        <span class="${this.state.btUpgradeProgress ? '' : 'd-none'}"><span class="sr-only">Bluetooth-Addon: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.btUpgradeProgress)}</span>
                    </button>   
                </div>
                <div class="col-12 col-md-4 mt-3 mt-md-0 ${L.isVersionNewer(this.state.btVersion, this.state.newBtVersion) || this.state.btVersion === unknown ? 'd-none' : ''}">
                    <span style="color: green">${L.translate('Bluetooth-Addon firmware is up-to-date! // Bluetooth-Addon Firmware ist aktuell!')}</span>
                </div>
            </div>
        </div>
        <h2 class="mt-5">${L.translate('Reset to default configuration // R??cksetzen auf Defaulteinstellungen')}</h2>
        <div class="row mt-2">
            <div class="col-12 col-md-4">
                <button onclick="${() => this.resetConfig()}">
                    ${html`<${FaIcon} icon="fas star-of-life"/>`}
                    <span>${L.translate('Reset device // Ger??t zur??cksetzen')}</span>
                </button>
            </div>
        </div>
        `;
    }
}

export {TabGeneral};