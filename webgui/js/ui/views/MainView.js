import {h, Component, render} from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
import {localStorageService} from "../../localStorageService.js";
import {FaIcon} from "../components/FaIcon.js";

const html = htm.bind(h);

const SCREENS = {
    CONNECTION: 'CONNECTION',
    MAIN: 'MAIN',
    FIRMWARE_CONTINUE: 'FIRMWARE_CONTINUE'
}

class MainView extends Component {

    constructor() {
        super();

        MainView.instance = this;
        this.state = {
            views: [],
            currentView: {},
            showScreen: SCREENS.CONNECTION,
            currentSlot: null,
            slots: [],
            connected: true,
            menuOpen: false,
            errorCode: null,
            showSuccessMsg: window.location.href.indexOf(C.SUCCESS_FIRMWAREUPDATE) > -1,
            updateProgress: null
        }

        C.VIEWS.forEach(view => {
            this.addView(view.hash, view.object, view.label);
        });

        L('html')[0].lang = L.getLang();
        if (C.GUI_IS_MOCKED_VERSION || C.GUI_IS_ON_DEVICE) {
            this.initATDevice();
        } else if(localStorageService.getFirmwareDownloadUrl()) {
            this.setState({
                showScreen: SCREENS.FIRMWARE_CONTINUE,
            });
        } else {
            this.setState({
                showScreen: SCREENS.CONNECTION,
            });
        }
    }

    toConnectionScreen() {
        this.setState({
            showScreen: SCREENS.CONNECTION,
            errorCode: C.ERROR_CONNECTION_LOST,
            showSuccessMsg: false,
            currentView: {}
        });
    }

    testMode() {
        C.GUI_IS_MOCKED_VERSION = true;
        this.initATDevice();
    }

    initATDevice() {
        let thiz = this;
        this.setState({
            errorCode: null,
            showSuccessMsg: false
        });
        ATDevice.init().then(function () {
            thiz.toView();
            thiz.setState({
                showScreen: SCREENS.MAIN,
                currentSlot: ATDevice.getCurrentSlot(),
                slots: ATDevice.getSlots()
            });
            ATDevice.setSlotChangeHandler(() => {
                thiz.setState({
                    currentSlot: ATDevice.getCurrentSlot(),
                    slots: ATDevice.getSlots()
                });
                if (thiz.state.currentView && thiz.state.currentView.object && thiz.state.currentView.object.slotChangeHandler) {
                    thiz.state.currentView.object.slotChangeHandler();
                }
            });
            ATDevice.addConnectionTestHandler((isConnected) => {
                if (isConnected !== thiz.state.connected) {
                    thiz.setState({
                        connected: isConnected
                    });
                }
            });
        }).catch(error => {
            this.setState({
                errorCode: error
            });
        });
    }

    addView(hash, viewObject, label) {
        let views = this.state.views || [];
        views.push({
            hash: hash,
            object: viewObject,
            label: label
        });
        this.setState({
            views: views
        })
    }

