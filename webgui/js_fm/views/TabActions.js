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
            showAllSlots: false,
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
        let allSlots = Object.keys(configs);
        let showSlots = state.showAllSlots ? Object.keys(configs) : [flip.getCurrentSlot()];
        let modalOpen = !!state.modalBtnMode;
        let showCategories = C.BTN_CATEGORIES.filter(cat => !state.showCategory || cat.constant === state.showCategory);
        if(modalOpen) {
            L.addClass('body', 'modal-open');
        } else {
            L.removeClass('body', 'modal-open');
        }

        return html`<div id="tabActions">
             <h2 data-i18n="">Action configuration // Konfiguration Aktionen</h2>
             <h3>Filter</h3>
             <div>
                <div data-i18n="">Show action categories: // Zeige Aktions-Kategorien:</div>
                ${C.BTN_CATEGORIES.map(category => html`<button data-i18n="" onclick="${() => this.setState({showCategory: category.constant})}" disabled="${state.showCategory === category.constant ? 'disabled' : ''}">${category.label}</button>`)}
                <button data-i18n="" onclick="${() => this.setState({showCategory: null})}" disabled="${!state.showCategory ? 'disabled' : ''}">All categories // Alle Kategorien</button>
             </div>
             ${(() => {
                if(allSlots.length > 1) {
                    return html`
                        <div>
                            <div data-i18n="">Show slots: // Zeige Slots:</div>
                            <button disabled="${state.showAllSlots ? 'disabled' : ''}" onclick="${() => this.setState({showAllSlots: true})}" data-i18n="">All Slots // Alle Slots</button>
                            <button disabled="${!state.showAllSlots ? 'disabled' : ''}" onclick="${() => this.setState({showAllSlots: false})}" data-i18n="">Only current Slot // Nur aktueller Slot</button>
                        </div>`;
                } else return '';
             })()}
             ${showCategories.map(category => html`
                 <h3 class="mt-5">${L.translate(category.label)}</h3>
                 <ul>
                    ${btnModes.filter(btnMode => btnMode.category === category.constant).map(btnMode => html`
                    <li>
                        <b>${L.translate(btnMode.label)}</b>
                        ${(() => {
                            if(showSlots.length === 1) {
                                return html`: <a href="javascript:;" onclick="${() => this.setState({modalBtnMode: btnMode})}">${L.getReadableATCMD(configs[showSlots[0]][btnMode.constant])}</a>`;
                            } else {
                                return html`
                                    <ul>
                                        ${showSlots.map(slot => html`<li><span>Slot "${slot}": <a href="javascript:;" onclick="${() => this.setState({modalBtnMode: btnMode})}">${L.getReadableATCMD(configs[slot][btnMode.constant])}</a></span></li>`)}
                                    </ul>`;
                            }
                        })()}
                    </li>`)}
                </ul>`
            )}
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
    #tabActions button {
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