import {firmwareUtil} from "../../js/util/firmwareUtil.js";

let ProMicroFirmwareUpdater = {}

const MAX_WORDS_PROMICRO = 32768;

//credits: https://www.30secondsofcode.org/articles/s/javascript-array-comparison
const equals = (a, b) =>  // a and be are two arrays. 
    a.length === b.length && 
    a.every((v, i) => v === b[i]); // For every element v at the position i in the array a, it will be checked whether it is the same as b[i] in the array b.

/****************/
// 1.) reset TeensyLC into bootloader mode (user interaction required)
/****************/
ProMicroFirmwareUpdater.resetDevice = async function (existingPort, filters) {
    //open & close
    // Wait for the serial port to open.
    let port = existingPort;
    filters = filters || [];
    if (!port) {
        port = await navigator.serial.requestPort({filters});
    }
    await port.open({baudRate: 1200});
    await firmwareUtil.wait(500);
    await port.close();
    log.info('reset done!');
}

/****************/
// 2.) open the new bootloader USB-RAW HID (new USB-PID!); user interaction required
/****************/
ProMicroFirmwareUpdater.uploadFirmware = async function (url, progressFn, filters) {
    filters = filters || [
        {usbVendorId: 0x2341, usbProductId: 0x0036},
        {usbVendorId: 0x2341, usbProductId: 0x0037}
    ];

    try {
        const port = await navigator.serial.requestPort({filters});
        await port.open({baudRate: 57600});

        if (progressFn) {
            progressFn(1);
        }
        // retrieve firmware after opening port in order to prevent "no user interaction" error on opening port
        let result = await L.HTTPRequest(url, 'GET', 'text', 'FABI_FIRMWARE');
        let flashData = firmwareUtil.parseIntelHex(result, MAX_WORDS_PROMICRO);

        //open writing facilities (with text encoder -> not good!)
        /*const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        const writer = textEncoder.writable.getWriter();*/
        //open writing facilities
        const writer = port.writable.getWriter();
        //open reading stream
        const reader = port.readable.getReader();

        //trigger update by sending programmer ID command
        await writer.write(new Uint8Array([0x53]));

        // Listen to data coming from the serial device.
        let state = 0;
        let pageStart = 0;
        let address = 0;
        let currentValues = new Uint8Array(0);
        while (true) {
            const {value, done} = await reader.read();
            if (done) {
                // Allow the serial port to be closed later.
                reader.releaseLock();
                writer.releaseLock();
                break;
            }

            /****************/
            // 3.) flashing the .hex file (event driven by the received data from the ATMega32U4).
            // most commands are acknowledged with 13d.
            /****************/
            if (state == 0) {
                //1.) "S" => "CATERIN" - get programmer ID
                currentValues = new Uint8Array([...currentValues, ...value]);
                if (equals(currentValues, [67, 65, 84, 69, 82, 73, 78])) {
                    console.log("programmer \"CATERIN\" detected, entering programming mode");
                    await writer.write(new Uint8Array([0x50]));
                    await firmwareUtil.wait(5);
                    state = 1;
                } else {
                    console.log("error: unexpected RX value in state 0, waited for \"CATERIN\"");
                }
            } else if (state == 1) {
                //2.) "P" => 13d - enter programming mode
                if (equals(value, [13])) {
                    console.log("setting address to: " + address);
                    let data = new Uint8Array([0x41, (address >> 8) & 0xFF, address & 0xFF]); // 'A' high low
                    console.log("O: " + data);
                    await writer.write(data);
                    await firmwareUtil.wait(5);
                    state = 2;
                } else {
                    console.log("error: unexpected RX value in state 1, waited for 13");
                }
            } else if (state == 2) {
                //3.) now flash page
                if (equals(value, [13])) {
                    if (progressFn) {
                        progressFn(Math.min(100, Math.round(pageStart / flashData.data.length * 100)));
                    }

                    let cmd = new Uint8Array([0x42, 0x00, 0x80, 0x46]); //flash page write command ('B' + 2bytes size + 'F')

                    //determine if this is the last page (maybe incomplete -> fill with 0xFF)
                    let txx = null;
                    if (pageStart + 128 > flashData.data.length) {
                        let data = flashData.data.slice(pageStart); //take the remaining bit
                        let pad = new Uint8Array(128 - data.length); //create a new padding array
                        pad.fill(0xFF);
                        txx = Uint8Array.from([...cmd, ...data, ...pad]); //concat command, remaining data and padding
                        console.log("last page");
                        state = 3;
                    } else {
                        let data = flashData.data.slice(pageStart, pageStart + 128); //take subarray with 128B
                        txx = Uint8Array.from([...cmd, ...data]); //concate command with page data
                        state = 1;
                    }

                    console.log("adress set, writing one page...");
                    pageStart += 128;
                    address += 64;
                    //write control + flash data
                    await writer.write(txx);
                    //console.log("O: " + txx);
                    await firmwareUtil.wait(5);
                } else {
                    console.log("error: state 2");
                }

            } else if (state == 3) {
                //4.) last page sent, finish update
                if (value[0] == 13) {
                    console.log("Last page write, leaving programming mode");
                    //finish flashing and exit bootloader
                    await writer.write(new Uint8Array([0x4C])); //"L" -> leave programming mode
                    state = 4;
                } else {
                    console.log("NACK");
                }
            } else if (state == 4) {
                //5.) left programming mode, exiting bootloader
                if (value[0] == 13) {
                    console.log("Exiting bootloader");
                    //finish flashing and exit bootloader
                    await writer.write(new Uint8Array([0x45])); //"E" -> exit bootloader
                    state = -1;
                    console.log("finished!");
                    reader.cancel();
                } else {
                    console.log("NACK");
                }
            }
        }
        await port.close();
    } catch (e) {
        log.warn(e);
        window.location.reload();
    }
}

export {ProMicroFirmwareUpdater};