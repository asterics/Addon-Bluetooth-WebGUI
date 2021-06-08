import {h, Component, render} from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js';
import {TabActions} from "./TabActions.js";
import {TabGeneral} from "./TabGeneral.js";
import {TabSipPuff} from "./TabSipPuff.js";
import {TabSlots} from "./TabSlots.js";
import {TabStick} from "./TabStick.js";
import {TabVisualization} from "./TabVisualization.js";

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
            connected: true
        }
        this.addView('#tabStick', TabStick, 'Stick-Config');
        this.addView('#tabPuff', TabSipPuff, 'Sip and Puff // Saug-Puste-Steuerung');
        this.addView('#tabSlots', TabSlots, 'Slots // Slots');
        this.addView('#tabActions', TabActions, 'Actions // Aktionen');
        this.addView('#tabGeneral', TabGeneral, 'General // Allgemein');
        this.addView('#tabVis', TabVisualization, 'Visualization // Visualisierung');

        window.domI18nInstance = domI18n({
            selector: '[data-i18n]',
            separator: ' // ',
            languages: ['en', 'de'],
            enableLog: false
        });
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
        window.flip = new FlipMouse();
        flip.init().then(function () {
            thiz.toView();
            thiz.setState({
                showConnectionScreen: false,
                showMainScreen: true,
                currentSlot: flip.getCurrentSlot(),
                slots: flip.getSlots()
            });
            flip.setSlotChangeHandler(() => {
                thiz.setState({
                    currentSlot: flip.getCurrentSlot(),
                    slots: flip.getSlots()
                });
            });
            flip.addConnectionTestCallback((isConnected) => {
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
            currentView: view
        });
        if (view.object.valueHandler) {
            flip.startLiveValueListener(view.object.valueHandler);
        } else {
            flip.stopLiveValueListener();
        }

        window.domI18nInstance.changeLanguage();
        window.location.hash = viewHash;
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
    }

    render() {
        let state = this.state;

        return html`
        <div id="connectDiv" class="${state.showConnectionScreen ? '' : 'd-none'}">
            <div id="connectContent">
                <h1>FLipMouse Configuration</h1>
                <div class="row">
                    <button class="twelve columns" onclick="${() => this.initFlip()}">${L.translate("Connect to FLipMouse connected via USB // Verbinden zu FLipMouse (über USB angeschlossen)")}</button>
                    <button class="twelve columns" onclick="${() => this.testMode()}">${L.translate("Use Test mode without real FLipMouse // Test-Modus ohne echte FLipMouse verwenden")}</button>
                </div>
            </div>
        </div>
        <header class="container-fluid ${state.showMainScreen ? '' : 'd-none'}" role="banner">
            <div class="row">
                <div>
                    <h1 id="mainHeading" tabindex="-1" class="nine columns" data-i18n>FLipMouse Configuration // FLipMouse Konfiguration</h1>
                    <span aria-hidden="true" class="show-mobile headerConnectIndicator green connectedIndicator" title="connected">&#x2713;</span>
                    <span aria-hidden="true" class="show-mobile headerConnectIndicator red disconnectedIndicator" style="display: none" title="not connected">&#x2717;</span>
                </div>
                <div class="three columns hide-mobile showscreenreader">
                    <div class="row">
                        <label class="seven columns" for="selectSlots" data-i18n>Select Slot // Slot auswählen</label>
                        <div class="four columns text-right">
                            <span aria-hidden="true" class="connectedIndicator" title="connected">&#x2713;</span>
                            <span aria-hidden="true" style="display: none" class="disconnectedIndicator" title="not connected">&#x2717;</span>
                            <span id="connStateLabel" aria-hidden="false" class="hidden" data-i18n>connection status // Verbindungsstatus</span>
                            <span id="connStateText" aria-hidden="false" aria-describedby="connStateLabel" aria-live="assertive" role="status" class="show-desktop" accesskey="p" data-i18n>not connected // nicht verbunden</span>
                        </div>
                    </div>
                    <select aria-hidden="true" id="selectSlots" class="slot-select row u-full-width" value="${state.currentSlot}" onchange="${(event) => flip.setSlot(event.target.value)}">
                        ${state.slots.map((slot) => html`
                            <option value="${slot}">${slot}</option>
                        `)}
                    </select>
                </div>
            </div>
            <div class="row mb-5" id="tabMenu" role="menubar" tabindex="-1" accesskey="0">
                <button id="toNavLink" onclick="L.toggleClass('.menubutton', 'd-none')" class="col d-md-none button button-primary" data-tab data-i18n>&#x2630; Menu // &#x2630; Menü</button>
                ${state.views.map(view => html`
                    <button role="menuitem" onclick="${() => this.toView(view.hash)}" class="col-md m-1 d-none d-md-block menubutton button-primary ${state.currentView.hash === view.hash ? 'selected' : ''}" aria-selected="${state.currentView.hash === view.hash}">
                        ${L.translate(view.label)}
                    </button>
                `)}
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