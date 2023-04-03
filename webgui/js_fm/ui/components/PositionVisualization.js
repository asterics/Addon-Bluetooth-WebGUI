import { h, Component, createRef } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {styleUtil} from '../../../js/util/styleUtil.js';
import {ATDevice} from "../../../js/communication/ATDevice.js";
import {FaIcon} from "../../../js/ui/components/FaIcon.js";
import {localStorageService} from "../../../js/localStorageService.js";

const html = htm.bind(h);

const KEY_POS_VIS_MAX_POS_ZOOM = 'KEY_POS_VIS_MAX_POS_ZOOM';
class PositionVisualization extends Component {

    canvasRef = createRef();
    posVisRef = createRef();

    constructor(props) {
        super();

        /*
        possible props (default values):
        showAnalogBars (false), showAnalogValues (false), showOrientation (false), showDeadzone (false), showMaxPos (false), circleRadius (20), maxPosManual (undefined), showZoom (false)
         */

        this.props = props;
        PositionVisualization.instance = this;
        this.stateListener = null;
        this.state = {
            liveData: {},
            pX: 50,
            pY: 50,
            pDzX: 0,
            pDzY: 0,
            maxPos: 50,
            maxPosZoom: localStorageService.hasKey(KEY_POS_VIS_MAX_POS_ZOOM) ? localStorageService.get(KEY_POS_VIS_MAX_POS_ZOOM) : 50
        };
    }

