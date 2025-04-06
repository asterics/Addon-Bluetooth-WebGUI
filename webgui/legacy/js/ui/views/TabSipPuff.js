import { h, Component, render } from '../../../lib/preact.min.js';
import htm from '../../../lib/htm.min.js';
import {ATDevice} from "../../communication/ATDevice.js";
import {ActionButton} from "../components/ActionButton.js";

const html = htm.bind(h);
class TabSipPuff extends Component {

    constructor() {
        super();

        this.lastChangedA11yPressure = 0;
        this.lastSliderChangedTime = 0;

        TabSipPuff.instance = this;
        this.state = {
            minRange: 0,
            maxRange: 1023,
            percent: 0,
            percentMin: 0,
            percentMax: 0,
            value: 0,
            valueA11y: 0,
            valueMin: 0,
            valueMax: 0,
            sipThreshold: 0,
            puffThreshold: 0,
            strongSipThreshold: 0,
            strongPuffThreshold: 0
        }

        ATDevice.Specific.resetMinMaxLiveValues();
    }

    updateData(data) {
        let newState = {};

        newState.minValue = data[C.LIVE_PRESSURE_MIN];
        newState.maxValue = data[C.LIVE_PRESSURE_MAX];
        newState.value = data[C.LIVE_PRESSURE];
        newState.SIP_THRESHOLD = ATDevice.getConfig(C.AT_CMD_SIP_THRESHOLD);
        newState.PUFF_THRESHOLD = ATDevice.getConfig(C.AT_CMD_PUFF_THRESHOLD);
        newState.SIP_STRONG_THRESHOLD = ATDevice.getConfig(C.AT_CMD_SIP_STRONG_THRESHOLD);
        newState.PUFF_STRONG_THRESHOLD = ATDevice.getConfig(C.AT_CMD_PUFF_STRONG_THRESHOLD);

        let border = (this.state.maxRange - this.state.minRange) * 0.1; // 10% space that is left and right of the min/max values on the sliders
        if (new Date().getTime() - this.lastSliderChangedTime > 500) {
            if (C.DEVICE_IS_FM) {
                this.state.minRange = Math.max(Math.min(newState.minValue - border, ATDevice.getConfig(C.AT_CMD_SIP_THRESHOLD) - border, ATDevice.getConfig(C.AT_CMD_SIP_STRONG_THRESHOLD) - border), 0);
                this.state.maxRange = Math.min(Math.max(newState.maxValue + border, ATDevice.getConfig(C.AT_CMD_PUFF_THRESHOLD) + border, ATDevice.getConfig(C.AT_CMD_PUFF_STRONG_THRESHOLD) + border), 1023);
            } else if (C.DEVICE_IS_FABI) {
                this.state.minRange = Math.max(Math.min(newState.minValue - border, ATDevice.getConfig(C.AT_CMD_SIP_THRESHOLD) - border), 0);
                this.state.maxRange = Math.min(Math.max(newState.maxValue + border, ATDevice.getConfig(C.AT_CMD_PUFF_THRESHOLD) + border), 1023);
            }
        }

        newState.percent = L.getPercentage(newState.value, this.state.minRange, this.state.maxRange);
        newState.percentMin = L.getPercentage(newState.minValue, this.state.minRange, this.state.maxRange);
        newState.percentMax = L.getPercentage(newState.maxValue, this.state.minRange, this.state.maxRange);

        if (new Date().getTime() - this.lastChangedA11yPressure > 1000) {
            this.lastChangedA11yPressure = new Date().getTime();
            newState.valueA11y = newState.value;
        }

        this.setState(newState);
    }

    sliderChanged(event, constant) {
        let newValue = parseInt(event.target.value);
        let oldValue = ATDevice.getConfig(constant);
        let liveValue = ATDevice.Specific.getLiveData(C.LIVE_PRESSURE);

        let validPuff = (newValue > liveValue || newValue > oldValue);
        let validSip = (newValue < liveValue || newValue < oldValue);

        //only move slider if sip thresholds are below and puff thresholds are above the current live value and if strong-values are below/above normal values
        if ((constant === C.AT_CMD_SIP_THRESHOLD && validSip && (newValue > ATDevice.getConfig(C.AT_CMD_SIP_STRONG_THRESHOLD) || C.DEVICE_IS_FABI)) ||
            (constant === C.AT_CMD_SIP_STRONG_THRESHOLD && validSip && newValue < ATDevice.getConfig(C.AT_CMD_SIP_THRESHOLD)) ||
            (constant === C.AT_CMD_PUFF_THRESHOLD && validPuff && (newValue < ATDevice.getConfig(C.AT_CMD_PUFF_STRONG_THRESHOLD) || C.DEVICE_IS_FABI)) ||
            (constant === C.AT_CMD_PUFF_STRONG_THRESHOLD && validPuff && newValue > ATDevice.getConfig(C.AT_CMD_PUFF_THRESHOLD))) {
            this.lastSliderChangedTime = new Date().getTime();
            let newState = {};
            newState[constant] = newValue;
            this.setState(newState);
            ATDevice.setConfig(constant, newValue);
        } else {
            this.setState({});
        }
    }
    
