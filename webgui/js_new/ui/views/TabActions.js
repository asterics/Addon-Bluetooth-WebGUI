import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import { RadioFieldset } from "../components/RadioFieldset.js";
import { ATDevice } from "../../communication/ATDevice.js";
import { localStorageService } from "../../localStorageService.js";
import { FaIcon } from "../components/FaIcon.js";
import { TriggerEditModal } from "../modals/TriggerEditModal.js";

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
      viewMode: localStorageService.hasKey(KEY_TAB_ACTIONS_VIEW_MODE) ? localStorageService.get(KEY_TAB_ACTIONS_VIEW_MODE) : 'VIEW_MODE_SINGLE_SLOT',
      editingTrigger: null,
      editingSlot: null,
      isNewTrigger: false,
      busy: false,
      error: '',
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

  getReadableTriggerAction(action) {
    return L.getReadableATCMD(action || C.AT_CMD_NO_CMD);
  }

  getButtonOptions() {
    let options = [];
    let physicalCount = C.PYHSICAL_BUTTON_COUNT || C.PHYSICAL_BUTTON_COUNT || 0;
    for (let i = 1; i <= physicalCount; i++) {
      options.push('B' + i);
    }
    if (ATDevice.getSensorInfo()[C.FORCE_SENSOR]) {
      options = options.concat(['up', 'down', 'left', 'right']);
    }
    if (ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]) {
      options = options.concat(['sip', 'puff', 'strongsip', 'strongpuff']);
    }
    return options;
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

  openEditTrigger(slot, trigger) {
    L.addClass('body', 'modal-open');
    this.setState({ editingTrigger: trigger, editingSlot: slot, isNewTrigger: false });
  }

  openNewTrigger(slot) {
    L.addClass('body', 'modal-open');
    this.setState({ editingTrigger: null, editingSlot: slot, isNewTrigger: true });
  }

  handleModalClose(changed) {
    L.removeClass('body', 'modal-open');
    this.setState({ editingTrigger: null, editingSlot: null, isNewTrigger: false });
  }

  async clearTrigger(slot, trigger) {
    this.setState({ busy: true, error: '' });
    try {
      await ATDevice.clearTrigger(trigger, slot);
      this.setState({ busy: false, error: '' });
    } catch (error) {
      console.warn(error);
      this.setState({ busy: false, error: L.translate('Could not delete trigger. // Trigger konnte nicht gelöscht werden.') });
    }
  }

  async clearAll(slot) {
    this.setState({ busy: true, error: '' });
    try {
      await ATDevice.clearAllTriggers(slot);
      this.setState({ busy: false, error: '' });
    } catch (error) {
      console.warn(error);
      this.setState({ busy: false, error: L.translate('Could not clear triggers. // Trigger konnten nicht gelöscht werden.') });
    }
  }

  async reloadSlot(slot) {
    this.setState({ busy: true, error: '' });
    try {
      await ATDevice.reloadTriggersFromDevice(slot);
      this.setState({ busy: false, error: '' });
    } catch (error) {
      console.warn(error);
      this.setState({ busy: false, error: L.translate('Could not load triggers from device. // Trigger konnten nicht vom Gerät geladen werden.') });
    }
  }

  async copyTriggersToAllSlots(slot) {
    this.setState({ busy: true, error: '' });
    try {
      await ATDevice.copyConfigToAllSlots([C.AT_CMD_TRIGGER], slot, false);
      this.setState({ busy: false, error: '' });
    } catch (error) {
      console.warn(error);
      this.setState({ busy: false, error: L.translate('Could not copy triggers to all slots. // Trigger konnten nicht auf alle Slots kopiert werden.') });
    }
  }

    render() {
        let state = this.state;
        let slots = state.viewMode !== VIEW_MODE_SINGLE_SLOT ? ATDevice.getSlots(): [ATDevice.getCurrentSlot()];
        let slotElements = [{value: VIEW_MODE_SINGLE_SLOT, label: 'Current slot // Aktueller Slot'}, {value: VIEW_MODE_ALL_SLOTS_TABLE, label: 'All slots (table) // Alle Slots (Tabelle)'}, {value: VIEW_MODE_ALL_SLOTS_LIST, label: 'All slots (list) // Alle Slots (Liste)'}];

        return html`<div id="tabActions">
            <h2>${L.translate('Trigger configuration // Trigger-Konfiguration')}</h2>
            <div class="filter-buttons mb-3">
                ${html`<${RadioFieldset} legend="Show slots: // Zeige Slots:" onchange="${(value) => this.setViewMode(value)}" elements="${slotElements}" value="${state.viewMode}"/>`}
            </div>

            <div class="ta-error-msg ${state.error ? '' : 'd-none'}">${state.error}</div>

            ${slots.map(slot => {
                let triggers = ATDevice.getSlotTriggers(slot);
                return html`
                <div class="trigger-slot mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h3 class="${this.getSlotStyle(slot)}">${L.translate('Slot // Slot')} "${slot}"</h3>
                        <div>
                            <button class="small-button" disabled="${state.busy}" onclick="${() => this.reloadSlot(slot)}">${L.translate('Reload // Neu laden')}</button>
                            <button class="small-button" disabled="${state.busy}" onclick="${() => this.copyTriggersToAllSlots(slot)}">${L.translate('Copy to all slots // Auf alle Slots kopieren')}</button>
                            <button class="small-button" disabled="${state.busy || triggers.length === 0}" onclick="${() => this.clearAll(slot)}">${L.translate('Clear all // Alle löschen')}</button>
                        </div>
                    </div>

                    <div class="row table d-none d-md-block">
                        <div class="col-12">
                            <div class="row d-flex align-items-center" style="font-style: italic">
                                <div class="col-5">${L.translate('Trigger // Trigger')}</div>
                                <div class="col-5">${L.translate('Action // Aktion')}</div>
                                <div class="col-2"></div>
                            </div>
                        </div>
                    </div>

                    <div class="row mb-2">
                        <div class="col-12">
                            ${triggers.length === 0 ? html`
                                <div class="p-2" style="color: #666; font-style: italic;">
                                    ${L.translate('(no triggers configured) // (keine Trigger konfiguriert)')}
                                </div>
                            ` : ''}
                            ${triggers.map((trigger, index) => html`
                                <div class="row d-flex align-items-center p-1" style="background-color: ${index % 2 === 0 ? 'whitesmoke' : '#ffffff'}; border: 1px solid lightgray;">
                                    <div class="col-12 col-md-5 mb-1 mb-md-0">
                                        <span class="d-md-none" style="font-style: italic">${L.translate('Trigger: // Trigger:')}</span>
                                        <a href="#" onclick="${(e) => { e.preventDefault(); this.openEditTrigger(slot, trigger); }}">
                                            <strong>${trigger.listIndex || index + 1}.</strong> ${trigger.expression}
                                        </a>
                                    </div>
                                    <div class="col-12 col-md-5 mb-1 mb-md-0">
                                        <span class="d-md-none" style="font-style: italic">${L.translate('Action: // Aktion:')}</span>
                                        <a href="#" onclick="${(e) => { e.preventDefault(); this.openEditTrigger(slot, trigger); }}">
                                            ${this.getReadableTriggerAction(trigger.action)}
                                        </a>
                                    </div>
                                    <div class="col-12 col-md-2 text-md-right">
                                        <button onclick="${() => this.clearTrigger(slot, trigger)}" disabled="${state.busy}" class="p-1 mb-0" title="${L.translate('Delete trigger // Trigger löschen')}">
                                            ${html`<${FaIcon} icon="fas trash-alt"/>`}
                                        </button>
                                    </div>
                                </div>
                            `)}
                            <div class="row mt-2">
                                <div class="col-12">
                                    <a href="#" onclick="${(e) => { e.preventDefault(); this.openNewTrigger(slot); }}">
                                        ${html`<${FaIcon} icon="fas plus"/>`} ${L.translate('Add trigger // Trigger hinzufügen')}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            })}

            ${(state.editingTrigger !== null || state.isNewTrigger) ? html`
                <${TriggerEditModal}
                    trigger="${state.editingTrigger}"
                    slot="${state.editingSlot}"
                    buttonOptions="${this.getButtonOptions()}"
                    closeHandler="${(changed) => this.handleModalClose(changed)}"/>
            ` : ''}

            ${TabActions.style}
        </div>`;
    }
}

TabActions.style = html`<style>
    #tabActions .trigger-slot {
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 10px;
    }

    #tabActions .small-button {
        display: inline-block;
        padding: 0 10px !important;
        line-height: unset;
        width: unset;
        margin-left: 0.5em;
        text-transform: none;
    }

    #tabActions .ta-error-msg {
        color: #b00020;
        margin-bottom: 12px;
    }
</style>`

export { TabActions };