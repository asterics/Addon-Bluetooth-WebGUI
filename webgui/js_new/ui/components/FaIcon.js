import { h, Component } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
const html = htm.bind(h);

class FaIcon extends Component {

    render(props) {
        props.icon = props.icon || '';
        let folder = props.icon.split(' ')[0];
        let icon = props.icon.split(' ')[1];
        let height = props.height || '1.2em'; // 1.2em will be used if pros does not have a value. 
        let clasz = props.class || '';
        let path = `./lib/fa-svgs/${folder}/${icon}.svg`;

        if (!this.props.icon) {
            return '';
        }
        return html`<img class="${clasz}" src="${path}" aria-hidden="true" style="${`display: inline-block; height: ${height}; margin: 0 0.5em; vertical-align: middle;`} ${this.props.invert ? 'filter: invert(1);' : ''}"/>`;

        /* This makes it so that the symbols are inverted. ASK: Is it better with or without this. The one above does not work. */
        /* return html` 
        <object type="image/svg+xml" data="${path}" aria-hidden="true" class="${clasz}" style="height: ${height}; margin: 0 0.5em; vertical-align: middle;">
            ${props.invert ? '<param name="filter" value="invert(80%)">' : ''}
        </object>
        `;*/
    }
}

export { FaIcon };