import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
const html = htm.bind(h);

class SlotsSelector extends Component {
    constructor(props) {
        super();

        props.onchange = props.onchange || (() => {});
        this.props = props;
        this.state = {
            slots: ATDevice.getSlots(),
            slotsSelected: ATDevice.getSlots().map(slot => true)
        }
    }

    selectionChanged(index, selected) {
        this.state.slotsSelected[index] = selected;
        this.emitChange();
    }

    selectAll() {
        this.state.slotsSelected = this.state.slotsSelected.map(current => true);
        this.setState({
            slotsSelected: this.state.slotsSelected
        })
        this.emitChange();
    }

    invertSelection() {
        this.state.slotsSelected = this.state.slotsSelected.map(current => !current);
        this.setState({
            slotsSelected: this.state.slotsSelected
        })
        this.emitChange();
    }

    selectAlternative() {
        this.state.slotsSelected = this.state.slots.map(slot => parseInt(ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE, slot)) === C.FLIPMOUSE_MODE_ALT.value);
        this.setState({
            slotsSelected: this.state.slotsSelected
        })
        this.emitChange();
    }

    emitChange() {
        let selectedSlots = this.state.slots.filter((slot, index) => this.state.slotsSelected[index]);
        this.props.onchange(selectedSlots);
    }

    render(props) {
        return html`
            <div class="slots-selector ${this.state.slots.length < 2 ? 'd-none' : ''}" style="margin-top: 5em">
                <h3>${L.translate('Select affected slots // Slot-Auswahl für Einstellungen')}</h3>
                <strong>Info: </strong>
                <span>${L.translate("By default the settings on this page are applied to all slots. It's possible to change the slots the settings are applied to here. // Standardmäßig werden die Einstellungen auf dieser Seite auf alle Slots angewendet. Es ist möglich die Slots, auf welche die Einstellungen angewendet werden, hier anzupassen.")}</span>
                <fieldset class="mt-4">
                    <legend>${L.translate('Select slots the settings of this page are applied to: // Wähle Slots aus, für welche Einstellungen dieser Seite angewendet werden sollen:')}</legend>
                    ${this.state.slots.map((slot, index) => html`
                        <div>
                            <input id="${slot}" type="checkbox" checked="${this.state.slotsSelected[index]}" onchange="${(event) => this.selectionChanged(index, event.target.checked)}" class="mx-3"/>
                            <label for="${slot}">${slot}</label>
                        </div>
                    `)}
                </fieldset>
                <div class="mt-3">
                    <button onclick="${() => this.selectAll()}">${L.translate('Select all // Alle auswählen')}</button>
                    <button onclick="${() => this.invertSelection()}">${L.translate('Invert selection // Auswahl invertieren')}</button>
                    <button class="${C.DEVICE_IS_FM ? '' : 'd-none'}" onclick="${() => this.selectAlternative()}">${L.translate('Select slots with alternative stick actions // Wähle Slots mit alternativen Stick-Aktionen')}</button>
                </div>
            </div>
            ${SlotsSelector.style}`;
    }
}

SlotsSelector.style = html`<style>
    .slots-selector button {
        display: inline-block;
        padding: 0 5px !important;
        line-height: unset;
        width: unset;
        margin: 0.5em 0.5em 0.5em 0;
        text-transform: none;
    }
</style>`

export {SlotsSelector};