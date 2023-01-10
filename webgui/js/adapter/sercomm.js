import {MainView} from "../ui/views/MainView.js";

window.logReceived = false;

function SerialCommunicator() {
    //serial port instance
    let thiz = this;
    var _port;
    var _portWriter;
    var _textEncoder = new TextEncoder();
    let _runReader = true;
    let _portReader = null;

    //value handler for reported ADC/mouthpiece values
    var _valueHandler;
    //internal value handler function for the returned data for an AT command.
    var _internalValueFunction;
    let _sendingRaw = false;

    let _stringToReceive = null;
    let _stringToReceiveResolve = null;

    this.setValueHandler = function (handler) {
        _valueHandler = handler;
    };

    this.getSerialPort = function() {
        return _port;
    }

    this.init = async function () {
        if (!navigator.serial) {
            console.warn("Browser not supported, please use Chromium, Vivaldi, Edge or Chrome");
            return Promise.reject(C.ERROR_SERIAL_NOT_SUPPORTED);
        }

        //filter for arduino/Teensy VID/PID and our own ones
        const filters = C.USB_DEVICE_FILTERS;

        _port = await navigator.serial.requestPort({filters}).catch((error) => {
            console.log(error);
            return Promise.reject(C.ERROR_SERIAL_DENIED);
        });

        // Wait for the serial port to open.
        await _port.open({baudRate: 115200}).catch((error) => {
            console.log(error);
            return Promise.reject(C.ERROR_SERIAL_BUSY);
        });
        await listenToPort().catch(() => {
            return Promise.reject(C.ERROR_SERIAL_CONNECT_FAILED);
        });
        _portWriter = _port.writable.getWriter();

        return Promise.resolve();
    };

    this.cancel = function () {
        _runReader = false;
        if (_portReader) _portReader.cancel();
        if (_portWriter) _portWriter.close();
        if (_portReader) _portReader.releaseLock();
        if (_portWriter) _portWriter.releaseLock();
    }

    this.close = function () {
        return new Promise(resolve => {
            this.cancel();
            setTimeout(() => {
                if (_port) _port.close();
                setTimeout(() => {
                    resolve();
                }, 200);
            }, 200);
        });
    }

    /**
     * waits for a specific string to be received by serial port
     * @param stringToReceive the string to wait for
     * @param timeout timeout how long to wait
     * @return {Promise<unknown>} Promise is resolved if string is received, otherwise rejected after given timeout
     */
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
    }

    /**
     * sends raw data to serial port
     * @param arrayBuffer the binary data to send in an ArrayBuffer
     * @param progressCallback optional function that is called with current percentage value of progress (0-100)
     * @return {Promise<void>}
     */
    this.sendRawData = async function (arrayBuffer, progressCallback) {
        if (!arrayBuffer) return;
        if (!_port) {
            throw 'sercomm: port not initialized. call init() before sending data.';
        }
        _sendingRaw = true;
        let array = new Int8Array(arrayBuffer);
        let chunksize = C.DEVICE_IS_FM_OR_PAD ? 256 : 128;
        let sent = 0;
        let lastProgress = null;
        for (let i = 0; i < array.length; i += chunksize) {
            sent += chunksize;
            await _portWriter.write(array.slice(i, i + chunksize));
            let progress = Math.floor((sent / array.length) * 100);
            if (progressCallback && progress !== lastProgress) {
                progressCallback(progress);
                lastProgress = progress;
                log.info(progress + '%');
            }
            await new Promise(resolve => setTimeout(() => resolve(), 10));
        }
        _sendingRaw = false;
    }

    //send data line based (for all AT commands)
    this.sendData = async function (value, timeout, dontLog) {
        if (!value || _sendingRaw) return;
        if (!_port) {
            throw 'sercomm: port not initialized. call init() before sending data.';
        }
        timeout = timeout || 0;

        //send data via serial port
        var output = value + "\r\n";
        await _portWriter.write(_textEncoder.encode(output));
        //add NL/CR (not needed on websockets)
        //await _portWriter.write('\r\n');

        //_portWriter.releaseLock();
        //wait for a response to this command
        //(there might be a timeout for commands with no response)

        if (timeout > 0) {
            return new Promise(function (resolve) {
                let result = '';
                let timeoutHandler = setTimeout(function () {
                    if (!dontLog) {
                        console.log("timeout of command: " + value);
                    }
                    resolve(result);
                }, timeout);
                _internalValueFunction = function (data) {
                    clearTimeout(timeoutHandler);
                    result += data;
                    timeoutHandler = setTimeout(function () {
                        if (!dontLog) {
                            console.log("got result: " + result);
                        }
                        resolve(result);
                        _internalValueFunction = null;
                    }, 200);
                };
            });
        }
        return Promise.resolve();
    };

    async function listenToPort() {
        const textDecoder = new TextDecoderStream();
        _port.readable.pipeTo(textDecoder.writable);
        _portReader = textDecoder.readable.getReader();

        // Listen to data coming from the serial device.
        _runReader = true;
        var chunk = "";
        return new Promise(async (resolve, reject) => {
            setTimeout(resolve, 200);
            while (_runReader) {
                try {
                    const {value, done} = await _portReader.read();
                    if (done) {
                        break;
                    }

                    if (window.logReceived) {
                        log.info(value);
                    }
                    value.split("").forEach((part) => {
                        chunk = chunk + part;
                        if (_stringToReceive && chunk.indexOf(_stringToReceive.trim()) > -1) {
                            _stringToReceiveResolve();
                            _stringToReceive = null;
                        }
                        if (part === '\n') {
                            if (chunk.length > 2 && chunk.indexOf(C.LIVE_VALUE_CONSTANT) > -1) {
                                if (L.isFunction(_valueHandler)) {
                                    _valueHandler(chunk.toString());
                                }
                            } else if (_internalValueFunction) {
                                _internalValueFunction(chunk);
                            }
                            chunk = "";
                        }
                    });

                } catch (e) {
                    console.warn(e);
                    thiz.close();
                    if (MainView.instance) {
                        MainView.instance.toConnectionScreen();
                    }
                    reject();
                }
            }
            _portReader.releaseLock();
        });
    }
}

export {SerialCommunicator};
