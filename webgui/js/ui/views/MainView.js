import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { ATDevice } from "../../communication/ATDevice.js";
import { localStorageService } from "../../localStorageService.js";
import { FaIcon } from "../components/FaIcon.js";
import { firmwareUtil } from "../../util/firmwareUtil.js";
import { helpUtil } from "../../util/helpUtil.js";
import { SlotTestModeDialog } from "../components/SlotTestModeDialog.js";

const html = htm.bind(h);

const SCREENS = {
    CONNECTION: 'CONNECTION',
    MAIN: 'MAIN',
    FIRMWARE_UPDATE: 'FIRMWARE_UPDATE',
    FIRMWARE_CONTINUE: 'FIRMWARE_CONTINUE'
}

class MainView extends Component {

    constructor() {
        super();
        log.info('last update: 10.01.2023');
        MainView.instance = this;
        MainView.lastViewHash = '';
        this.state = {
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

        L('html')[0].lang = L.getLang();
        if (C.GUI_IS_MOCKED_VERSION || C.GUI_IS_ON_DEVICE) {
            this.initATDevice();
        } else if (localStorageService.getFirmwareDownloadUrl()) {
            this.setState({
                showScreen: SCREENS.FIRMWARE_CONTINUE,
            });
        } else {
            this.setState({
                showScreen: SCREENS.CONNECTION,
            });
        }

        window.addEventListener(C.EVENT_REFRESH_MAIN, () => {
            this.setState({});
        });
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
            if (error === C.ERROR_FIRMWARE_OUTDATED) {
                this.setState({
                    showScreen: SCREENS.FIRMWARE_UPDATE
                });
            } else {
                this.setState({
                    errorCode: error
                });
            }
        });
    }

    toView(viewHash) {
        MainView.lastViewHash = this.state.currentView ? this.state.currentView.hash : '';
        let viewHashes = C.VIEWS.map(el => el.hash);
        viewHash = viewHash || window.location.hash;
        viewHash = viewHashes.includes(viewHash) ? viewHash : C.VIEW_START_HASH || viewHashes[0];
        let view = C.VIEWS.filter(el => el.hash === viewHash)[0];
        helpUtil.setHash(view.helpHash);

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

    toLastView() {
        if (MainView.lastViewHash) {
            this.toView(MainView.lastViewHash);
        }
    }

    continueFirmwareUpdate() {
        let thiz = this;
        ATDevice.Specific.updateFirmware(localStorageService.getFirmwareDownloadUrl(), (progress) => {
            thiz.setState({ updateProgress: progress || 1 });
        }, true);
    }

    startFirmwareUpdate() {
        let thiz = this;
        firmwareUtil.updateDeviceFirmware(progress => {
            thiz.setState({ updateProgress: progress || 1 });
        });
    }

    async disconnect() {
        window.location.reload();
    }

    render() {
        let state = this.state;

        return html`
        <div class="top-layer-center ${state.showScreen === SCREENS.FIRMWARE_UPDATE ? '' : 'd-none'}">
            <div class="container-fluid top-layer-content">
                <h1>${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</h1>
                <div class="row mb-5">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                        ${html`<${FaIcon} icon="fas exclamation-triangle"/>`}
                        <span>${L.translate('The firmware of your device is outdated. Please update it to be able to use this web-based configuration. // Die Firmware des Geräts ist veraltet. Bitte aktualisieren, um die web-basierte Konfiguration verwenden zu können.')}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                        <button onclick="${() => this.startFirmwareUpdate()}" disabled="${this.state.updateProgress}">
                            <span class="${state.updateProgress ? 'd-none' : ''}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Update firmware // Firmware aktualisieren')}</span>
                            <span class="${state.updateProgress ? '' : 'd-none'}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.updateProgress)}</span>
                        </button>
                    </div>
                </div>
                <div class="row">
                    <a class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3 mt-3" href="javascript:;" onclick="${() => { this.setState({ showScreen: SCREENS.CONNECTION }) }}">
                        ${L.translate('Cancel // Abbrechen')}
                    </a>
                </div>
            </div>
        </div>
        <div class="top-layer-center ${state.showScreen === SCREENS.FIRMWARE_CONTINUE ? '' : 'd-none'}">
            <div class="container-fluid top-layer-content">
                <h1>${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</h1>
                <div class="row mb-5">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                        ${html`<${FaIcon} icon="fas exclamation-triangle"/>`}
                        <span>${L.translate('Firmware update was not completed yet. Continue in order to be able to use your device. // Das Firmware-Update wurde noch nicht abgeschlossen. Setzen Sie das Update fort um das Gerät weiter verwenden zu können.')}</span>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3">
                        <button onclick="${() => this.continueFirmwareUpdate()}" disabled="${this.state.updateProgress}">
                            <span class="${state.updateProgress ? 'd-none' : ''}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Continue firmware update // Firmware-Update fortsetzen')}</span>
                            <span class="${state.updateProgress ? '' : 'd-none'}"><span class="sr-only">${C.CURRENT_DEVICE}: </span>${L.translate('Updating... {?}% // Aktualisiere... {?}%', state.updateProgress)}</span>
                        </button>
                    </div>
                </div>
                <div class="row">
                    <a class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3 mt-3" href="javascript:;" onclick="${() => { localStorageService.setFirmwareDownloadUrl(''); this.setState({ showScreen: SCREENS.CONNECTION }) }}">
                        ${L.translate('Cancel firmware update // Firmware-Update abbrechen')}
                    </a>
                </div>
            </div>
        </div>
        <div class="top-layer-center ${state.showScreen === SCREENS.CONNECTION ? '' : 'd-none'}">
            <div class="container-fluid top-layer-content">
                <h1 class="sr-only">
                    <span >${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</span>
                </h1>

                <div class="row mb-5" aria-hidden="true">
                ${C.DEVICE_IS_FABI ? html` <!-- If it is a Fabi then the png image will be taken. The FM uses svg. -->
                <img class="col-10 offset-1 col-md-6 offset-md-3 col-xl-4 offset-xl-4" src="./img/${C.CURRENT_DEVICE}_lowres.png" /> <!--Changed the svg logo to the png one due to the contrast being better in dark mode. -- >
                ` : html`
                    <img class="col-10 offset-1 col-md-6 offset-md-3 col-xl-4 offset-xl-4" src="./img/${C.CURRENT_DEVICE}_logo.svg" /> 
                `}
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3"><button onclick="${() => this.initATDevice()}">${L.translate("Connect to {?} connected via USB // Verbinden zu {?} (über USB angeschlossen)", C.CURRENT_DEVICE)}</button></div>
                </div>
                <div class="row">
                    <div class="col-12 col-md-8 offset-md-2 col-xl-6 offset-xl-3"><button onclick="${() => this.testMode()}">${L.translate("Use Test mode without real {?} // Test-Modus ohne {?} verwenden", C.CURRENT_DEVICE)}</button></div>
                </div>
                <div class="row" class="${state.errorCode ? '' : 'd-none'}" style="color: darkred">
                    <strong>${L.translate('Error: // Fehler:')}</strong><span> </span>
                    ${(() => {
                switch (state.errorCode) {
                    case C.ERROR_SERIAL_DENIED:
                        return html`<span>${L.translate('Connecting to device not allowed by user, please try again! // Verbindung zum Gerät nicht zugelassen, bitte erneut versuchen!')}</span>`;
                    case C.ERROR_SERIAL_BUSY:
                        return html`<span>${L.translate("Connecting to device not possible, maybe it's used by another program?! // Verbindung zum Gerät nicht möglich, vielleicht wird es von einem anderen Programm verwendet?!")}</span>`;
                    case C.ERROR_SERIAL_NOT_SUPPORTED:
                        return html`
                                    <span>${L.translate("Connecting to real device not supported by current browser! // Verbindung zu echtem Gerät wird von akuellem Browser nicht unterstützt!")}</span>
                                    <div>
                                        <span>${L.translate('Please try  // Bitte verwenden Sie den ')}</span>
                                        <a rel="noreferrer" href="https://www.google.com/intl/de/chrome/" target="_blank">${L.translate('Chrome browser // Chrome-Browser')}</a>
                                        <span>${L.translate(' or use the offline configuration tool from: //  oder verwenden Sie das offline Konfigurations-Tool von:')}</span>
                                    </div>
                                    <div><a rel="noreferrer" href="https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest" target="_blank">https://github.com/asterics/${C.CURRENT_DEVICE}/releases/latest</a></div>
                                `;
                    case C.ERROR_CONNECTION_LOST:
                        return html`<span>${L.translate('Connection to device lost! Please try to reconnect. // Verbindung zum Gerät verloren! Bitte versuchen Sie sich wieder zu verbinden.')}</span>`;
                    case C.ERROR_SERIAL_CONNECT_FAILED:
                        return html`<span>${L.translate('Couldn\'t connect to device! Please try to disconnect and reconnect the device to your computer. // Verbindung zum Gerät nicht möglich! Bitte trennen Sie das Gerät vom PC und verbinden Sie es danach erneut.')}</span>`;
                    case C.ERROR_WRONG_DEVICE:
                        return html`
                                    <span>${L.translate("Detected wrong device! // Falsches Gerät erkannt!")}</span>
                                    <div>
                                        <span>${L.translate('Try to use the  // Bitte verwenden Sie stattdessen den ')}</span>
                                        <a rel="noreferrer" href="${C.DEVICE_IS_FM ? 'https://flippad.asterics.eu/' : 'https://flipmouse.asterics.eu/'}">${L.translate('{?} config manager // {?} Config-Manager', C.DEVICE_IS_FM ? 'FLipPad' : 'FLipMouse')}</a>
                                    </div>
                                `;
                }
            })()}
                </div>
                <div class="row" class="${!state.errorCode && state.showSuccessMsg ? '' : 'd-none'}" style="color: darkgreen">
                    <strong>${L.translate('Success: // Erfolg:')}</strong><span> </span>
                    <span>${L.translate('Firmware update was successful! Please reconnect. // Firmwareupdate erfolgreich abgeschlossen! Bitte erneut verbinden.')}</span>
                </div>
                <div style="margin-top: 6em">
                    ${(C.ADDITIONAL_LINKS || []).map(link => html`
                        <div><a rel="noreferrer" href="${L.translate(link.url)}" target="_blank">${L.translate(link.label)}</a></div>
                    `)}
                    <a rel="noreferrer" class="${C.DEVICE_IS_FM ? 'd-none' : ''}" href="init.html?device=${C.CURRENT_DEVICE}">${L.translate('Device initialization // Geräte-Initialisierung')}</a>
                </div>
            </div>
        </div>
        
        <header class="container-fluid p-0 mt-4 ${state.showScreen === SCREENS.MAIN ? '' : 'd-none'}">
            <div class="row">
                <h1 id="mainHeading" tabindex="-1" class="col col-md-6">${L.translate('{?} Configuration // {?} Konfiguration', C.CURRENT_DEVICE)}</h1>
                <div class="d-md-inline-block col-md-3">
                    <div class="row">
                        <label class="col-12" for="selectSlots" dangerouslySetInnerHTML="${{ __html: L.translate('Select Slot // <span lang="en">Slot</span> auswählen') }}"></label>
                    </div>
                    <div class="row">
                        <div class="col-10">
                            <select id="selectSlots" class="col-12" value="${state.currentSlot}" onchange="${(event) => ATDevice.setSlot(event.target.value)}">
                                ${state.slots.map((slot) => html`
                            <option value="${slot}">${slot}</option>
                        `)}
                            </select>
                        </div>
                        <div class="col-2 ${ATDevice.getConfig(C.AT_CMD_DEVICE_MODE) !== 1 ? '' : 'd-none'}">
                            <img width="20" src="img/bt.svg" title="${L.translate('Current slot uses Bluetooth // Aktueller Slot verwendet Bluetooth')}"/>
                        </div>
                    </div>
                </div>
                <div class="col col-md-3">
                    <span class="sr-only">${L.translate('connection status // Verbindungsstatus')}</span>
                    <div class="justify-content-end align-items-center ${state.connected ? 'd-flex' : 'd-none'}">
                        <span aria-hidden="true" title="connected" style="font-size: 2em">${'\u2713'}</span>
                        <span aria-live="assertive" role="status" class="d-none d-md-block ml-2">${L.translate(' connected //  verbunden')}</span>
                        <button class="px-2 ml-3 mb-0" style="width: unset" onclick="${() => { this.disconnect() }}" title="${L.translate('disconnect // Verbindung trennen')}">
                            ${html`<${FaIcon} icon="fas times"/>`}
                        </button>
                    </div>
                    <div class="justify-content-end align-items-center ${state.connected ? 'd-none' : 'd-flex'}">
                        <span aria-hidden="true" title="not connected" style="font-size: 2em">${'\u2717'}</span>
                        <span aria-live="assertive" role="status" class="d-none d-md-block ml-2">${L.translate('not connected // nicht verbunden')}</span>
                        <button class="px-2 ml-3 mb-0" style="width: unset" onclick="${() => { this.disconnect() }}" title="${L.translate('disconnect // Verbindung trennen')}">
                            ${html`<${FaIcon} icon="fas times"/>`}
                        </button>
                    </div>
                    
                </div>
            </div>
            <div class="container-fluid">
                <nav class="row mb-5" id="tabMenu" role="tablist" tabindex="-1" accesskey="0">
                    <button id="toNavLink" onclick="${() => this.setState({ menuOpen: !state.menuOpen })}" class="col d-md-none button button-primary">${L.translate('\u2630 Menu // \u2630 Menü')}</button>
                    ${C.VIEWS.map(view => html`
                        <button role="tab" onclick="${() => this.toView(view.hash)}" class="col-md m-1 d-md-block menubutton button-primary ${state.menuOpen ? '' : 'd-none'} ${state.currentView.hash === view.hash ? 'selected' : ''}" aria-selected="${state.currentView.hash === view.hash}">
                            ${L.translate(view.label)}
                        </button>
                    `)}
                </nav>
            </div>
        </header>
        
        <main role="main" class="${state.showScreen === SCREENS.MAIN ? '' : 'd-none'}" style="flex-grow: 1">
            <div id="viewContainer" style="margin-bottom: 15em;">
                ${this.state.currentView ? html`<${this.state.currentView.object}/>` : ''}
            </div>
        </main>
        <footer class="container-fluid p-0 mb-4 ${state.showScreen === SCREENS.MAIN ? '' : 'd-none'}" style="border-top: 2px solid #0D5F77">
            <div class="d-flex justify-content-md-around flex-column flex-md-row">
                ${(C.ADDITIONAL_LINKS || []).map(link => html`
                        <a rel="noreferrer" href="${L.translate(link.url)}" target="_blank" style="padding-top: 1em">${L.translate(link.label)}</a>
                    `)}
            </div>
        </footer>
        ${ATDevice.isSlotTestMode() && state.showScreen === SCREENS.MAIN ? html`<${SlotTestModeDialog}/>` : ''}
        ${MainView.style}`;
    }
}

MainView.init = function () {
    render(html`<${MainView}/>`, document.getElementById('content'));
};

MainView.style = html`<style>
</style>`

export { MainView };