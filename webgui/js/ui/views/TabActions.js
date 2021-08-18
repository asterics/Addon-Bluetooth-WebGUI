import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ActionEditModal} from "../modals/ActionEditModal.js";
import {RadioFieldset} from "../components/RadioFieldset.js";
import {ATDevice} from "../../communication/ATDevice.js";
import {localStorageService} from "../../localStorageService.js";


const html = htm.bind(h);
class TabActions extends Component {

    constructor() {
        super();

        TabActions.instance = this;
        this.state = {
            showCategory: null,
            showAllSlots: localStorageService.getTabActionConfig().showAllSlots !== undefined ? localStorageService.getTabActionConfig().showAllSlots : true,
            modalBtnMode: null,
            modalSlot: null,
            widthEm: window.innerWidth / parseFloat(getComputedStyle(document.querySelector('body'))['font-size'])
        }
        window.addEventListener('resize', this.onresize);
    }

    componentWillUnmount() {
        L.removeClass('body', 'modal-open');
        window.removeEventListener('resize', this.onresize);
    }

    onresize() {
        L.debounce(() => {
            TabActions.instance.setState({
                widthEm: window.innerWidth / parseFloat(getComputedStyle(document.querySelector('body'))['font-size'])
            });
        }, 200, 'RESIZE_TAB_ACTIONS')
    }

    getLinkTitle(btnMode, slot) {
        let modeValue = ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot);
        let isFMNonAltMode = C.DEVICE_IS_FM && btnMode.category === C.BTN_CAT_STICK && modeValue !== C.FLIPMOUSE_MODE_ALT.value;
        if (isFMNonAltMode) {
            return L.translate(btnMode.label);
        } else {
            return L.translate(btnMode.label) + (ATDevice.getButtonAction(btnMode.index, slot) ? ': ' + ATDevice.getButtonAction(btnMode.index, slot) : '');
        }
    }

    getLinkLabel(btnMode, slot) {
        let modeValue = ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot);
        let isFMNonAltMode = C.DEVICE_IS_FM && btnMode.category === C.BTN_CAT_STICK && modeValue !== C.FLIPMOUSE_MODE_ALT.value;
        if (isFMNonAltMode) {
            let mode = C.FLIPMOUSE_MODES.filter(mode => mode.value === modeValue)[0] || {};
            return L.translate(mode.label);
        } else {
            return L.getReadableATCMD(ATDevice.getButtonAction(btnMode.index, slot));
        }
    }

    getSlotStyle(slot) {
        let count = ATDevice.getSlots().length;
        return count > 1 && ATDevice.getCurrentSlot() === slot ? 'font-weight-bold' : '';
    }

    getMaxPrintableSlots() {
        let em = this.state.widthEm;
        if (em >= 149) return 8;
        if (em >= 132) return 7;
        if (em >= 116) return 6;
        if (em >= 100) return 5;
        if (em >= 84) return 4;
        if (em >= 67) return 3;
        if (em >= 51) return 2;
        if (em >= 35) return 1;
        return 0;
    }

    setShowAllSlots(value) {
        this.setState({showAllSlots: value});
        localStorageService.setTabActionConfig({showAllSlots: value});
    }
    
    render() {
        let state = this.state;
        let slots = state.showAllSlots ? ATDevice.getSlots(): [ATDevice.getCurrentSlot()];
        let mobileView = slots.length > this.getMaxPrintableSlots();
        
        let useBtnModes = C.DEVICE_IS_FABI && parseInt(ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS)) > 0 ? C.BTN_MODES_LONGPRESS : C.BTN_MODES;
        let btnModes = useBtnModes.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
        let modalOpen = !!state.modalBtnMode;
        if(modalOpen) {
            L.addClass('body', 'modal-open');
        } else {
            L.removeClass('body', 'modal-open');
        }
        let useCategories = C.DEVICE_IS_FABI && parseInt(ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS)) > 0 ? C.BTN_CATEGORIES_LONGPRESS : C.BTN_CATEGORIES;
        let categoryElements = useCategories.map(cat => {return {value: cat.constant, label: cat.label}});
        categoryElements = [{value: null, label: 'All categories // Alle Kategorien'}].concat(categoryElements);
        let slotElements = [{value: true, label: 'All slots // Alle Slots'}, {value: false, label: 'Current slot // Aktueller Slot'}];

        return html`<div id="tabActions">
             <h2>${L.translate('Action configuration // Aktionen-Konfiguration')}</h2>
            <div class="filter-buttons mb-3">
                ${html`<${RadioFieldset} legend="Show slots: // Zeige Slots:" onchange="${(value) => this.setShowAllSlots(value === 'true')}" elements="${slotElements}" value="${state.showAllSlots}"/>`}
            </div> 
            <div class="${mobileView ? '' : 'd-none'} filter-buttons mb-3">
                ${html`<${RadioFieldset} legend="Show categories: // Zeige Kategorien:" onchange="${(value) => this.setState({showCategory: value})}" elements="${categoryElements}" value="${state.showCategory}"/>`}
             </div>
             
             <ul>
                <li class="row ${mobileView ? 'd-none' : 'd-flex'}" aria-hidden="true" style="font-style: italic">
                    <span class="${mobileView ? 'col-12' : 'col'}">Bezeichnung</span>
                    ${slots.map(slot => html`<span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">Slot "${slot}"</span>`)}
                </li>
                ${btnModes.map((btnMode, index) => html`
                    <li class="row ${mobileView ? 'py-3' : 'py-0'}" style="${index % 2 === 0 ? 'background-color: rgb(224 224 224)' : ''}">
                        <strong class="${mobileView ? 'col-12' : 'col'}">${L.translate(btnMode.label)}</strong>
                        ${slots.map(slot => html`
                            <span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">
                                <span class="${mobileView ? '' : 'd-none'}">Slot "${slot}": </span>
                                <a href="javascript:;" title="${this.getLinkTitle(btnMode, slot)}" onclick="${() => this.setState({modalBtnMode: btnMode, modalSlot: slot})}">${this.getLinkLabel(btnMode, slot)}</a>
                            </span>
                        `)}
                    </li>`)}
            </ul>
            ${modalOpen ? html`<${ActionEditModal} buttonMode="${state.modalBtnMode}" slot="${state.modalSlot}" closeHandler="${() => this.setState({modalBtnMode: ''})}"/>` : ''}
            ${TabActions.style}
        </div>`;
    }
}

TabActions.style = html`<style>
    #tabActions ul {
        list-style-type: none;
    }
    
    #tabActions ul li a {
        white-space: nowrap;
    }
</style>`

export {TabActions};