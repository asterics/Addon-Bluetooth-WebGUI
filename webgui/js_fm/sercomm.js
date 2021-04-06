function SerialCommunicator() {
    /*const SerialPort = require('serialport');
    const Readline = require('@serialport/parser-readline');
    const Delimiter = require('@serialport/parser-delimiter');
    const parser = new Delimiter({ delimiter: '\r\n' });*/

    //serial port instance
    var _port;
    var _portWriter;
    //var _portReader;
    //value handler for reported ADC/mouthpiece values
    var _valueHandler;
    //internal value handler function for the returned data for an AT command.
    var _internalValueFunction;

    this.setValueHandler = function (handler) {
        _valueHandler = handler;
    };

    function isATCOM({ comName }, device = 'FLipMouse') {
        return new Promise((resolve, reject) => {
            const port = new SerialPort(
                comName,
                {
                    baudRate: 115200,
                    highWaterMark: 1024,
                    parser: new SerialPort.parsers.Readline('\n')
                },
                function(error) {
                    if (!error) {
                        let found = false;
                        port.on('data', chunk => {
                            const msg = chunk.toString();
                            if (msg.toLowerCase().startsWith(device.toLowerCase())) {
                                found = true;
                                console.log(
                                    `Found AT COM device at ${comName}:`
                                );
                                var ver = msg.replace(/(\r\n|\n|\r)/gm, "");
                                ver = ver.split(" ");
                                console.log(msg);
                                port.close();
                                flip.VERSION = ver[1];
                            } else {
                                console.error(`No ${device} at ${comName}.`);
                                port.close();
                                reject();
                            }
                        });
                        port.on('close', () => resolve(port));
                        port.write('AT ID \r\n');
                        setTimeout(() => {
                            if (!found) {
                                console.error(
                                    `Serial device ${comName} is not responding.`
                                );
                                reject();
                            }
                        }, 2000); // Reject if serial port is not responding.
                    } else {
                        console.log(error.message);
                        reject();
                    }
                }
            );
        });
    }
    
    async function listenToPort() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = _port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        // Listen to data coming from the serial device.
        while (true) {
			var chunk = "";
            const { value, done } = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                //reader.releaseLock();
                break;
            }
            
            value.split("").forEach(function(part) {
				chunk = chunk + part;
				if(part == '\n')
				{
					console.log("data evt: " + chunk);
					if (chunk.length > 2 && chunk.indexOf(C.LIVE_VALUE_CONSTANT) > -1) {
						if (L.isFunction(_valueHandler)) {
							_valueHandler(chunk.toString());
						}
					}
					if(_internalValueFunction) {
						_internalValueFunction(chunk);
					}
					chunk = "";
				}
			});
        }
    }

    this.init = async function() {
		if(!("serial" in navigator)) {
		// The Web Serial API is not supported.
			window.alert("Browser not supported, please use Chromium, Vivaldi, Edge or Chrome");
			return new Promise(function(resolve, reject) {
				reject("Browser does not support serial API");
			});
		}
		
		//filter for arduino/Teensy VID/PID and our own ones
		const filters = [
		  { usbVendorId: 0x2341, usbProductId: 0x0043 },
		  { usbVendorId: 0x16c0, usbProductId: 0x0483 }, //teensy
		  { usbVendorId: 0x16c0, usbProductId: 0x0487 }, //teensy
		  { usbVendorId: 0x2341, usbProductId: 0x0001 }
		];
		
		_port = await navigator.serial.requestPort({ filters });
		
		// Wait for the serial port to open.
		await _port.open({ baudRate: 115200 });
		listenToPort();
		
		textEncoder = new TextEncoderStream();
        writableStreamClosed = textEncoder.readable.pipeTo(_port.writable);

        _portWriter = textEncoder.writable.getWriter();
        
        L.setVisible('#button-connect', false);
		
		return new Promise(function(resolve,reject) {
			resolve() });
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
        console.log("sending:" + output);
        await _portWriter.write(output);
        //add NL/CR (not needed on websockets)
        //await _portWriter.write('\r\n');
        
        //_portWriter.releaseLock();

        var timeout = 3000;
        //wait for a response to this command
        //(there might be a timeout for commands with no response)
        return new Promise(function(resolve) {
            var result = '';
            var timeoutHandler = setTimeout(function () {
                console.log("timeout of command: " + value);
                resolve(result);
            }, timeout);
            _internalValueFunction = function(data) {
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
}