    getValue(value, defaultValue) {
        return value !== undefined ? value : defaultValue;
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

    getMaxPosManual() {
        if (this.props.showZoom) {
            return this.state.maxPosZoom;
        }
        return this.props.maxPosManual;
    }

    updateData(data) {
        let x = data[ATDevice.Specific.LIVE_MOV_X];
        let y = data[ATDevice.Specific.LIVE_MOV_Y];
        let maxX = data[ATDevice.Specific.LIVE_MOV_X_MAX];
        let maxY = data[ATDevice.Specific.LIVE_MOV_Y_MAX];
        let minX = data[ATDevice.Specific.LIVE_MOV_X_MIN];
        let minY = data[ATDevice.Specific.LIVE_MOV_Y_MIN];
        let deadX = ATDevice.getConfig(C.AT_CMD_DEADZONE_X);
        let deadY = ATDevice.getConfig(C.AT_CMD_DEADZONE_Y);
        let pDzX = (L.getPercentage(ATDevice.getConfig(C.AT_CMD_DEADZONE_X), 0, this.state.maxPos));
        let pDzY = (L.getPercentage(ATDevice.getConfig(C.AT_CMD_DEADZONE_Y), 0, this.state.maxPos));
        this.state.maxPos = this.getMaxPosManual() !== undefined ? this.getMaxPosManual() : Math.max(maxX, maxY, Math.abs(minX), Math.abs(minY), Math.round(deadX * 1.1), Math.round(deadY * 1.1), this.state.maxPos);
        let percentageX = L.limitValue(L.getPercentage(x, -this.state.maxPos, this.state.maxPos), 0, 100);
        let percentageY = L.limitValue(L.getPercentage(y, -this.state.maxPos, this.state.maxPos), 0, 100);
        let driftCompX = L.limitValue(L.getPercentage(data[ATDevice.Specific.LIVE_DRIFTCOMP_X], -this.state.maxPos, this.state.maxPos), 0, 100);
        let driftCompY = L.limitValue(L.getPercentage(data[ATDevice.Specific.LIVE_DRIFTCOMP_Y], -this.state.maxPos, this.state.maxPos), 0, 100);
        let eX = percentageX - 50;
        let eY = percentageY - 50;
        let inDeadzone = (Math.pow(eX, 2) / Math.pow(pDzX/2, 2) + Math.pow(eY, 2) / Math.pow(pDzY/2, 2)) < 1;

        this.setState({
            liveData: data,
            pX: percentageX,
            pY: percentageY,
            driftCompX: driftCompX,
            driftCompY: driftCompY,
            pDzX: pDzX,
            pDzY: pDzY,
            pDriftX: (L.getPercentage(ATDevice.getConfig(C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP), 0, this.state.maxPos)),
            pDriftY: (L.getPercentage(ATDevice.getConfig(C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP), 0, this.state.maxPos)),
            inDeadzone: inDeadzone
        });
    }

    getPercentLength(constant) {
        return Math.min(50, (this.state.liveData[constant] / 1024 * 100) / 2);
    }

    setMaxPosZoom(value) {
        this.setState({
            maxPosZoom: value
        });
        localStorageService.save(KEY_POS_VIS_MAX_POS_ZOOM, value);
    }

    componentDidUpdate() {
        let posVisSize = this.posVisRef.current.getBoundingClientRect().width;
        let canvas = this.canvasRef.current;
        canvas.width = posVisSize;
        canvas.height = posVisSize;
        let ctx = canvas.getContext('2d');
        ctx.beginPath();
        let rectW = ctx.canvas.width * this.state.pDzX / 100;
        let rectH = ctx.canvas.height * this.state.pDzY / 100;
        if (C.DEVICE_IS_FM && ATDevice.getConfig(C.AT_CMD_FLIPMOUSE_MODE) === C.FLIPMOUSE_MODE_ALT.value) {
            ctx.rect(ctx.canvas.width / 2 - rectW / 2, ctx.canvas.height / 2 - rectH / 2, rectW, rectH);
        } else {
            ctx.ellipse(ctx.canvas.width / 2, ctx.canvas.height / 2, rectW / 2, rectH / 2, 0, 0, 2 * Math.PI);
        }
        ctx.fillStyle = this.state.inDeadzone ? '#9be7ff' : '#cceff9';
        ctx.fill();
    }

    render(props) {
        if (this.stateListener) {
            this.stateListener(this.state);
        }
        this.props = props;
        let state = this.state;
        let data = this.state.liveData;
        return html`<div id="posVis" aria-hidden="true">
                    <div ref="${this.posVisRef}" class="relative center-div cursorPosWrapper full-vis-size">
                        <canvas id="DeadzoneCanvas" ref="${this.canvasRef}" class="back-layer full-vis-size ${props.showDeadzone ? '' : 'd-none'}"></canvas>
                        <div style="display: ${this.getValue(props.showZoom, false) ? 'block' : 'none'};">
                            <div id="zoomButtons" style="top: 1%; left: 1%; position: absolute; width: 100%">
                                <div class="relative">
                                    <button title="${L.translate('zoom in // Vergrößern')}" onclick="${() => this.setMaxPosZoom(Math.max(state.maxPosZoom * 0.9, 20))}" style="width: 15%; height: 15%; opacity: 0.7; padding: 0">${html`<${FaIcon} height="0.9em" icon="fas plus"/>`}</button>
                                    <button title="${L.translate('zoom out // Verkleinern')}" onclick="${() => this.setMaxPosZoom(Math.min(state.maxPosZoom * 1.1, 1024))}" style="width: 15%; height: 15%; opacity: 0.7; padding: 0">${html`<${FaIcon} height="0.9em" icon="fas minus"/>`}</button>
                                </div>
                            </div>
                        </div>
                        <div style="display: ${this.getValue(props.showOrientation, false) ? 'block' : 'none'}">
                            <div id="orientationSign" class="back-layer full-height full-width" style="transform: rotate(${(ATDevice.getConfig(C.AT_CMD_ORIENTATION_ANGLE))%360}deg);">
                                <div class="back-layer" style="top:100%; left: 35%; width: 30%; height: 10%; background-color: black; z-index: 2"></div>
                            </div>
                        </div>
                        <div style="display: ${this.getValue(props.showDriftComp, false) ? 'block' : 'none'}">
                            <div id="driftComp" class="back-layer"
                                 style="top: ${Math.max(100 - this.state.pDriftY, 0) / 2}%; left: ${Math.max(100 - this.state.pDriftX, 0) / 2}%; height: ${Math.min(this.state.pDriftY, 100)}%; width: ${Math.min(this.state.pDriftX, 100)}%; background-color: transparent; border: 1px solid gray"></div>
                        </div>
                        <div class="analogBars" style="display: ${this.getValue(props.showAnalogBars, false) ? 'block' : 'none'}">
                            <div id="upPos" class="back-layer color-lightred"
                                 style="top: ${50-this.getPercentLength(ATDevice.Specific.LIVE_UP)}%; left: 48.5%; height: ${this.getPercentLength(ATDevice.Specific.LIVE_UP)}%; width: 3%;"></div>
                            <div id="downPos" class="back-layer color-lightred"
                                 style="top: 50%; left: 48.5%; height: ${this.getPercentLength(ATDevice.Specific.LIVE_DOWN)}%; width: 3%;"></div>
                            <div id="leftPos" class="back-layer color-lightred"
                                 style="top: 48.5%; left: ${50-this.getPercentLength(ATDevice.Specific.LIVE_LEFT)}%; height: 3%; width: ${this.getPercentLength(ATDevice.Specific.LIVE_LEFT)}%;"></div>
                            <div id="rightPos" class="back-layer color-lightred"
                                 style="top: 48.5%; left: 50%; height: 3%; width: ${this.getPercentLength(ATDevice.Specific.LIVE_RIGHT)}%;"></div>
                        </div>
                        <div class="back-layer"
                             style="left: 50%; height: 100%; border-right-style: solid; border-right-width: thin;"></div>
                        <div class="back-layer"
                             style="top: 50%; width: 100%; border-bottom-style: solid; border-bottom-width: thin;"></div>
                        <div style="display: ${this.getValue(props.showAnalogValues, false) ? 'block' : 'none'}">
                            <div id="upPosVal" class="back-layer" style="top: 0%; left: 52%">${data[ATDevice.Specific.LIVE_UP]}</div>
                            <div id="downPosVal" class="back-layer" style="top: 90%; left: 52%">${data[ATDevice.Specific.LIVE_DOWN]}</div>
                            <div id="leftPosVal" class="back-layer" style="top: 38%; left: 1%;">${data[ATDevice.Specific.LIVE_LEFT]}</div>
                            <div id="rightPosVal" class="back-layer" style="top: 38%; left: 88%">${data[ATDevice.Specific.LIVE_RIGHT]}</div>
                        </div>
                        <div style="display: ${this.getValue(props.showMaxPos, false) ? 'block' : 'none'}">
                            <div id="cursorPosVal" class="back-layer" style="top: 90%; left: 2%;">${Math.round(this.state.maxPos)}</div>
                        </div>
                        <div id="cursorPos" class="back-layer" style="top: ${this.state.pY}%; left: ${this.state.pX}%;">
                            <div class="back-layer circle" style="${styleUtil.getCircleStyle(this.getValue(props.circleRadius, 12))}"></div>
                        </div>
                        <div id="driftCompPos" class="back-layer ${this.getValue(props.showDriftComp, false) && ATDevice.isMajorVersion(2) ? '' : 'd-none'}" style="top: ${this.state.driftCompY}%; left: ${this.state.driftCompX}%;">
                            <div class="back-layer circle" style="${styleUtil.getCircleStyle(4, 'blue')}"></div>
                        </div>
                    </div>
                </div>
                <style>
                    .analogBars div {
                        opacity: 0.7;
                    }
                </style>`;
    }
}

export {PositionVisualization};