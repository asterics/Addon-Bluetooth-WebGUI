import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {styleUtil} from '../../../js/util/styleUtil.js'
import {ATDevice} from "../../../js/communication/ATDevice.js";

const html = htm.bind(h);

class BtnSipPuffVisualization extends Component {

    constructor() {
        super();

        BtnSipPuffVisualization.instance = this;
        this.stateListener = null;
        this.state = {
            liveData: {}
        };
    }

    componentWillUnmount() {
        this.stateListener = null;
        if (BtnSipPuffVisualization.instance === this) {
            BtnSipPuffVisualization.instance = null;
        }
    }

    updateState(options) {
        this.setState(options);
    }

    setStateListener(fn) {
        this.stateListener = fn;
    }

    updateData(data) {
        this.setState({
            liveData: data
        });
    }

    render() {
        if (this.stateListener) {
            this.stateListener(this.state);
        }
        let state = this.state;
        let data = this.state.liveData;
        let circleRadius = Math.min(70, window.innerWidth / 7);
        let fontStyle = `text-align: center; line-height: ${circleRadius}px; font-size: 30px`;
        let getColor = (btnNum) => data[ATDevice.Specific.LIVE_BUTTONS] && data[ATDevice.Specific.LIVE_BUTTONS][btnNum] ? 'orange' : 'transparent';

        let liveP = data[C.LIVE_PRESSURE];
        let sip = ATDevice.getConfig(C.AT_CMD_SIP_THRESHOLD);
        let puff = ATDevice.getConfig(C.AT_CMD_PUFF_THRESHOLD);
        let strongSip = ATDevice.getConfig(C.AT_CMD_SIP_STRONG_THRESHOLD);
        let strongPuff = ATDevice.getConfig(C.AT_CMD_PUFF_STRONG_THRESHOLD);
        let rangeDown = Math.max(strongSip - 50, 0);
        let rangeUp = Math.min(strongPuff + 50, 1024);
        let color = ATDevice.getConfig(C.AT_CMD_SET_COLOR);
        color = color ? color.replace('0x', '#') : '';

        let sipLivePercentage = L.getPercentage(liveP, rangeDown, rangeUp);
        let sipP = L.getPercentage(sip, rangeDown, rangeUp);
        let puffP = L.getPercentage(puff, rangeDown, rangeUp);
        let strongSipP = L.getPercentage(strongSip, rangeDown, rangeUp);
        let strongPuffP = L.getPercentage(strongPuff, rangeDown, rangeUp);
        let pressureColor = 'darkgreen';
        if (liveP > puff || liveP < sip) {
            pressureColor = 'darkorange';
        }
        if (liveP > strongPuff || liveP < strongSip) {
            pressureColor = 'darkred';
        }

        return html`<div aria-hidden="true">
                    <div class="relative" name="fmRect" style="border: medium solid; height: 200px; width: 350px; max-width: 45vw">
                        <div class="back-layer" style="top: 40%; left: 18%;">
                            <div class="back-layer" style="${styleUtil.getCircleStyle(circleRadius, getColor(0), 'medium solid')}; ${fontStyle}">1</div>
                        </div>
                        <div class="back-layer" style="top: 40%; left: 48%;">
                            <div class="back-layer" style="${styleUtil.getCircleStyle(circleRadius, getColor(1), 'medium solid')}; ${fontStyle}">2</div>
                        </div>
                        <div class="back-layer" style="top: 40%; left: 78%;">
                            <div class="back-layer" style="${styleUtil.getCircleStyle(circleRadius, getColor(2), 'medium solid')}; ${fontStyle}">3</div>
                        </div>
                        <div class="back-layer d-flex align-items-center justify-content-center" style="top: 65%; left: 0; width: 100%; ${fontStyle}">
                            <span class="mr-2 d-none d-md-flex">Slot:</span>
                            <span>${ATDevice.getCurrentSlot()}</span>
                            <div class="ml-3 ${color ? '' : 'd-none'}" style="background-color: ${color}; width: 25px; height: 25px; border: 1px solid lightgray"></div>
                        </div>
                        <div class="back-layer" style="top: 30%; left: 100%; height: 40%; width: 350px; ; max-width: 45vw; border: medium solid;">
                            <div class="relative" style="width: 100%; height: 100%">
                                <div class="back-layer" style="top: 0; left: 0; height: 100%; width: ${sipLivePercentage}%; background-color: ${pressureColor}">
                                </div>
                                <div class="back-layer" style="top: -20%; left: 0; height: 140%; width: ${sipP}%; border-right: medium solid orange;">
                                </div>
                                <div class="back-layer" style="top: -20%; left: 0; height: 140%; width: ${puffP}%; border-right: medium solid orange;">
                                </div>
                                <div class="back-layer" style="top: -20%; left: 0; height: 140%; width: ${strongSipP}%; border-right: medium solid red;">
                                </div>
                                <div class="back-layer" style="top: -20%; left: 0; height: 140%; width: ${strongPuffP}%; border-right: medium solid red;">
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>`;
    }
}

export {BtnSipPuffVisualization};