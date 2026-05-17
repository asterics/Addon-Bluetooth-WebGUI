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
      viewMode: localStorageService.hasKey(KEY_TAB_ACTIONS_VIEW_MODE) ? localStorageService.get(KEY_TAB_ACTIONS_VIEW_MODE) : VIEW_MODE_SINGLE_SLOT,
      editModal: null,
      busy: false,
      error: '',
      widthEm: window.innerWidth / parseFloat(getComputedStyle(document.querySelector('body'))['font-size'])
    };
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

  getReadableActionLabel(action) {
    let label = L.getReadableATCMD(action || C.AT_CMD_NO_CMD);
    let normalized = (action || '').trim();
    if (!normalized) return label;
    if (normalized.toUpperCase().indexOf('AT ') !== 0) {
      normalized = 'AT ' + normalized;
    }
    let suffix = normalized.substring(C.LENGTH_AT_CMD_PREFIX - 1).trim();
    return suffix ? `${label} (${suffix})` : label;
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

  openEditModal(slot, trigger, index) {
    L.addClass('body', 'modal-open');
    this.setState({ editModal: { slot, trigger, index } });
  }

  openNewTriggerModal(slot) {
    L.addClass('body', 'modal-open');
    this.setState({ editModal: { slot, trigger: null, index: null } });
  }

  closeModal() {
    L.removeClass('body', 'modal-open');
    this.setState({ editModal: null });
  }

  normalizeAction(a) {
    a = (a || '').trim().toUpperCase();
    return a.startsWith('AT ') ? a.substring(3).trim() : a;
  }

  async resolveAndClear(slot, trigger) {
    let freshTriggers = await ATDevice.reloadTriggersFromDevice(slot);
    let toDelete = freshTriggers.find(t =>
      (t.expression || '').trim().toLowerCase() === (trigger.expression || '').trim().toLowerCase() &&
      this.normalizeAction(t.action) === this.normalizeAction(trigger.action)
    );
    await ATDevice.clearTrigger(toDelete || trigger, slot);
  }

  async handleSave(slot, expression, action, oldTrigger) {
    this.setState({ busy: true, error: '' });
    try {
      if (oldTrigger) {
        await this.resolveAndClear(slot, oldTrigger);
      }
      await ATDevice.addTrigger(expression, action, slot);
      await ATDevice.reloadTriggersFromDevice(slot);
      L.removeClass('body', 'modal-open');
      this.setState({ editModal: null, busy: false, error: '' });
    } catch (error) {
      console.warn(error);
      this.setState({ busy: false, error: L.translate('Could not save trigger. Check syntax and device response. // Trigger konnte nicht gespeichert werden. Syntax und Geräteantwort prüfen.') });
    }
  }

  async clearTrigger(slot, trigger) {
    this.setState({ busy: true, error: '' });
    try {
      await this.resolveAndClear(slot, trigger);
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
        let buttonOptions = this.getButtonOptions();

        return html`<div id="tabActions">
             <h2>${L.translate('Trigger configuration // Trigger-Konfiguration')}</h2>
            <div class="filter-buttons mb-3">
                ${html`<${RadioFieldset} legend="Show slots: // Zeige Slots:" onchange="${(value) => this.setViewMode(value)}" elements="${slotElements}" value="${state.viewMode}"/>`}
            </div>

            <div class="error-message ${state.error ? '' : 'd-none'}">${state.error}</div>

            ${state.editModal ? html`<${TriggerEditModal}
                slot="${state.editModal.slot}"
                trigger="${state.editModal.trigger}"
                buttonOptions="${buttonOptions}"
                busy="${state.busy}"
                onSave="${(expression, action) => this.handleSave(state.editModal.slot, expression, action, state.editModal.trigger)}"
                closeHandler="${() => this.closeModal()}"/>` : ''}

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

                    <div class="row d-none d-md-block mb-1">
                        <div class="col-12 col-lg-10">
                            <div class="row d-flex align-items-center" style="font-style: italic">
                                <div class="col-md-1">#</div>
                                <div class="col-md-4">${L.translate('Trigger // Trigger')}</div>
                                <div class="col-md-5">${L.translate('Action // Aktion')}</div>
                                <div class="col-md-2"></div>
                            </div>
                        </div>
                    </div>

                    <ol class="trigger-list col-12 col-lg-10 px-0">
                        ${triggers.length === 0 ? html`
                            <li class="p-2" style="border: 1px solid lightgray; background-color: whitesmoke; font-style: italic; color: #666;">
                                ${L.translate('(no triggers configured) // (keine Trigger konfiguriert)')}
                            </li>` : ''}
                        ${triggers.map((trigger, index) => html`
                            <li class="p-2" style="${index % 2 === 0 ? 'background-color: whitesmoke' : ''}; border: 1px solid lightgray;">
                                <div class="row d-flex align-items-center">
                                    <div class="col-12 col-md-1 mb-1 mb-md-0">
                                        <span class="d-md-none font-weight-bold"># </span>
                                        <span>${trigger.listIndex || index + 1}</span>
                                    </div>
                                    <div class="col-12 col-md-4 mb-1 mb-md-0">
                                        <span class="d-md-none font-weight-bold">${L.translate('Trigger: // Trigger:')} </span>
                                        <a href="javascript:;"
                                           onclick="${() => this.openEditModal(slot, trigger, index + 1)}"
                                           title="${L.translate('Edit trigger // Trigger bearbeiten')}">
                                            ${trigger.expression}
                                        </a>
                                    </div>
                                    <div class="col-12 col-md-5 mb-1 mb-md-0">
                                        <span class="d-md-none font-weight-bold">${L.translate('Action: // Aktion:')} </span>
                                        <a href="javascript:;"
                                           onclick="${() => this.openEditModal(slot, trigger, index + 1)}"
                                           title="${L.translate('Edit action // Aktion bearbeiten')}">
                                            ${this.getReadableActionLabel(trigger.action)}
                                        </a>
                                    </div>
                                    <div class="col-12 col-md-2 d-flex">
                                        <button onclick="${() => this.clearTrigger(slot, trigger)}"
                                                disabled="${state.busy}"
                                                class="p-1 p-md-0 mx-1 mb-0"
                                                title="${L.translate('Delete trigger // Trigger löschen')}">
                                            ${html`<${FaIcon} icon="fas trash-alt"/>`}
                                        </button>
                                    </div>
                                </div>
                            </li>
                        `)}
                        <li class="p-2" style="border: 1px solid lightgray; background-color: #f0f8ff;">
                            <button onclick="${() => this.openNewTriggerModal(slot)}"
                                    disabled="${state.busy}"
                                    class="p-1 p-md-0 mb-0"
                                    title="${L.translate('Add new trigger // Neuen Trigger hinzufügen')}">
                                ${html`<${FaIcon} icon="fas plus-circle"/>`}
                                <span>${L.translate('Add trigger // Trigger hinzufügen')}</span>
                            </button>
                        </li>
                    </ol>
                </div>
              `;
            })}

            ${TabActions.style}
        </div>`;
    }
}

TabActions.style = html`<style>
    #tabActions ol.trigger-list {
        list-style-type: none;
        padding-left: 0;
        margin-bottom: 0;
    }

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

    #tabActions .error-message {
        color: #b00020;
        margin-bottom: 12px;
    }
</style>`

export { TabActions };