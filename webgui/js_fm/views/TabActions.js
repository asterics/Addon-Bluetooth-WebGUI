import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {ActionEditModal} from "../modals/ActionEditModal.js";
import {RadioFieldset} from "../comp/RadioFieldset.js";


const html = htm.bind(h);
class TabActions extends Component {

    constructor() {
        super();

        TabActions.instance = this;
        this.state = {
            showCategory: null,
            modalBtnMode: null
        }
    }

    componentWillUnmount() {
        L.removeClass('body', 'modal-open');
    }

    componentDidUpdate() {
        domI18nInstance.changeLanguage();
    }

    getLinkTitle(btnMode, slot) {
        let modeValue = flip.getConfig(flip.FLIPMOUSE_MODE);
        if (modeValue !== C.FLIPMOUSE_MODE_ALT.value && btnMode.category === C.BTN_CAT_STICK) {
            return L.translate(btnMode.label);
        } else {
            return L.translate(btnMode.label) + (flip.getConfig(btnMode.constant, slot) ? ': ' + flip.getConfig(btnMode.constant, slot) : '');
        }
    }

    getLinkLabel(btnMode, slot) {
        let modeValue = flip.getConfig(flip.FLIPMOUSE_MODE);
        if (modeValue !== C.FLIPMOUSE_MODE_ALT.value && btnMode.category === C.BTN_CAT_STICK) {
            let mode = C.FLIPMOUSE_MODES.filter(mode => mode.value === modeValue)[0];
            return L.translate(mode.label);
        } else {
            return L.getReadableATCMD(flip.getConfig(btnMode.constant, slot));
        }
    }
    
    render() {
        let state = this.state;
        let configs = flip.getAllSlotConfigs();
        configs['slot2'] = configs['mouse'];
        let btnModes = C.BTN_MODES2.filter(mode => !this.state.showCategory || mode.category === this.state.showCategory);
        let modalOpen = !!state.modalBtnMode;
        if(modalOpen) {
            L.addClass('body', 'modal-open');
        } else {
            L.removeClass('body', 'modal-open');
        }
        let categoryElements = C.BTN_CATEGORIES.map(cat => {return {value: cat.constant, label: cat.label}});
        categoryElements = [{value: null, label: 'All categories // Alle Kategorien'}].concat(categoryElements);

        return html`<div id="tabActions">
             <h2 data-i18n="">Action configuration // Konfiguration Aktionen</h2>
             <div class="d-md-none filter-buttons mb-3">
                ${html`<${RadioFieldset} legend="Show categories: // Zeige Kategorien:" onchange="${(value) => this.setState({showCategory: value})}" elements="${categoryElements}" value="${state.showCategory}"/>`}
             </div>
             
             <ul>
                <li class="row d-none d-md-flex" aria-hidden="true" style="font-style: italic">
                    <span class="col-12 col-md">Bezeichnung</span>
                    ${Object.keys(configs).map(slot => html`<span class="col-12 col-md">Slot "${slot}"</span>`)}
                </li>
                ${btnModes.filter(btnMode => !state.showCategory || btnMode.category === state.showCategory).map((btnMode, index) => html`
                    <li class="row py-3 py-md-0" style="${index % 2 === 1 ? 'background-color: lightgray' : ''}">
                        <b class="col-12 col-md">${L.translate(btnMode.label)}</b>
                        ${Object.keys(configs).map(slot => html`
                            <span class="col-12 col-md">
                                <span class="d-md-none">Slot "${slot}": </span>
                                <a href="javascript:;" title="${this.getLinkTitle(btnMode, slot)}" onclick="${() => this.setState({modalBtnMode: btnMode})}">${this.getLinkLabel(btnMode, slot)}</a>
                            </span>
                        `)}
                    </li>`)}
            </ul>
            ${modalOpen ? html`<${ActionEditModal} buttonMode="${state.modalBtnMode}" closeHandler="${() => this.setState({modalBtnMode: ''})}"/>` : ''}
            ${TabActions.style}
        </div>`;
    }
}

TabActions.init = function () {
    render(html`<${TabActions}/>`, document.getElementById('viewContainer'));
};

TabActions.destroy = function () {
    render(null, document.getElementById('viewContainer'));
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