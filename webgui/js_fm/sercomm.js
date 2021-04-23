function SerialCommunicator() {
    //serial port instance
    var _port;
    var _portWriter;

    //value handler for reported ADC/mouthpiece values
    var _valueHandler;
    //internal value handler function for the returned data for an AT command.
    var _internalValueFunction;

    this.setValueHandler = function (handler) {
        _valueHandler = handler;
    };

    this.init = async function () {
        if (!("serial" in navigator)) {
            console.warn("Browser not supported, please use Chromium, Vivaldi, Edge or Chrome");
            return Promise.reject("Browser does not support serial API");
        }

        //filter for arduino/Teensy VID/PID and our own ones
        const filters = [
            {usbVendorId: 0x2341, usbProductId: 0x0043},
            {usbVendorId: 0x16c0, usbProductId: 0x0483}, //teensy
            {usbVendorId: 0x16c0, usbProductId: 0x0487}, //teensy
            {usbVendorId: 0x2341, usbProductId: 0x0001}
        ];

        _port = await navigator.serial.requestPort({filters}).catch((error) => {
            console.log(error);
            return Promise.reject("User didn't allow serial port access.");
        });

        // Wait for the serial port to open.
        await _port.open({baudRate: 115200}).catch(() => {
            return Promise.reject("Serial port couldn't be opened.");
        });
        listenToPort();
        var textEncoder = new TextEncoderStream();
        textEncoder.readable.pipeTo(_port.writable);
        _portWriter = textEncoder.writable.getWriter();

        return Promise.resolve();
    };

    //send raw data without line endings (used for transferring binary data, e.g. updates)
    this.sendRawData = async function (value, timeout) {
        if (!value) return;
        if (!_port) {
            throw 'sercomm: port not initialized. call init() before sending data.';
        }
        //send data via serial port
        await _portWriter.write(value);
        console.log('finished write');
    }

    //send data line based (for all AT commands)
    this.sendData = async function (value, timeout) {
        if (!value) return;
        if (!_port) {
            throw 'sercomm: port not initialized. call init() before sending data.';
        }

        //send data via serial port
        var output = value + "\r\n";
        await _portWriter.write(output);
        //add NL/CR (not needed on websockets)
        //await _portWriter.write('\r\n');

        //_portWriter.releaseLock();

        var timeout = 3000;
        //wait for a response to this command
        //(there might be a timeout for commands with no response)
        return new Promise(function (resolve) {
            var result = '';
            var timeoutHandler = setTimeout(function () {
                console.log("timeout of command: " + value);
                resolve(result);
            }, timeout);
            _internalValueFunction = function (data) {
                clearTimeout(timeoutHandler);
                result += data.toString() + "\n";
                timeoutHandler = setTimeout(function () {
                    console.log("got result: " + result);
                    resolve(result);
                    _internalValueFunction = null;
                }, 200);
            };
        });
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

                if (value.indexOf('\n') < 0) {
                    chunk += value;
                } else {
                    value.split("").forEach((part) => {
                        chunk = chunk + part;
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
                }
            } catch (e) {
                console.warn(e)
                run = false;
            }
        }
        reader.releaseLock();
    }
}
