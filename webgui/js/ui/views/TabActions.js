import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { ActionEditModal } from "../modals/ActionEditModal.js";
import { RadioFieldset } from "../components/RadioFieldset.js";
import { ATDevice } from "../../communication/ATDevice.js";
import { localStorageService } from "../../localStorageService.js";

const html = htm.bind(h);

const KEY_TAB_ACTIONS_VIEW_MODE = 'KEY_TAB_ACTIONS_VIEW_MODE';

const VIEW_MODE_SINGLE_SLOT = 'VIEW_MODE_SINGLE_SLOT';
const VIEW_MODE_ALL_SLOTS_TABLE = 'VIEW_MODE_ALL_SLOTS_TABLE';
const VIEW_MODE_ALL_SLOTS_LIST = 'VIEW_MODE_ALL_SLOTS_LIST';

class TabActions extends Component {

  constructor() {
    super();

    TabActions.instance = this;
    this.state = {
      showCategory: null,
      viewMode: localStorageService.hasKey(KEY_TAB_ACTIONS_VIEW_MODE) ? localStorageService.get(KEY_TAB_ACTIONS_VIEW_MODE) : 'VIEW_MODE_SINGLE_SLOT',
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
    if (!this.showFnName(btnMode, slot)) {
      return L.translate(btnMode.label);
    } else {
      return L.translate(btnMode.label) + (ATDevice.getButtonAction(btnMode.index, slot) ? ': ' + ATDevice.getButtonAction(btnMode.index, slot) : '');
    }
  }

  getLinkLabel(btnMode, slot) {
    if (!this.showFnName(btnMode, slot)) {
      let modeValue = ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot);
      let mode = C.FLIPMOUSE_MODES.filter(mode => mode.value === modeValue)[0] || {};
      return L.translate(mode.label);
    } else {
      return L.getReadableATCMD(ATDevice.getButtonAction(btnMode.index, slot));
    }
  }

