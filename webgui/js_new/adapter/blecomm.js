import {MainView} from "../ui/views/MainView.js";

// Service / characteristic UUIDs (as requested)
const PUCK_AT_COMMAND_SERVICE = 0xBCDE;
const PUCK_AT_COMMAND_WRITE_CHARACTERISTIC = 0xABCD; // TX from browser -> device
const PUCK_AT_COMMAND_READ_CHARACTERISTIC = 0xABCE;  // RX notifications device -> browser

window.logReceived = false;

function BluetoothCommunicator() {
    // BLE device and characteristics
    let thiz = this;
    let _device = null;
    let _server = null;
    let _service = null;
    let _txChar = null; // write characteristic (TX from browser)
    let _rxChar = null; // notify characteristic (RX from device)

    const _textEncoder = new TextEncoder();
    const _textDecoder = new TextDecoder();

    // handlers and state
    let _valueHandler = null;
    let _internalValueFunction = null;
    let _stringToReceive = null;
    let _stringToReceiveResolve = null;
    let _receiveBuffer = "";
    let _charChunk = "";

    this.setValueHandler = function (handler) {
        _valueHandler = handler;
    };

    this.getSerialPort = function () {
        return _device;
    };

    // Init: request and connect to BLE device, setup characteristics and notifications
    this.init = async function () {
        if (!navigator.bluetooth) {
            console.warn("Browser not supported, please use Chromium, Edge or Chrome");
            return Promise.reject('BLE_NOT_SUPPORTED');
        }

        try {
            _device = await navigator.bluetooth.requestDevice({
                filters: [{services: [PUCK_AT_COMMAND_SERVICE]}],
                optionalServices: [PUCK_AT_COMMAND_SERVICE]
            });

            _device.addEventListener('gattserverdisconnected', (ev) => {
                if (MainView.instance) MainView.instance.toConnectionScreen();
            });

            _server = await _device.gatt.connect();
            _service = await _server.getPrimaryService(PUCK_AT_COMMAND_SERVICE);
            _txChar = await _service.getCharacteristic(PUCK_AT_COMMAND_WRITE_CHARACTERISTIC);
            _rxChar = await _service.getCharacteristic(PUCK_AT_COMMAND_READ_CHARACTERISTIC);

            await _rxChar.startNotifications();
            _rxChar.addEventListener('characteristicvaluechanged', listenToPort);

            return Promise.resolve();
        } catch (error) {
            console.error('BLE init error', error);
            return Promise.reject('BLE_INIT_FAILED');
        }
    };

    this.cancel = function () {
        if (_rxChar) {
            try {
                _rxChar.removeEventListener('characteristicvaluechanged', listenToPort);
                _rxChar.stopNotifications().catch(() => {});
            } catch (e) {
                // ignore
            }
        }
    };

    this.close = function () {
        return new Promise((resolve) => {
            this.cancel();
            setTimeout(() => {
                try {
                    if (_device && _device.gatt.connected) _device.gatt.disconnect();
                } catch (e) {
                    // ignore
                }
                setTimeout(() => resolve(), 200);
            }, 200);
        });
    };

    // waits for a specific string to be received
    this.waitForReceiving = function (stringToReceive, timeout) {
        timeout = timeout || 5000;
        _stringToReceive = stringToReceive;
        return new Promise((resolve, reject) => {
            _stringToReceiveResolve = resolve;
            setTimeout(() => {
                _stringToReceive = null;
                _stringToReceiveResolve = null;
                reject(stringToReceive + ' not received.');
            }, timeout);
        });
    };

    // sendData: send an AT command / line to the device (adds CRLF)
    this.sendData = async function (value, timeout, dontLog) {
        if (!value) return;
        if (!_txChar) {
            throw 'blecomm: device not initialized. call init() before sending data.';
        }

        const output = value + "\r\n";
        try {
            await _txChar.writeValue(_textEncoder.encode(output));
        } catch (error) {
            console.error('Error writing to TX characteristic', error);
            throw error;
        }

        if (timeout > 0) {
            return new Promise(function (resolve) {
                let result = '';
                let timeoutHandler = setTimeout(function () {
                    if (!dontLog) console.log("timeout of command: " + value);
                    resolve(result);
                }, timeout);
                _internalValueFunction = function (data) {
                    clearTimeout(timeoutHandler);
                    result += data;
                    timeoutHandler = setTimeout(function () {
                        if (!dontLog) console.log("got result: " + result);
                        resolve(result);
                        _internalValueFunction = null;
                    }, 200);
                };
            });
        }
        return Promise.resolve();
    };

    function listenToPort(event) {
        try {
            const value = event.target.value;
            const chunk = _textDecoder.decode(value);
            if (window.logReceived) console.info(chunk);

            // accumulate into receive buffer for waitForReceiving
            _receiveBuffer += chunk;
            // process per-character (like listenToPort)
            for (const ch of chunk) {
                _charChunk += ch;

                // check waiting-for substring on the running chunk
                if (_stringToReceive && _charChunk.indexOf(_stringToReceive.trim()) > -1) {
                    if (_stringToReceiveResolve) _stringToReceiveResolve();
                    _stringToReceive = null;
                    _stringToReceiveResolve = null;
                }

                if (ch === '\n') {
                    const line = _charChunk;
                    // deliver live values to value handler
                    if (line.length > 2 && line.indexOf(window.C && window.C.LIVE_VALUE_CONSTANT) > -1) {
                        if (typeof _valueHandler === 'function') {
                            try { _valueHandler(line); } catch (e) { console.warn('valueHandler error', e); }
                        }
                    } else if (_internalValueFunction) {
                        try { _internalValueFunction(line); } catch (e) { console.warn('internal handler error', e); }
                    }
                    // reset char chunk for next line
                    _charChunk = "";
                }
            }
        } catch (e) {
            console.warn('Error in notification handler', e);
        }
    }

}

export {BluetoothCommunicator};