    toView(viewHash) {
        let viewHashes = this.state.views.map(el => el.hash);
        viewHash = viewHash || window.location.hash;
        viewHash = viewHashes.includes(viewHash) ? viewHash : C.VIEW_START_HASH || viewHashes[0];
        let view = this.state.views.filter(el => el.hash === viewHash)[0];

        this.setState({
            currentView: view,
            menuOpen: false
        });

        if (view.object.valueHandler && ATDevice.Specific.startLiveValueListener) {
            ATDevice.Specific.startLiveValueListener(view.object.valueHandler);
        } else if (ATDevice.Specific.stopLiveValueListener) {
            ATDevice.Specific.stopLiveValueListener();
        }

        window.location.hash = viewHash;
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    restartFirmwareUpdate() {
        let thiz = this;
        ATDevice.Specific.updateFirmware(localStorageService.getFirmwareDownloadUrl(), (progress) => {
            thiz.setState({updateProgress: progress});
        }, true);
    }

    render() {
        let state = this.state;

        return html`
        <div class="top-layer-center ${state.showScreen === SCREENS.FIRMWARE_CONTINUE? '' : 'd-none'}">
            <div class="container-fluid top-layer-content">
                <h1>${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</h1>
                <div class="row mb-5">
                    <div class="col-12 col-md-8 offset-md-2">
                        ${html`<${FaIcon} icon="fas exclamation-triangle"/>`}
                        <span>${L.translate('The last firmware update was cancelled. Restart it in order to be able to use your device. // Das letzte Firmware-Update wurde abgebrochen. Starten Sie es erneut um das Gerät weiter verwenden zu können.')}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2">
                        <button onclick="${() => this.restartFirmwareUpdate()}" disabled="${this.state.updateProgress}">
                            <span class="${state.updateProgress ? 'd-none' : ''}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Restart firmware update // Firmware-Update erneut starten')}</span>
                            <span class="${state.updateProgress ? '' : 'd-none'}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.updateProgress)}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="top-layer-center ${state.showScreen === SCREENS.CONNECTION? '' : 'd-none'}">
            <div class="container-fluid top-layer-content">
                <h1 class="sr-only">
                    <span >${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</span>
                </h1>
                <div class="row mb-5" aria-hidden="true">
                    <img class="col-10 offset-1 col-md-6 offset-md-3" src="./img/${C.DEVICE_IS_FM ? 'fm' : 'fabi'}_lowres.png"/>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2"><button onclick="${() => this.initATDevice()}">${L.translate("Connect to {?} connected via USB // Verbinden zu {?} (über USB angeschlossen)", C.CURRENT_DEVICE)}</button></div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2"><button onclick="${() => this.testMode()}">${L.translate("Use Test mode without real {?} // Test-Modus ohne {?} verwenden", C.CURRENT_DEVICE)}</button></div>
                </div>
                <div class="row" class="${state.errorCode ? '' : 'd-none'}" style="color: darkred">
                    <strong>${L.translate('Error: // Fehler:')}</strong><span> </span>
                    ${(() => {
                        switch (state.errorCode) {
                            case C.ERROR_SERIAL_DENIED: 
                                return html`<span>${L.translate('Connecting to device not allowed by user, please try again! // Verbindung zum Gerät nicht zugelassen, bitte erneut versuchen!')}</span>`;
                            case C.ERROR_SERIAL_BUSY: 
                                return html`<span>${L.translate("Connecting to device not possible, maybe it's used by another program?! // Verbindung zum Gerät nicht möglich, vielleicht wird es von einem anderen Programm verwendet?!")}</span>`;
                            case C.ERROR_FIRMWARE_OUTDATED: 
                                return html`
                                    <span>${L.translate('Firmware of device is outdated! // Firmware des Gerätes ist veraltet!')}</span>
                                    <div>${L.translate('Please download and install the latest firmware from: // Bitte aktuelle Firmware herunterladen und installieren:')}</div>
                                    <div><a href="https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest" target="_blank">https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest</a></div>
                                `;
                            case C.ERROR_SERIAL_NOT_SUPPORTED:
                                return html`
                                    <span>${L.translate("Connecting to real device not supported by current browser! // Verbindung zu echtem Gerät wird von akuellem Browser nicht unterstützt!")}</span>
                                    <div>
                                        <span>${L.translate('Please try  // Bitte verwenden Sie den ')}</span>
                                        <a href="https://www.google.com/intl/de/chrome/" target="_blank">${L.translate('Chrome browser // Chrome-Browser')}</a>
                                        <span>${L.translate(' or use the offline configuration tool from: //  oder verwenden Sie das offline Konfigurations-Tool von:')}</span>
                                    </div>
                                    <div><a href="https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest" target="_blank">https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest</a></div>
                                `;
                            case C.ERROR_CONNECTION_LOST:
                                return html`<span>${L.translate('Connection to device lost! Please try to reconnect. // Verbindung zum Gerät verloren! Bitte versuchen Sie sich wieder zu verbinden.')}</span>`;
                        }
                    })()}
                </div>
                <div class="row" class="${!state.errorCode && state.showSuccessMsg ? '' : 'd-none'}" style="color: darkgreen">
                    <strong>${L.translate('Success: // Erfolg:')}</strong><span> </span>
                    <span>${L.translate('Firmware update was successful! Please reconnect. // Firmwareupdate erfolgreich abgeschlossen! Bitte erneut verbinden.')}</span>
                </div>
            </div>
        </div>
        <header class="container-fluid p-0 ${state.showScreen === SCREENS.MAIN ? '' : 'd-none'}" role="banner">
            <div class="row">
                <h1 id="mainHeading" tabindex="-1" class="col col-md-6">${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</h1>
                <div class="d-none d-md-inline-block col-md-3">
                    <label class="col-12" for="selectSlots">${L.translate('Select Slot // Slot auswählen')}</label>
                    <div class="col-12">
                        <select id="selectSlots" class="col-12" value="${state.currentSlot}" onchange="${(event) => ATDevice.setSlot(event.target.value)}">
                        ${state.slots.map((slot) => html`
                            <option value="${slot}">${slot}</option>
                        `)}
                    </select>
                    </div>
                </div>
                <div class="col col-md-3">
                    <span class="sr-only">${L.translate('connection status // Verbindungsstatus')}</span>
                    <div class="justify-content-end align-items-center ${state.connected ? 'd-flex' : 'd-none'}">
                        <span aria-hidden="true" title="connected" style="font-size: 2em">${'\u2713'}</span>
                        <span aria-live="assertive" role="status" class="d-none d-md-block ml-2">${L.translate(' connected //  verbunden')}</span>
                    </div>
                    <div class="justify-content-end align-items-center ${state.connected ? 'd-none' : 'd-flex'}">
                        <span aria-hidden="true" title="not connected" style="font-size: 2em">${'\u2717'}</span>
                        <span aria-live="assertive" role="status" class="d-none d-md-block ml-2">${L.translate('not connected // nicht verbunden')}</span>
                    </div>
                </div>
            </div>
            <div class="container-fluid">
                <div class="row mb-5" id="tabMenu" role="menubar" tabindex="-1" accesskey="0">
                    <button id="toNavLink" onclick="${() => this.setState({menuOpen: !state.menuOpen})}" class="col d-md-none button button-primary">${L.translate('\u2630 Menu // \u2630 Menü')}</button>
                    ${state.views.map(view => html`
                        <button role="menuitem" onclick="${() => this.toView(view.hash)}" class="col-md m-1 d-md-block menubutton button-primary ${state.menuOpen ? '' : 'd-none'} ${state.currentView.hash === view.hash ? 'selected' : ''}" aria-selected="${state.currentView.hash === view.hash}">
                            ${L.translate(view.label)}
                        </button>
                    `)}
                </div>
            </div>
        </header>
        <main role="main">
            <div id="viewContainer" style="margin-bottom: 15em;">
                ${this.state.currentView ? html`<${this.state.currentView.object}/>` : ''}
            </div>
        </main>
        ${MainView.style}`;
    }
}

MainView.init = function () {
    render(html`<${MainView}/>`, document.getElementById('content'));
};

MainView.style = html`<style>
</style>`

export {MainView};