    render() {
        let state = this.state;

        return html`
            <h2>${L.translate('Sip/Puff configuration (slot "{?}") // Saug- / Pustesteuerung (Slot "{?}")', ATDevice.getCurrentSlot())}</h2>
            <span id="pressureLiveA11yLabel" class="sr-only">${L.translate('Current pressure value // Aktueller Wert Druck')}</span>
            <span id="pressureLiveA11y" aria-describedby="pressureLiveA11yLabel" class="onlyscreenreader" role="status" aria-live="off" accesskey="w" tabindex="-1">${state.valueA11y}</span>
            <div id="tab-puff-container" class="relative container-fluid">
                <div class="row back-layer full-height full-width">
                    <div aria-hidden="true" class="two columns"><span style="font-size: 1px; color: transparent">_</span></div>
                    <div class="ten columns full-height relative">
                        <div id="guide-current" class="back-layer full-height border-right-gray"
                             style="width: ${state.percent}%;"></div>
                        <div id="guide-max" class="back-layer full-height border-right-red" style="width: ${state.percentMax}%;"></div>
                        <div id="guide-min" class="back-layer full-height border-right-blue" style="width: ${state.percentMin}%;"></div>
                    </div>
                </div>

                <br/>
                <label for="SIP_THRESHOLD">${L.translate('Sip Threshold: // Schwellenwert Saugen:')}</label>
                <div id="SIP_THRESHOLD_WRAPPER" class="row ${state.value < state.SIP_THRESHOLD ? 'colored-thumb' : ''}">
                    <span aria-hidden="true" id="SIP_THRESHOLD_VAL" class="text-center two columns">${state.SIP_THRESHOLD}</span>
                    <input type="range" value="${state.SIP_THRESHOLD}" oninput="${(event) => this.sliderChanged(event, C.AT_CMD_SIP_THRESHOLD)}"
                           id="SIP_THRESHOLD" min="${state.minRange}" max="${state.maxRange}" class="ten columns" accesskey="y"/>
                </div>
                <div class="${C.DEVICE_IS_FABI ? 'd-none' : ''}">
                    <label for="SIP_STRONG_THRESHOLD">${L.translate('Strong Sip Threshold: // Schwellenwert Saugen stark:')}</label>
                    <div id="SIP_STRONG_THRESHOLD_WRAPPER" class="row ${state.value < state.SIP_STRONG_THRESHOLD ? 'colored-thumb' : ''}">
                        <span aria-hidden="true" id="SIP_STRONG_THRESHOLD_VAL" class="text-center two columns">${state.SIP_STRONG_THRESHOLD}</span>
                        <input type="range" value="${state.SIP_STRONG_THRESHOLD}" oninput="${(event) => this.sliderChanged(event, C.AT_CMD_SIP_STRONG_THRESHOLD)}"
                               id="SIP_STRONG_THRESHOLD" min="${state.minRange}" max="${state.maxRange}" class="ten columns" accesskey="x"/>
                    </div>
                </div>

                <br/>
                <label aria-hidden="true">${L.translate('Live values: // Aktuelle Werte:')}</label>
                <div class="row" aria-hidden="true">
                    <div id="value-bar-wrapper" class="text-center two columns">
                        <span>${L.translate('current: // aktuell:')}</span><span id="currentValue">${state.value}</span>,
                        <span>max:</span><span id="maxValue">${state.maxValue}</span>,
                        <span>min:</span><span id="minValue">${state.minValue}</span>
                    </div>
                    <div class="ten columns"
                         style="position:relative; height: 2em; border-style: solid; border-width: thin; background-color: transparent">
                        <div id="sippuff-value-bar" class="value-bar" style="width: ${state.percent}%;"></div>
                    </div>
                </div>

                <br/>
                <br/>
                <label for="PUFF_THRESHOLD">${L.translate('Puff Threshold: // Schwellenwert Pusten:')}</label>
                <div id="PUFF_THRESHOLD_WRAPPER" class="row ${state.value > state.PUFF_THRESHOLD ? 'colored-thumb' : ''}">
                    <span aria-hidden="true" id="PUFF_THRESHOLD_VAL" class="text-center two columns">${state.PUFF_THRESHOLD}</span>
                    <input type="range" value="${state.PUFF_THRESHOLD}" oninput="${(event) => this.sliderChanged(event, C.AT_CMD_PUFF_THRESHOLD)}"
                           id="PUFF_THRESHOLD" min="${state.minRange}" max="${state.maxRange}" class="ten columns" accesskey="c"/>
                </div>
                <div class="${C.DEVICE_IS_FABI ? 'd-none' : ''}">
                    <label for="PUFF_STRONG_THRESHOLD">${L.translate('Strong Puff Threshold: // Schwellenwert Pusten stark:')}</label>
                    <div id="PUFF_STRONG_THRESHOLD_WRAPPER" class="row ${state.value > state.PUFF_STRONG_THRESHOLD  ? 'colored-thumb' : ''}">
                        <span aria-hidden="true" id="PUFF_STRONG_THRESHOLD_VAL" class="text-center two columns">${state.PUFF_STRONG_THRESHOLD}</span>
                        <input type="range" value="${state.PUFF_STRONG_THRESHOLD}" oninput="${(event) => this.sliderChanged(event, C.AT_CMD_PUFF_STRONG_THRESHOLD)}"
                               id="PUFF_STRONG_THRESHOLD" min="${state.minRange}" max="${state.maxRange}" class="ten columns" accesskey="v"/>
                    </div>
                </div>
            </div>
            <div style="margin-top: 4em">
                ${html`<${ActionButton} onclick="${() => ATDevice.copyConfigToAllSlots([C.AT_CMD_SIP_THRESHOLD, C.AT_CMD_SIP_STRONG_THRESHOLD, C.AT_CMD_PUFF_THRESHOLD, C.AT_CMD_PUFF_STRONG_THRESHOLD])}"
                                        label="Copy config to all slots // Konfiguration auf alle Slots anwenden"
                                        progressLabel="Applying to all slots... // Anwenden auf alle Slots..." faIcon="far clone"/>`}
            </div>`;
    }
}

TabSipPuff.valueHandler = function (data) {
   TabSipPuff.instance.updateData(data);
};

export {TabSipPuff};