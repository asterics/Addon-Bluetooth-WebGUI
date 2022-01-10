import {firmwareUtil} from "../../js/util/firmwareUtil.js";

let TeensyFirmwareUpdater = {}

const MAX_WORDS_TEENSY = 65536;

/****************/
// 1.) reset TeensyLC into bootloader mode (user interaction required)
/****************/
TeensyFirmwareUpdater.resetDevice = async function (existingOpenPort, filters) {
    filters = filters || [
        {usbVendorId: 0x16C0, usbProductId: 0x0487}
    ];
    let port = existingOpenPort || await navigator.serial.requestPort({filters});

    //open & close
    // Wait for the serial port to open.
    //source for this value: https://github.com/PaulStoffregen/teensy_loader_cli/blob/master/teensy_loader_cli.c "soft_reboot"
    await port.open({baudRate: 0x86});
    await firmwareUtil.wait(200);
    await port.close();
    log.warn('reset done!')
}

/****************/
// 2.) open the new bootloader USB-RAW HID (new USB-PID!); user interaction required
/****************/
TeensyFirmwareUpdater.uploadFirmware = async function (url, progressFn, filters) {
    if (!("hid" in navigator)) {
        log.warn("Web HID API not supported, please use Chromium based browsers!");
    }

    //request serial port
    filters = filters || [
        {vendorId: 0x16C0, productId: 0x0478}
    ];
    try {
        const [port] = await navigator.hid.requestDevice({filters});
        //open & close
        // Wait for the RAW HID port to open.
        await port.open();

        if (progressFn) {
            progressFn(1);
        }
        // retrieve firmware after opening port in order to prevent "no user interaction" error on opening port
        let result = await L.HTTPRequest(url, 'GET', 'text', 'FM_FIRMWARE');
        let flashData = firmwareUtil.parseIntelHex(result, MAX_WORDS_TEENSY);

        //main source:
        //https://github.com/PaulStoffregen/teensy_loader_cli/blob/master/teensy_loader_cli.c
        let block_size = 512;
        let txx = null;
        for (let addr = 0; addr < flashData.data.length; addr += block_size) {
            if (progressFn) {
                progressFn(Math.min(100, Math.round(addr / flashData.data.length * 100)));
            }
            //create addr array
            let cmd = new Uint8Array(64); //this is the address block, TODO: size depends on device
            cmd.fill(0); // clear array
            cmd[0] = addr & 0xFF;
            cmd[1] = (addr >> 8) & 0xFF;
            cmd[2] = (addr >> 16) & 0xFF;

            //check if this is the last page, if yes fill with 0xFF
            if (addr + block_size > flashData.data.length) {
                let data = flashData.data.slice(addr); //take the remaining bit
                let pad = new Uint8Array(block_size - data.length); //create a new padding array
                pad.fill(0xFF);
                txx = Uint8Array.from([...cmd, ...data, ...pad]); //concat command, remaining data and padding
                console.log("last page");
            } else {
                let data = flashData.data.slice(addr, addr + block_size); //take subarray with blocksize
                txx = Uint8Array.from([...cmd, ...data]); //concate command with page data
                console.log("page @" + addr);
            }

            //send the HID block now
            await port.sendReport(0, txx);

            //wait longer for the first block
            if (addr == 0) {
                console.log("First page, wait for 0.5s");
                await firmwareUtil.wait(500);
            }
            //wait 0.5s for each block
            await firmwareUtil.wait(50);
        }

        if (progressFn) {
            progressFn(100);
        }
        //reboot by setting first 3 bytes to 0xFF
        let cmd = new Uint8Array(64 + block_size); //this is the address block, TODO: size depends on device
        cmd.fill(0); // clear array
        cmd[0] = cmd[1] = cmd[2] = 0xFF; //reboot command
        await port.sendReport(0, cmd);

        //finished, close port
        console.log("finished");
        await port.close();
    } catch (e) {
        log.warn(e);
        return Promise.reject();
    }
}

export {TeensyFirmwareUpdater};