import {h, Component, render} from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js';
import {TabActions} from "./TabActions.js";
import {TabGeneral} from "./TabGeneral.js";
import {TabSipPuff} from "./TabSipPuff.js";
import {TabSlots} from "./TabSlots.js";
import {TabStick} from "./TabStick.js";
import {TabVisualization} from "./TabVisualization.js";
import {ATDevice} from "../../../js/communication/ATDevice.js";

const html = htm.bind(h);

class MainView extends Component {

    constructor() {
        super();

        MainView.instance = this;
        this.state = {
            views: [],
            currentView: {},
            showConnectionScreen: false,
            showMainScreen: false,
            currentSlot: null,
            slots: [],
            connected: true,
            menuOpen: false
        }
        this.addView('#tabStick', TabStick, 'Stick-Config');
        this.addView('#tabPuff', TabSipPuff, 'Sip and Puff // Saug-Puste-Steuerung');
        this.addView('#tabSlots', TabSlots, 'Slots // Slots');
        this.addView('#tabActions', TabActions, 'Actions // Aktionen');
        this.addView('#tabGeneral', TabGeneral, 'General // Allgemein');
        this.addView('#tabVis', TabVisualization, 'Visualization // Visualisierung');

        L('html')[0].lang = L.getLang();
        if (C.GUI_IS_MOCKED_VERSION || C.GUI_IS_ON_DEVICE) {
            this.initFlip();
        } else {
            this.setState({
                showConnectionScreen: true
            });
        }
    }

    testMode() {
        C.GUI_IS_MOCKED_VERSION = true;
        this.initFlip();
    }

    initFlip() {
        let thiz = this;
        ATDevice.init().then(function () {
            thiz.toView();
            thiz.setState({
                showConnectionScreen: false,
                showMainScreen: true,
                currentSlot: ATDevice.getCurrentSlot(),
                slots: ATDevice.getSlots()
            });
            ATDevice.setSlotChangeHandler(() => {
                thiz.setState({
                    currentSlot: ATDevice.getCurrentSlot(),
                    slots: ATDevice.getSlots()
                });
            });
            ATDevice.addConnectionTestCallback((isConnected) => {
                if (isConnected !== thiz.state.connected) {
                    thiz.setState({
                        connected: isConnected
                    });
                }
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
        viewHash = viewHashes.includes(viewHash) ? viewHash : viewHashes[0];
        let view = this.state.views.filter(el => el.hash === viewHash)[0];

        this.setState({
            currentView: view,
            menuOpen: false
        });
        if (view.object.valueHandler) {
            ATDevice.startLiveValueListener(view.object.valueHandler);
        } else {
            ATDevice.stopLiveValueListener();
        }

        window.location.hash = viewHash;
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    render() {
        let state = this.state;

        return html`
        <div id="connectDiv" class="${state.showConnectionScreen ? '' : 'd-none'}">
            <div class="container-fluid" id="connectContent">
                <h1>${L.translate('FLipMouse Configuration // FlipMouse Konfiguration')}</h1>
                <div class="row">
                    <button class="col-12 col-md-8 offset-md-2" onclick="${() => this.initFlip()}">${L.translate("Connect to FLipMouse connected via USB // Verbinden zu FLipMouse (über USB angeschlossen)")}</button>
                </div>
                <div class="row">
                    <button class="col-12 col-md-8 offset-md-2" onclick="${() => this.testMode()}">${L.translate("Use Test mode without real FLipMouse // Test-Modus ohne echte FLipMouse verwenden")}</button>
                </div>
            </div>
        </div>
        <header class="container-fluid p-0 ${state.showMainScreen ? '' : 'd-none'}" role="banner">
            <div class="row">
                <h1 id="mainHeading" tabindex="-1" class="col col-md-6">${L.translate('FLipMouse Configuration // FLipMouse Konfiguration')}</h1>
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
            <div id="viewContainer">
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