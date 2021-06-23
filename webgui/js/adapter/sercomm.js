window.logReceived = false;

function SerialCommunicator() {
    //serial port instance
    var _port;
    var _portWriter;
    var _textEncoder = new TextEncoder();

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

    this.init = async function () {
        if (!("serial" in navigator)) {
            console.warn("Browser not supported, please use Chromium, Vivaldi, Edge or Chrome");
            return Promise.reject("Browser does not support serial API");
        }

        //filter for arduino/Teensy VID/PID and our own ones
        const filters = C.USB_DEVICE_FILTERS;

        _port = await navigator.serial.requestPort({filters}).catch((error) => {
            console.log(error);
            return Promise.reject("User didn't allow serial port access.");
        });

        // Wait for the serial port to open.
        await _port.open({baudRate: 115200}).catch(() => {
            return Promise.reject("Serial port couldn't be opened.");
        });
        listenToPort();
        _portWriter = _port.writable.getWriter();

        return Promise.resolve();
    };

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
        let chunksize = 2048;
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
            await new Promise(resolve => setTimeout(() => resolve(), 50));
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
        const reader = textDecoder.readable.getReader();

        // Listen to data coming from the serial device.
        var run = true;
        var chunk = "";
        while (run) {
            try {
                const {value, done} = await reader.read();
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
                console.warn(e)
                run = false;
            }
        }
        reader.releaseLock();
    }
}
