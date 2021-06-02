import { h, Component, render } from '../../js/preact.min.js';
import htm from '../../js/htm.min.js';
import {styleUtil} from '../styleUtil.js'
const html = htm.bind(h);

class PositionVisualization extends Component {

    constructor() {
        super();

        PositionVisualization.instance = this;
        this.stateListener = null;
        this.state = {
            liveData: {},
            pX: 50,
            pY: 50,
            pDzX: 0,
            pDzY: 0,
            showAnalogBars: false,
            showAnalogValues: false,
            showOrientation: false,
            showDeadzone: false,
            showMaxPos: false,
            circleRadius: 20,
            maxPos: 100,
            maxPosManual: undefined
        };
    }

    componentWillUnmount() {
        this.stateListener = null;
        if (PositionVisualization.instance === this) {
            PositionVisualization.instance = null;
        }
    }

    updateState(options) {
        this.setState(options);
    }

    setStateListener(fn) {
        this.stateListener = fn;
    }

    prepareForTabStick() {
        this.setState({
            showAnalogBars: false,
            showAnalogValues: true,
            showOrientation: true,
            showDeadzone: true,
            showMaxPos: true,
            circleRadius: 10
        });
    }

    updateData(data) {
        let x = data[flip.LIVE_MOV_X];
        let y = data[flip.LIVE_MOV_Y];
        let maxX = data[flip.LIVE_MOV_X_MAX];
        let maxY = data[flip.LIVE_MOV_Y_MAX];
        let minX = data[flip.LIVE_MOV_X_MIN];
        let minY = data[flip.LIVE_MOV_Y_MIN];
        let deadX = flip.getConfig(flip.DEADZONE_X);
        let deadY = flip.getConfig(flip.DEADZONE_Y);
        this.state.maxPos = this.state.maxPosManual !== undefined ? this.state.maxPosManual : Math.max(maxX, maxY, Math.abs(minX), Math.abs(minY), Math.round(deadX * 1.1), Math.round(deadY * 1.1), this.state.maxPos);
        let percentageX = L.limitValue(L.getPercentage(x, -this.state.maxPos, this.state.maxPos), 0, 100);
        let percentageY = L.limitValue(L.getPercentage(y, -this.state.maxPos, this.state.maxPos), 0, 100);

        this.setState({
            liveData: data,
            pX: percentageX,
            pY: percentageY,
            pDzX: (L.getPercentage(flip.getConfig(flip.DEADZONE_X), 0, this.state.maxPos)),
            pDzY: (L.getPercentage(flip.getConfig(flip.DEADZONE_Y), 0, this.state.maxPos)),
            inDeadzone: x < deadX && x > -deadX && y < deadY && y > -deadY
        });
    }

    render() {
        if (this.stateListener) {
            this.stateListener(this.state);
        }
        let state = this.state;
        let data = this.state.liveData;
        return html`<div id="posVis" aria-hidden="true">
                    <div class="relative center-div cursorPosWrapper">
                        <div style="display: ${this.state.showOrientation ? 'block' : 'none'}">
                            <div id="orientationSign" class="back-layer full-height full-width" style="transform: rotate(${(flip.getConfig(flip.ORIENTATION_ANGLE)+90)%360}deg);">
                                <div class="back-layer" style="top:100%; left: 35%; width: 30%; height: 10%; background-color: black; z-index: 2"></div>
                            </div>
                        </div>
                        <div style="display: ${this.state.showDeadzone ? 'block' : 'none'}">
                            <div id="deadZonePos" class="back-layer ${state.inDeadzone ? 'color-lightcyan' : 'color-lightercyan'}"
                                 style="top: ${(100 - this.state.pDzY) / 2}%; left: ${(100 - this.state.pDzX) / 2}%; height: ${this.state.pDzY}%; width: ${this.state.pDzX}%;"></div>
                        </div>
                        <div style="display: ${this.state.showAnalogBars ? 'block' : 'none'}">
                            <div id="upPos" class="back-layer color-lightred"
                                 style="top: ${(50 - (data[flip.LIVE_UP] / 1024 * 100) / 2)}%; left: 48%; height: ${(data[flip.LIVE_UP] / 1024 * 100) / 2}%; width: 4%;"></div>
                            <div id="downPos" class="back-layer color-lightred"
                                 style="top: 50%; left: 48%; height: ${(data[flip.LIVE_DOWN] / 1024 * 100) / 2}%; width: 4%;"></div>
                            <div id="leftPos" class="back-layer color-lightred"
                                 style="top: 48%; left: ${(50 - (data[flip.LIVE_LEFT] / 1024 * 100) / 2)}%; height: 4%; width: ${(data[flip.LIVE_LEFT] / 1024 * 100) / 2}%;"></div>
                            <div id="rightPos" class="back-layer color-lightred"
                                 style="top: 48%; left: 50%; height: 4%; width: ${(data[flip.LIVE_RIGHT] / 1024 * 100) / 2}%;"></div>
                        </div>
                        <div class="back-layer"
                             style="left: 50%; height: 100%; border-right-style: solid; border-right-width: thin;"></div>
                        <div class="back-layer"
                             style="top: 50%; width: 100%; border-bottom-style: solid; border-bottom-width: thin;"></div>
                        <div style="display: ${this.state.showAnalogValues ? 'block' : 'none'}">
                            <div id="upPosVal" class="back-layer" style="top: 0%; left: 52%">${data[flip.LIVE_UP]}</div>
                            <div id="downPosVal" class="back-layer" style="top: 90%; left: 52%">${data[flip.LIVE_DOWN]}</div>
                            <div id="leftPosVal" class="back-layer" style="top: 38%; left: 1%;">${data[flip.LIVE_LEFT]}</div>
                            <div id="rightPosVal" class="back-layer" style="top: 38%; left: 88%">${data[flip.LIVE_RIGHT]}</div>
                        </div>
                        <div style="display: ${this.state.showMaxPos ? 'block' : 'none'}">
                            <div id="cursorPosVal" class="back-layer" style="top: 90%; left: 2%;">${this.state.maxPos}</div>
                        </div>
                        <div id="cursorPos" class="back-layer" style="top: ${this.state.pY}%; left: ${this.state.pX}%;">
                            <div class="back-layer circle" style="${styleUtil.getCircleStyle(this.state.circleRadius)}"></div>
                        </div>
                    </div>
                </div>`;
    }
}

export {PositionVisualization};