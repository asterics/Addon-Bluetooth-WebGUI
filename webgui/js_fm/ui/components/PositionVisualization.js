import { h, Component, render } from '../../../js/preact.min.js';
import htm from '../../../js/htm.min.js';
import {styleUtil} from '../../util/styleUtil.js';
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FLipMouse} from "../../communication/FLipMouse.js";

const html = htm.bind(h);

class PositionVisualization extends Component {

    constructor(props) {
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

        if (props.mode === 'tabStick') {
            this.setState({
                showAnalogBars: false,
                showAnalogValues: true,
                showOrientation: true,
                showDeadzone: true,
                showMaxPos: true,
                circleRadius: 10
            });
        }
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

    updateData(data) {
        let x = data[FLipMouse.LIVE_MOV_X];
        let y = data[FLipMouse.LIVE_MOV_Y];
        let maxX = data[FLipMouse.LIVE_MOV_X_MAX];
        let maxY = data[FLipMouse.LIVE_MOV_Y_MAX];
        let minX = data[FLipMouse.LIVE_MOV_X_MIN];
        let minY = data[FLipMouse.LIVE_MOV_Y_MIN];
        let deadX = ATDevice.getConfig(C.AT_CMD_DEADZONE_X);
        let deadY = ATDevice.getConfig(C.AT_CMD_DEADZONE_Y);
        this.state.maxPos = this.state.maxPosManual !== undefined ? this.state.maxPosManual : Math.max(maxX, maxY, Math.abs(minX), Math.abs(minY), Math.round(deadX * 1.1), Math.round(deadY * 1.1), this.state.maxPos);
        let percentageX = L.limitValue(L.getPercentage(x, -this.state.maxPos, this.state.maxPos), 0, 100);
        let percentageY = L.limitValue(L.getPercentage(y, -this.state.maxPos, this.state.maxPos), 0, 100);

        this.setState({
            liveData: data,
            pX: percentageX,
            pY: percentageY,
            pDzX: (L.getPercentage(ATDevice.getConfig(C.AT_CMD_DEADZONE_X), 0, this.state.maxPos)),
            pDzY: (L.getPercentage(ATDevice.getConfig(C.AT_CMD_DEADZONE_Y), 0, this.state.maxPos)),
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
                            <div id="orientationSign" class="back-layer full-height full-width" style="transform: rotate(${(ATDevice.getConfig(C.AT_CMD_ORIENTATION_ANGLE))%360}deg);">
                                <div class="back-layer" style="top:100%; left: 35%; width: 30%; height: 10%; background-color: black; z-index: 2"></div>
                            </div>
                        </div>
                        <div style="display: ${this.state.showDeadzone ? 'block' : 'none'}">
                            <div id="deadZonePos" class="back-layer ${state.inDeadzone ? 'color-lightcyan' : 'color-lightercyan'}"
                                 style="top: ${(100 - this.state.pDzY) / 2}%; left: ${(100 - this.state.pDzX) / 2}%; height: ${this.state.pDzY}%; width: ${this.state.pDzX}%;"></div>
                        </div>
                        <div style="display: ${this.state.showAnalogBars ? 'block' : 'none'}">
                            <div id="upPos" class="back-layer color-lightred"
                                 style="top: ${(50 - (data[FLipMouse.LIVE_UP] / 1024 * 100) / 2)}%; left: 48%; height: ${(data[FLipMouse.LIVE_UP] / 1024 * 100) / 2}%; width: 4%;"></div>
                            <div id="downPos" class="back-layer color-lightred"
                                 style="top: 50%; left: 48%; height: ${(data[FLipMouse.LIVE_DOWN] / 1024 * 100) / 2}%; width: 4%;"></div>
                            <div id="leftPos" class="back-layer color-lightred"
                                 style="top: 48%; left: ${(50 - (data[FLipMouse.LIVE_LEFT] / 1024 * 100) / 2)}%; height: 4%; width: ${(data[FLipMouse.LIVE_LEFT] / 1024 * 100) / 2}%;"></div>
                            <div id="rightPos" class="back-layer color-lightred"
                                 style="top: 48%; left: 50%; height: 4%; width: ${(data[FLipMouse.LIVE_RIGHT] / 1024 * 100) / 2}%;"></div>
                        </div>
                        <div class="back-layer"
                             style="left: 50%; height: 100%; border-right-style: solid; border-right-width: thin;"></div>
                        <div class="back-layer"
                             style="top: 50%; width: 100%; border-bottom-style: solid; border-bottom-width: thin;"></div>
                        <div style="display: ${this.state.showAnalogValues ? 'block' : 'none'}">
                            <div id="upPosVal" class="back-layer" style="top: 0%; left: 52%">${data[FLipMouse.LIVE_UP]}</div>
                            <div id="downPosVal" class="back-layer" style="top: 90%; left: 52%">${data[FLipMouse.LIVE_DOWN]}</div>
                            <div id="leftPosVal" class="back-layer" style="top: 38%; left: 1%;">${data[FLipMouse.LIVE_LEFT]}</div>
                            <div id="rightPosVal" class="back-layer" style="top: 38%; left: 88%">${data[FLipMouse.LIVE_RIGHT]}</div>
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