  isDisabled(btnMode, slot) {
    let isDisabledLongPress = C.DEVICE_IS_FABI && btnMode.category === C.BTN_CAT_BTN_LONGPRESS && ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS, slot) === 0;
    let isDisabledBtn = C.DEVICE_IS_FABI && btnMode.category !== C.BTN_CAT_BTN_LONGPRESS && (btnMode.index === 7 || btnMode.index === 8) && ATDevice.getConfig(C.AT_CMD_THRESHOLD_LONGPRESS, slot) > 0;
    return isDisabledLongPress || isDisabledBtn;
  }

  getBtnModeParam(btnMode, slot) {
    return ATDevice.getButtonAction(btnMode.index, slot).substr(C.LENGTH_ATCMD_PREFIX);
  }

  showFnName(btnMode, slot) {
    let flipmouseAltMode = C.DEVICE_IS_FM && ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot) === C.FLIPMOUSE_MODE_ALT.value;
    let flipadAltMode = C.DEVICE_IS_FLIPPAD && [C.FLIPPAD_MODE_PAD_ALTERNATIVE.value, C.FLIPPAD_MODE_STICK_ALTERNATIVE.value].includes(ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot));
    return C.DEVICE_IS_FABI || flipmouseAltMode || flipadAltMode || btnMode.category !== C.BTN_CAT_STICK;
  }

  getSlotStyle(slot) {
    return ATDevice.getCurrentSlot() === slot ? 'font-weight-bold' : '';
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

  setViewMode(value) {
    this.setState({ viewMode: value });
    localStorageService.save(KEY_TAB_ACTIONS_VIEW_MODE, value);
  }

  render() {
    let state = this.state;
    let slots = state.viewMode !== VIEW_MODE_SINGLE_SLOT ? ATDevice.getSlots() : [ATDevice.getCurrentSlot()];
    let mobileView = slots.length > this.getMaxPrintableSlots() || state.viewMode === VIEW_MODE_ALL_SLOTS_LIST;

    // let btnModesPad = C.BTN_MODES_PAD_ACTIONLIST.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
    //console.log("Pad Action Tab: ", btnModesPad);

    let modalOpen = !!state.modalBtnMode;

    if (modalOpen) {
      L.addClass('body', 'modal-open');

    } else {
      L.removeClass('body', 'modal-open');
    }

    let categoryElements = C.BTN_CATEGORIES.map(cat => { return { value: cat.constant, label: cat.label } });
    categoryElements = [{ value: null, label: 'All categories // Alle Kategorien' }].concat(categoryElements);
    let slotElements = [{ value: VIEW_MODE_SINGLE_SLOT, label: 'Current slot // Aktueller Slot' }, { value: VIEW_MODE_ALL_SLOTS_TABLE, label: 'All slots (table) // Alle Slots (Tabelle)' }, { value: VIEW_MODE_ALL_SLOTS_LIST, label: 'All slots (list) // Alle Slots (Liste)' }];

    return html`<div id="tabActions">
    <h2>${L.translate('Action configuration // Aktionen-Konfiguration')}</h2>
   <div class="filter-buttons mb-3">
       ${html`<${RadioFieldset} legend="Show slots: // Zeige Slots:" onchange="${(value) => this.setViewMode(value)}" elements="${slotElements}" value="${state.viewMode}"/>`}
   </div> 
   <div class="${mobileView ? '' : 'd-none'} filter-buttons mb-3">
       ${html`<${RadioFieldset} legend="Show categories: // Zeige Kategorien:" onchange="${(value) => this.setState({ showCategory: value })}" elements="${categoryElements}" value="${state.showCategory}"/>`}
    </div>
    
    <ul>
       <li class="row ${mobileView ? 'd-none' : 'd-flex'}" aria-hidden="true" style="font-style: italic; font-size: 1.2em">
           <span class="${mobileView ? 'col-12' : 'col'}">Bezeichnung</span>
           ${slots.map(slot => html`<span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">Slot "${slot}"</span>`)}
       </li>
      
       ${C.DEVICE_IS_FABI && !(ATDevice.isMajorVersion(3)) ? (() => {
        let btnModesFabiV2 = C.BTN_MODES_FABI_V2_ACTIONLIST.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
        return html`
               ${btnModesFabiV2.map((btnMode, index) => html`
                   <li class="row ${mobileView ? 'py-3' : 'py-0'}" style="${index % 2 === 0 ? 'background-color: rgb(224 224 224)' : ''}">
                       <strong class="${mobileView ? 'col-12' : 'col'}">${L.translate(btnMode.label)}</strong>
                       ${slots.map(slot => html`
                           <span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">
                               <span class="${mobileView ? '' : 'd-none'}">Slot "${slot}": </span>
                               <span class="${this.isDisabled(btnMode, slot) ? '' : 'd-none'}" style="font-weight: normal" title="${L.translate('Go to tab "Timings" to configure long press threshold // Gehe zu Tab "Timings" um Schwellenwert für langes Drücken zu konfigurieren')}">
                                   ${L.translate('(disabled) // (deaktiviert)')}
                               </span>
                               <a href="javascript:;" title="${this.getLinkTitle(btnMode, slot)}" class="${this.isDisabled(btnMode, slot) ? 'd-none' : ''}" onclick="${() => this.setState({ modalBtnMode: btnMode, modalSlot: slot })}">
                                   <span style="${ATDevice.getButtonAction(btnMode.index, slot) === C.AT_CMD_NO_CMD ? 'font-weight: normal' : ''}">${this.getLinkLabel(btnMode, slot)}</span>
                                   <span class="${!this.showFnName(btnMode, slot) || (!mobileView && state.viewMode === VIEW_MODE_ALL_SLOTS_TABLE && ATDevice.getSlots().length > 1) || !this.getBtnModeParam(btnMode, slot) ? 'd-none' : ''}" style="font-weight: normal"> (${this.getBtnModeParam(btnMode, slot)})</span>
                               </a>
                           </span>
                       `)}
                   </li>
               `)}
           `;
      })() : ''} 
       
       ${C.DEVICE_IS_FABI && (ATDevice.isMajorVersion(3)) ? (() => {
        let btnModesFabiV3 = C.BTN_MODES_FABI_V3_ACTIONLIST.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
        return html`
               ${btnModesFabiV3.map((btnMode, index) => html`
                   <li class="row ${mobileView ? 'py-3' : 'py-0'}" style="${index % 2 === 0 ? 'background-color: rgb(224 224 224)' : ''}">
                       <strong class="${mobileView ? 'col-12' : 'col'}">${L.translate(btnMode.label)}</strong>
                       ${slots.map(slot => html`
                           <span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">
                               <span class="${mobileView ? '' : 'd-none'}">Slot "${slot}": </span>
                               <span class="${this.isDisabled(btnMode, slot) ? '' : 'd-none'}" style="font-weight: normal" title="${L.translate('Go to tab "Timings" to configure long press threshold // Gehe zu Tab "Timings" um Schwellenwert für langes Drücken zu konfigurieren')}">
                                   ${L.translate('(disabled) // (deaktiviert)')}
                               </span>
                               <a href="javascript:;" title="${this.getLinkTitle(btnMode, slot)}" class="${this.isDisabled(btnMode, slot) ? 'd-none' : ''}" onclick="${() => this.setState({ modalBtnMode: btnMode, modalSlot: slot })}">
                                   <span style="${ATDevice.getButtonAction(btnMode.index, slot) === C.AT_CMD_NO_CMD ? 'font-weight: normal' : ''}">${this.getLinkLabel(btnMode, slot)}</span>
                                   <span class="${!this.showFnName(btnMode, slot) || (!mobileView && state.viewMode === VIEW_MODE_ALL_SLOTS_TABLE && ATDevice.getSlots().length > 1) || !this.getBtnModeParam(btnMode, slot) ? 'd-none' : ''}" style="font-weight: normal"> (${this.getBtnModeParam(btnMode, slot)})</span>
                               </a>
                           </span>
                       `)}
                   </li>
               `)}
           `;
      })() : ''}
       
   ${C.DEVICE_IS_FM ? (() => {
        let btnModesFM = C.BTN_MODES_FM_ACTIONLIST.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
        return html`
               ${btnModesFM.map((btnMode, index) => html`
                   <li class="row ${mobileView ? 'py-3' : 'py-0'}" style="${index % 2 === 0 ? 'background-color: rgb(224 224 224)' : ''}">
                       <strong class="${mobileView ? 'col-12' : 'col'}">${L.translate(btnMode.label)}</strong>
                       ${slots.map(slot => html`
                           <span class="${mobileView ? 'col-12' : 'col'} ${this.getSlotStyle(slot)}">
                               <span class="${mobileView ? '' : 'd-none'}">Slot "${slot}": </span>
                               <span class="${this.isDisabled(btnMode, slot) ? '' : 'd-none'}" style="font-weight: normal" title="${L.translate('Go to tab "Timings" to configure long press threshold // Gehe zu Tab "Timings" um Schwellenwert für langes Drücken zu konfigurieren')}">
                                   ${L.translate('(disabled) // (deaktiviert)')}
                               </span>
                               <a href="javascript:;" title="${this.getLinkTitle(btnMode, slot)}" class="${this.isDisabled(btnMode, slot) ? 'd-none' : ''}" onclick="${() => this.setState({ modalBtnMode: btnMode, modalSlot: slot })}">
                                   <span style="${ATDevice.getButtonAction(btnMode.index, slot) === C.AT_CMD_NO_CMD ? 'font-weight: normal' : ''}">${this.getLinkLabel(btnMode, slot)}</span>
                                   <span class="${!this.showFnName(btnMode, slot) || (!mobileView && state.viewMode === VIEW_MODE_ALL_SLOTS_TABLE && ATDevice.getSlots().length > 1) || !this.getBtnModeParam(btnMode, slot) ? 'd-none' : ''}" style="font-weight: normal"> (${this.getBtnModeParam(btnMode, slot)})</span>
                               </a>
                           </span>
                       `)}
                   </li>
               `)}
           `;
      })() : ''}
   
</ul>
   ${modalOpen ? html`<${ActionEditModal} buttonMode="${state.modalBtnMode}" slot="${state.modalSlot}" closeHandler="${() => this.setState({ modalBtnMode: '' })}"/>` : ''}
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

export { TabActions };