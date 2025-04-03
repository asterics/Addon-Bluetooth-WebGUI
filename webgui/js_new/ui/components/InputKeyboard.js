import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class InputKeyboard extends Component {

    constructor(props) {
        super();

        this.props = props;
        this.state = {
            currentValue: props.value,
            keycodeList: props.value ? props.value.split(' ') : [],
            selectedKey: C.KEYCODE_MAPPING[C.SUPPORTED_KEYCODES[0]]
        };
    }

    handleKeydown(event) {
        if (event.repeat) {
            event.preventDefault();
            return;
        }

        let keycode = event.keyCode || event.which;

        if (!C.KEYCODE_MAPPING[keycode]) {
            event.preventDefault();
        } else {
            let list = this.state.keycodeList;
            if (this.isLastListElemAndCurrent(C.JS_KEYCODE_TAB, keycode)) {
                // allow to tab forward or backward over the input field
                list.pop();
                if (list[list.length - 1] === C.KEYCODE_MAPPING[C.JS_KEYCODE_SHIFT]) {
                    list.pop();
                }
            } else if (this.isLastListElemAndCurrent(C.JS_KEYCODE_F5, keycode)) {
                window.location.reload();
            } else if (this.isLastListElemAndCurrent(C.JS_KEYCODE_BACKSPACE, keycode)) {
                event.preventDefault();
                list.pop();
                list.pop();
            } else {
                event.preventDefault();
                list.push(C.KEYCODE_MAPPING[keycode]);
            }

            this.rerenderList(list);
        }
    }

    rerenderList(list) {
        let value = list.join(' ');
        this.setState({
            keycodeList: list,
            currentValue: value
        });
        if (this.props.onchange) {
            this.props.onchange(value);
        }
    }

    isLastListElemAndCurrent(keycode, currentKeyCode) {
        let list = this.state.keycodeList;
        return currentKeyCode === keycode && list.length > 0 && list[list.length - 1] === C.KEYCODE_MAPPING[keycode];
    }

    render(props) {
        let state = this.state;
        return html`
            <div class="row">
                <label for="selectKeys" class="col-md-4">${L.translate('Add keys // Tasten hinzufügen')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-9 col-md-8">
                            <select class="col-12" id="selectKeys" onchange="${(event) => this.setState({selectedKey: event.target.value})}">
                                ${C.SUPPORTED_KEYCODES.map(keycode => html`<option value="${C.KEYCODE_MAPPING[keycode]}">${C.KEYCODE_MAPPING[keycode]}</option>`)}
                            </select>
                        </div>
                        <div class="col-3 col-md-4">
                            <button class="col-12" onclick="${() => this.rerenderList(state.keycodeList.concat([state.selectedKey]))}">
                                <span class="d-none d-md-block">${L.translate('Add // Hinzufügen')}</span>
                                <span class="d-md-none">+</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row ${C.IS_TOUCH_DEVICE ? 'd-none' : ''}">
                <label for="inputKeyboard" class="col-md-4">${L.translate('Insert keys // Eingabe Tasten')}</label>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-12 col-md-8">
                            <input id="inputKeyboard" class="col-12" type="text" value="${this.state.currentValue}" onkeydown="${(event) => this.handleKeydown(event)}" placeholder="${L.translate('Input keys with keyboard // Tasten mit Tastatur eingeben')}"/>
                        </div>
                        <div class="col-12 col-md-4">
                            <button class="col-12" onclick="${() => this.rerenderList([])}">${L.translate('Clear // Löschen')}</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row ${C.IS_TOUCH_DEVICE ? '' : 'd-none'}">
                <strong class="col-md-4">${L.translate('Selected keys // Ausgewählte Tasten')}</strong>
                <div class="col-md-8">
                    <div class="row">
                        <div class="col-12 col-md-8 mb-3">
                            <span>${state.currentValue || L.translate('(no keys selected) // (keine Tasten ausgewählt)')}</span>
                        </div>
                        <div class="col-12 col-md-4">
                            <button class="col-12" onclick="${() => this.rerenderList([])}">${L.translate('Clear // Löschen')}</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
    }
}

export {InputKeyboard};