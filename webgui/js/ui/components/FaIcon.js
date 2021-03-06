import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class FaIcon extends Component {

    render(props) {
        props.icon = props.icon || '';
        let folder = props.icon.split(' ')[0];
        let icon = props.icon.split(' ')[1];
        let path = `./lib/fa-svgs/${folder}/${icon}.svg`;
        if (!this.props.icon) {
            return '';
        }
        return html`<img src="${path}" aria-hidden="true"
                         style="display: inline-block; height: 1.2em; margin: 0 0.5em; vertical-align: middle; ${this.props.invert ? 'filter: invert(1);' : ''}"/>`;
    }
}

export {FaIcon};