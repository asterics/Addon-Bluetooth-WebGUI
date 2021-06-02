import { h, Component, render } from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js';


const html = htm.bind(h);
class TabGeneral extends Component {

    constructor() {
        super();

        TabGeneral.instance = this;
        this.state = {
        }
    }
    
    render() {
        let slots = flip.getSlots();

        return html`
        <h2 data-i18n="">General settings // Allgemeine Einstellungen</h2>
        <h3 data-i18n="">Usage via USB oder Bluetooth // Verwendung über USB oder Bluetooth</h3>
        <div class="container-fluid p-0">
            ${slots.map(slot => html`
                <div class="row">
                    <label class="col-md-4" for="${'devicemode' + slot}">${L.translate('Mode for Slot "{?}" // Modus für Slot "{?}"', slot)}</label>
                    <div class="col-md-6">
                        <select class="col-12" id="${'devicemode' + slot}" onchange="${(event) => flip.setDeviceMode(event.target.value, slot)}">
                            <option value="1">USB</option>
                            <option value="2">Bluetooth</option>
                            <option value="3">USB + Bluetooth</option>
                        </select>
                    </div>
                    
                </div>
            `)}
        </div>
        <h2 data-i18n="">Update // Aktualisierung</h2>
        `;
    }
}

TabGeneral.init = function () {
    render(html`<${TabGeneral}/>`, document.getElementById('viewContainer'));
};

TabGeneral.destroy = function () {
    render(null, document.getElementById('viewContainer'));
}

export {TabGeneral};