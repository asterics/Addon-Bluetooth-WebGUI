import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
import {FaIcon} from "./FaIcon.js";
const html = htm.bind(h);

let REVERT_TIME = 10

class SafeModeDialog extends Component {

    constructor(props) {
        super();
        this.state = {
            actionPerforming: false,
            minimized: false,
            revertTime: REVERT_TIME
        }
        this.props = props;
        window.addEventListener(C.EVENT_CONFIG_CHANGED, () => {
            this.setState({});
        });
    }

    testSlot() {
        ATDevice.testCurrentSlot()
        this.intervalHandler = setInterval(() => {
            let newTime = this.state.revertTime - 1;
            if (newTime > 0) {
                this.setState({
                    revertTime: newTime
                })
            } else {
                this.stopTesting();
            }
        }, 1000);
    }

    stopTesting() {
        clearInterval(this.intervalHandler);
        ATDevice.stopTestingCurrentSlot();
        this.setState({
            revertTime: REVERT_TIME
        })
    }

    addTime() {
        this.setState({
            revertTime: this.state.revertTime + 30
        })
    }

    render(props) {
        let state = this.state;
        return html`
            <aside class="safe-mode-dialog" style="position: sticky; bottom: 0.5em; z-index: 1; background-color: khaki; border: 1px solid black; border-radius: 10px; padding: 0.7em;">
                <div class="position-relative container-fluid">
                    <div class="row mb-2">
                        <span class="mr-3">
                            <strong class="mr-2">${L.translate('Safe mode // Sicherer Modus')}</strong>
                            <span class="${ATDevice.hasUnsavedChanges() ? 'd-none' : ''}">${html`<${FaIcon} icon="fas check"/>`} <span class="d-none d-md-inline">${L.translate('(all saved) // (gespeichert)')}</span></span>
                            <span class="${!ATDevice.hasUnsavedChanges() ? 'd-none' : ''}">${html`<${FaIcon} icon="fas exclamation-triangle"/>`} <span class="d-none d-md-inline">${L.translate('(not saved) // (geändert)')}</span></span>
                        </span>
                        
                        <div class="row col order-md-3 justify-content-end">
                            <a onclick="${() => this.setState({minimized: !state.minimized})}" style="cursor: pointer">
                                ${html`<${FaIcon} class="${state.minimized ? 'd-none' : ''}" icon="fas chevron-down"/>`}
                                ${html`<${FaIcon} class="${!state.minimized ? 'd-none' : ''}" icon="fas chevron-up"/>`}
                            </a>
                        </div>
                        <span class="col-12 col-md-auto pl-0 ${state.minimized ? 'd-none' : ''}">${L.translate('settings are not automatically applied to the device // Einstellungen werden nicht automatisch auf das Gerät übertragen')}</span>
                    </div>
                </div>
                <div class="position-relative container-fluid p-0">
                    <div class="row ${state.minimized ? 'd-none' : ''}">
                        <div class="col-12 col-md-3 col-xl-3 d-flex">
                            <button class="col-12" onclick="${() => ATDevice.revertCurrentSlot()}" disabled="${!ATDevice.hasUnsavedChanges()}">${L.translate('Revert slot changes // Slot zurücksetzen')}</button>
                        </div>
                        <div class="col-12 col-md-3 col-xl-3 ${ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => this.testSlot()}" disabled="${!ATDevice.hasUnsavedChanges()}">${L.translate('Test current slot // Aktuellen Slot testen')}</button>
                        </div>
                        <div class="col-8 col-md-3 col-xl-3 ${!ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => this.stopTesting()}">${L.translate('Stop testing // Test stoppen')} <span>${state.revertTime}s</span></button>
                        </div>
                        <div class="col-4 col-md col-xl-1 ${!ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => this.addTime()}">+30s</button>
                        </div>
                        <div class="col-12 col-md-3 col-xl-3 ${!ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => ATDevice.approveCurrentSlot()}">${L.translate('Save current slot // Aktuellen Slot speichern')}</button>
                        </div>
                    </div>
                </div>
            </aside>
            ${SafeModeDialog.style}`;
    }
}

SafeModeDialog.style = html`<style>
    .safe-mode-dialog button {
        text-transform: none;
        line-height: 2em;
    }
</style>`

export {SafeModeDialog};