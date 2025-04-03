import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
import {FaIcon} from "./FaIcon.js";
import {audioUtil} from "../../util/audioUtil.js";

const html = htm.bind(h);

class SlotTestModeDialog extends Component {

    constructor(props) {
        super();
        this.state = {
            actionPerforming: false,
            minimized: false,
            revertTime: ATDevice.getSlotTestModeOptions().testSeconds,
            coutdownTime: ATDevice.getSlotTestModeOptions().countdownSeconds,
            currentTestTime: ATDevice.getSlotTestModeOptions().testSeconds,
            currentCountdown: ATDevice.getSlotTestModeOptions().countdownSeconds,
            coutdownIntervalHandler: null
        }
        this.props = props;
        window.addEventListener(C.EVENT_CONFIG_CHANGED, () => {
            this.setState({});
        });
    }

    startTestCountdown() {
        this.stopTesting();
        this.startCountdownTime = new Date().getTime();
        let intervalHandler = setInterval(() => {
            if (new Date().getTime() - this.startCountdownTime > this.state.coutdownTime * 1000) {
                audioUtil.beepHigh();
                this.stopTesting();
                this.testSlot();
            } else {
                this.setState({
                    currentCountdownTime: Math.ceil(this.state.coutdownTime - (new Date().getTime() - this.startCountdownTime) / 1000)
                })
            }
        }, 200);
        this.setState({
            coutdownIntervalHandler: intervalHandler
        });
    }

    testSlot() {
        ATDevice.testCurrentSlot();
        this.startTestTime = new Date().getTime();
        this.intervalHandler = setInterval(() => {
            if (new Date().getTime() - this.startTestTime > this.state.revertTime * 1000) {
                audioUtil.beep();
                this.stopTesting();
            } else {
                this.setState({
                    currentTestTime: Math.ceil(this.state.revertTime - (new Date().getTime() - this.startTestTime) / 1000)
                })
            }
        }, 200);
    }

    stopTesting() {
        clearInterval(this.intervalHandler);
        clearInterval(this.state.coutdownIntervalHandler);
        ATDevice.stopTestingCurrentSlot();
        this.setState({
            revertTime: ATDevice.getSlotTestModeOptions().testSeconds,
            coutdownTime: ATDevice.getSlotTestModeOptions().countdownSeconds,
            coutdownIntervalHandler: null,
            currentTestTime: ATDevice.getSlotTestModeOptions().testSeconds,
            currentCountdownTime: ATDevice.getSlotTestModeOptions().countdownSeconds
        });
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
                            <strong class="mr-2">${L.translate('Slot test mode // Slot-Test Modus')}</strong>
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
                    <div class="row ${state.coutdownIntervalHandler ? '' : 'd-none'}">
                        <div class="col-12">
                            <span class="mr-2" style="font-size: 1.5em">${L.translate('Test starts in {?} seconds ... // Test startet in {?} Sekunden ...', state.currentCountdownTime)}</span>
                            <button onclick="${() => this.stopTesting()}">${L.translate('Cancel // Abbrechen')}</button>
                        </div>
                    </div>
                    <div class="row ${ATDevice.isTesting() ? '' : 'd-none'}">
                        <div class="col-12">
                            <span class="mr-2" style="font-size: 1.5em">${L.translate('Test is running! Revert in {?} seconds ... // Test läuft! Zurücksetzen in {?} Sekunden ...', state.currentTestTime)}</span>
                            <button onclick="${() => this.stopTesting()}">${L.translate('Stop test // Test stoppen')}</button>
                            <button class="col-12" onclick="${() => this.addTime()}">+30s</button>
                        </div>
                    </div>
                    <div class="row ${state.minimized || state.coutdownIntervalHandler || ATDevice.isTesting() ? 'd-none' : ''}">
                        <div class="col-12 col-md-3 col-xl-3 d-flex">
                            <button class="col-12" onclick="${() => ATDevice.revertCurrentSlot()}" disabled="${!ATDevice.hasUnsavedChanges()}">${L.translate('Revert slot changes // Slot zurücksetzen')}</button>
                        </div>
                        <div class="col-12 col-md-3 col-xl-3 ${ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => this.startTestCountdown()}" disabled="${!ATDevice.hasUnsavedChanges()}">${L.translate('Test current slot // Aktuellen Slot testen')}</button>
                        </div>
                        <div class="col-12 col-md-3 col-xl-3 ${ATDevice.isTesting() ? 'd-none' : 'd-flex'}">
                            <button class="col-12" onclick="${() => ATDevice.approveCurrentSlot()}" disabled="${!ATDevice.hasUnsavedChanges()}">${L.translate('Save current slot // Aktuellen Slot speichern')}</button>
                        </div>
                    </div>
                </div>
            </aside>
            ${SlotTestModeDialog.style}`;
    }
}

SlotTestModeDialog.style = html`<style>
    .safe-mode-dialog button {
        text-transform: none;
        line-height: 2em;
        width: unset;
    }
</style>`

export {SlotTestModeDialog};