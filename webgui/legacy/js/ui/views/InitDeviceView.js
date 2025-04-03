import {h, Component, render} from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {FaIcon} from "../components/FaIcon.js";
import {firmwareUtil} from "../../util/firmwareUtil.js";
import {ATDevice} from "../../communication/ATDevice.js";
import {localStorageService} from "../../localStorageService.js";

const html = htm.bind(h);

class InitDeviceView extends Component {

    constructor() {
        super();

        this.state = {
            updateProgress: null,
            success: false,
            redirectUrl: C.DEVICE_IS_FABI ? 'index_fabi.htm' : C.DEVICE_IS_FLIPPAD ? 'index_pad.htm' : 'index_fm.htm'
        }
    }

    flash() {
        let thiz = this;
        thiz.setState({success: false});
        let majorVersion = C.DEVICE_IS_FM ? 2 : undefined;
        firmwareUtil.getDeviceFWInfo(C.CURRENT_DEVICE, majorVersion).then(async result => {
            await ATDevice.Specific.Updater.resetDevice(null, []);
            if (C.DEVICE_IS_FM_OR_PAD) {
                localStorageService.setFirmwareDownloadUrl(result.downloadUrl);
            }
            await ATDevice.Specific.Updater.uploadFirmware(result.downloadUrl, (progress) => {
                if (progress === 100) {
                    thiz.setState({updateProgress: null, success: true});
                    localStorageService.setFirmwareDownloadUrl('');
                } else {
                    thiz.setState({updateProgress: progress || 1});
                }
            }, []).catch(() => {
                if (C.DEVICE_IS_FM_OR_PAD) {
                    window.location.replace(thiz.state.redirectUrl); // redirect to main page where aborted FW Update is handled
                }
            });
        });
    }

    render() {
        let state = this.state;

        return html`
            <div class="top-layer-center">
                <div class="container-fluid top-layer-content">
                    <h1>
                        ${L.translate('{?} firmware initialization // {?} Firmware-Initialisierung', C.CURRENT_DEVICE)}</h1>
                    <div class="row mb-5">
                        <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                            ${html`
                                <${FaIcon} icon="fas info-circle"/>`}
                            <span>${L.translate('On this page it is possible to initialize a {?} device for the first time if it has no firmware. While flashing you have to select the device twice. Keep this tab open and in foreground while flashing! // Auf dieser Seite kann ein {?}-Gerät für die erste Verwendung initialisiert werden, wenn es noch keine Firmware hat. Während der Initialisierung muss das Gerät 2x ausgewählt werden. Lassen Sie diesen Tab während dem Hochladen im Vordergrund geöffnet!', C.CURRENT_DEVICE)}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                            <button onclick="${() => this.flash()}"
                                    disabled="${this.state.updateProgress}">
                                <span class="${state.updateProgress ? 'd-none' : ''}"><span
                                        class="sr-only">${C.CURRENT_DEVICE}
                                    : </span>${L.translate('Flash firmware // Firmware aufspielen')}</span>
                                <span class="${state.updateProgress ? '' : 'd-none'}"><span
                                        class="sr-only">${C.CURRENT_DEVICE}
                                    : </span>${L.translate('Flashing... {?}% // wird hochgeladen... {?}%', state.updateProgress)}</span>
                            </button>
                            <div class="row" class="${state.success ? '' : 'd-none'}" style="color: darkgreen">
                                <strong>${L.translate('Success: // Erfolg:')}</strong><span> </span>
                                <span>${L.translate('Flashing firmware was successful! // Hochladen der Firmware erfolgreich abgeschlossen!')}</span>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <a class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3 mt-3"
                           href="${state.redirectUrl}">
                            ${L.translate('Back to main page // Zurück zur Hauptseite')}
                        </a>
                    </div>
                </div>
            </div>
            ${InitDeviceView.style}`;
    }
}

InitDeviceView.init = function () {
    render(html`
        <${InitDeviceView}/>`, document.getElementById('content'));
};

InitDeviceView.style = html`
    <style>
    </style>`

export {InitDeviceView};