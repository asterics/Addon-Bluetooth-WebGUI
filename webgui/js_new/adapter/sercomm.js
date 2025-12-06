import {MainView} from "../ui/views/MainView.js";
import 'https://cdn.skypack.dev/web-serial-polyfill';


window.logReceived = false;

function SerialCommunicator() {
    //serial port instance
    let thiz = this;
    var _port;
    var _portWriter;
    var _textEncoder = new TextEncoder();
    let _runReader = true;
    let _portReader = null;

    // Flag to distinguish between user disconnect and error disconnect
    let _isManualClose = false; 

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
        _isManualClose = false; // Reset flag on init

        if (!navigator.serial) {
            console.warn("Browser not supported, please use Chromium, Vivaldi, Edge or Chrome");
            return Promise.reject(C.ERROR_SERIAL_NOT_SUPPORTED);
        }

        console.log("Requesting serial port...");
        _port=null;
        const saved = localStorage.getItem("preferredPort");
        if (saved) {
            const savedInfo = JSON.parse(saved);
            console.log(`Found a preferred port VID=${savedInfo.usbVendorId}, PID=${savedInfo.usbProductId}`);

            const ports = await navigator.serial.getPorts();
            if (ports.length === 0) {
                console.log("No previously authorized ports found in current session.");
            }
            else {
                console.log(`Found ${ports.length} authorized port(s) in current session.`);

                // Try to find the matching port
                for (const p of ports) {
                    const info = p.getInfo();
                    console.log(`Found authorized port: VID=${info.usbVendorId}, PID=${info.usbProductId}`);

                    if (info.usbVendorId === savedInfo.usbVendorId &&
                        info.usbProductId === savedInfo.usbProductId) {

                        console.log("Matched saved port — opening...");
                        _port = p;
                        const info = _port.getInfo();
                        console.log(`Re-opening port VID=${info.usbVendorId}, PID=${info.usbProductId}`);
                        break;
                    }
                }
            }
        }

        if (!_port) {
            console.log("Saved port not found, user must reconnect.");
         
            //filter for valid VID/PID combinations
            const filters = C.USB_DEVICE_FILTERS;

            _port = await navigator.serial.requestPort({filters}).catch((error) => {
                console.log(error);
                return Promise.reject(C.ERROR_SERIAL_DENIED);
            });

            const info = _port.getInfo();
            console.log(`User selected port VID=${info.usbVendorId}, PID=${info.usbProductId}`);

            // Save port identification to localStorage
            localStorage.setItem("preferredPort", JSON.stringify(info));
            console.log("Saved preferred port to localStorage.");
        }

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
        let chunksize = 256;
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

    /**
     * sends raw audio data to serial port
     * @param arrayBuffer the binary audio data (in wav format, 22Khz, mono) to send in an ArrayBuffer
     * @return {Promise<void>}
     */
    this.sendAudioData = async function (arrayBuffer) {
        if (!arrayBuffer) return;
        if (!_port) {
            throw 'sercomm: port not initialized. call init() before sending data.';
        }
        _sendingRaw = true;
        try {
            await _portWriter.write(_textEncoder.encode(C.AT_CMD_AUDIO_TRANSMISSION+"\n"));
            await _portWriter.write(arrayBuffer);
        } catch (error) {
            console.error("Error sending data to serial device:", error);
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

    async function tryAutoReconnect() {
        console.log("Starting auto-reconnection loop...");
        
        while (!_isManualClose) {
            try {
                const saved = localStorage.getItem("preferredPort");
                if (!saved) {
                    console.log("No saved port to reconnect to.");
                    break;
                }
                const savedInfo = JSON.parse(saved);
                
                // Check available ports
                const ports = await navigator.serial.getPorts();
                let foundPort = null;
                
                for (const p of ports) {
                    const info = p.getInfo();
                    if (info.usbVendorId === savedInfo.usbVendorId &&
                        info.usbProductId === savedInfo.usbProductId) {
                        foundPort = p;
                        break;
                    }
                }

                if (foundPort) {
                    console.log("Found device, attempting to open...");

                    await foundPort.open({baudRate: 115200});
                    await foundPort.close(); // Close immediately to reset state
                    console.log("port opened and closed successfully");

                    // notify UI that we are back online, updated views
                    if (MainView.instance) {
                        MainView.instance.initATDevice();
                    }
                    return; // Exit loop on success
                } else {
                    console.log("Saved device not found in port list. Scanning...");
                }
            } catch (e) {
                console.log("Reconnection attempt failed, retrying in 2s...", e);
            }

            // Wait 2 seconds before next attempt
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // go back to connection screen because of manual close or no saved port
        if (MainView.instance) {
            MainView.instance.toConnectionScreen();
        }
    }

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
                    console.warn("Serial port error/disconnect:", e);
                    
                    // Release locks and close port wrapper
                    try {
                        _runReader = false;
                        if (_portReader) _portReader.releaseLock();
                        if (_portWriter) _portWriter.releaseLock();
                        if (_port) await _port.close(); 
                    } catch (cleanupError) {
                        console.log("Serial port cleanup error:", cleanupError);
                    }

                    if (!_isManualClose) {
                        // Attempt to reconnect instead of showing connection screen immediately
                        tryAutoReconnect();
                        // We don't reject here, we let the reconnect loop handle it
                        return; 
                    } else {
                        if (MainView.instance) {
                            MainView.instance.toConnectionScreen();
                        }
                        reject();
                    }
                }
            }
            _portReader.releaseLock();
        });
    }
}

export {SerialCommunicator};
