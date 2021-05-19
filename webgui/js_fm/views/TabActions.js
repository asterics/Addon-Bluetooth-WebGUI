import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {ActionEditModal} from "../modals/ActionEditModal.js";

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

        return html`<div id="tabActions">
             <h2 data-i18n="">Action configuration // Konfiguration Aktionen</h2>
             <div class="d-md-none filter-buttons mb-3">
                <h3>Filter</h3>
                <div data-i18n="">Show categories: // Zeige Kategorien:</div>
                ${C.BTN_CATEGORIES.map(category => html`<button data-i18n="" onclick="${() => this.setState({showCategory: category.constant})}" disabled="${state.showCategory === category.constant ? 'disabled' : ''}">${category.label}</button>`)}
                <button data-i18n="" onclick="${() => this.setState({showCategory: null})}" disabled="${!state.showCategory ? 'disabled' : ''}">All categories // Alle Kategorien</button>
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
                                <a href="javascript:;" title="${L.translate(btnMode.label) + (configs[slot][btnMode.constant] ? ': ' + configs[slot][btnMode.constant] : '')}" onclick="${() => this.setState({modalBtnMode: btnMode})}">${L.getReadableATCMD(configs[slot][btnMode.constant])}</a>
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
    #tabActions .filter-buttons button {
        display: inline-block;
        padding: 0 5px !important;
        line-height: unset;
        width: unset;
        margin: 0.5em 0.5em 0.5em 0;
        text-transform: none;
    }
    
    #tabActions ul {
        list-style-type: none;
    }
    
    #tabActions ul li a {
        white-space: nowrap;
    }
</style>`

export {TabActions};