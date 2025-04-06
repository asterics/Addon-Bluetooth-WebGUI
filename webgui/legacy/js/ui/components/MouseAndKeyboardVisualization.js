import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';

const html = htm.bind(h);

class MouseAndKeyboardVisualization extends Component {

    constructor() {
        super();

        MouseAndKeyboardVisualization.instance = this;
        this.stateListener = null;
        this.state = {
            pressedMouseButtons: [],
            pressedKeys: [],
            pressedKeyCodes: []
        };

        document.addEventListener('mousedown', this.handleMousePress);
        document.addEventListener('mouseup', this.handleMouseRelease);
        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('keyup', this.handleKeyRelease);
    }

    handleKeyPress(event) {
        let thiz = MouseAndKeyboardVisualization.instance;
        thiz.setState({
            pressedKeys: [...new Set(thiz.state.pressedKeys.concat([event.code]))],
            pressedKeyCodes: [...new Set(thiz.state.pressedKeyCodes.concat([event.which]))]
        });
    }

    handleKeyRelease(event) {
        let thiz = MouseAndKeyboardVisualization.instance;
        thiz.setState({
            pressedKeys: thiz.state.pressedKeys.filter(e => e !== event.code),
            pressedKeyCodes: thiz.state.pressedKeyCodes.filter(e => e !== event.which)
        });
    }

    handleMousePress(event) {
        let thiz = MouseAndKeyboardVisualization.instance;
        thiz.setState({
            pressedMouseButtons: thiz.state.pressedMouseButtons.concat([event.which])
        });
    }

    handleMouseRelease(event) {
        let thiz = MouseAndKeyboardVisualization.instance;
        if (event.which !== 1) {
            event.preventDefault();
        }
        thiz.setState({
            pressedMouseButtons: thiz.state.pressedMouseButtons.filter(e => e !== event.which)
        });
    }

    componentWillUnmount() {
        if (MouseAndKeyboardVisualization.instance === this) {
            MouseAndKeyboardVisualization.instance = null;
        }
        document.removeEventListener('mousedown', this.handleMousePress);
        document.removeEventListener('mouseup', this.handleMouseRelease);
        document.removeEventListener('keydown', this.handleKeyPress);
        document.removeEventListener('keyup', this.handleKeyRelease);
    }

    updateState(options) {
        this.setState(options);
    }

    render() {
        let state = this.state;

        return html`
            <div class="mouseKeyVisualization">
                <div>
                    <b class="mr-2">${L.translate('Keyboard keys: // Tasten auf Tastatur:')}</b>
                    <span class=" ${state.pressedKeys.length > 0 ? 'd-none' : ''}">${L.translate("(none) // (keine)")}</span>
                    ${state.pressedKeys.map((keyCode, index) => {
                        let atKeycode = C.KEYCODE_MAPPING[state.pressedKeyCodes[index]];
                        return html`
                            <span class="mr-2 keyboard ${atKeycode ? 'd-none' : ''}">${keyCode}</span>
                            <span class="mr-2 keyboard ${atKeycode ? '' : 'd-none'}">${atKeycode}</span>
                        `
                    })}
                </div>
                <div class="mt-5">
                    <b class="mr-2">${L.translate('Mouse buttons: // Maustasten:')}</b>
                    <span class="mr-2 mouse ${state.pressedMouseButtons.includes(1) ? 'pressed' : ''}">${L.translate("Left // Links")}</span>
                    <span class="mr-2 mouse ${state.pressedMouseButtons.includes(2) ? 'pressed' : ''}">${L.translate("Middle // Mitte")}</span>
                    <span class="mr-2 mouse ${state.pressedMouseButtons.includes(3) ? 'pressed' : ''}">${L.translate("Right // Rechts")}</span>
                </div>
            </div>
            <style>
                .mouseKeyVisualization .keyboard {
                    padding: 10px;
                    border: 1px solid;
                    border-radius: 4px;
                }

                .mouseKeyVisualization .mouse {  
                    padding: 10px;
                    border: 1px solid;
                    border-radius: 4px;
                }

                .mouseKeyVisualization .mouse.pressed {
                    background-color: #fdfda5;
                    font-weight: bold;
                }
            </style>`;
    }
}

export {MouseAndKeyboardVisualization};