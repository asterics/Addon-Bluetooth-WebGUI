# FABI & FLipMouse Configurator

You can configure your FLipMouse or FABI device via this page.

> :warning: You need a Chromium based browser! (Chromium, Chrome, Edge, Vivaldi,...)

To adjust settings on your assistive device, please:

1. Connect your device to the PC (mobile devices are not supported)
2. Windows only: install drivers from here (TODO: add link to .inf file for Teensy, Arduino and our VID/PID)
3. Select your device from below
4. Click connect


## Please select your device
<ul>
    <li>
        <a href="https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/index_fm.htm" style="border: 1px solid; margin-bottom: 1em">
            <span>FLipMouse</span>
            <div style="border: 1px solid"><img src="https://github.com/asterics/Addon-Bluetooth-WebGUI/blob/main/img/fm_lowres.png" alt="FLipMouse logo" width="300"/></div>
        </a>
    </li>
    <li>
        <a href="https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/index_fabi.htm" style="border: 1px solid">
            <span>FABI</span>
            <div style="border: 1px solid"><img src="https://github.com/asterics/Addon-Bluetooth-WebGUI/blob/main/img/fabi_lowres.png" alt="FABI logo" width="300"/></div>
        </a>
    </li>
</ul>

## Test suites
There are automatic test suites for testing correct function of the AT command API for a device:
* [FLipMouse tests](https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/test_fm.htm)
* [FABI tests](https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/test_fabi.htm)

## Developer information

This project here has two purposes:

* We will use it as landing page for this site (GitHub pages)
* All build files for building the ESP32 based Bluetooth and WebGUI addon are located here

If you are interested in flashing/updating your ESP32 addon for FABI/FLipMouse, please go to this repository's page: [Addon-Bluetooth-WebGUI](https://github.com/asterics/Addon-Bluetooth-WebGUI)

## Run WebGUI locally
You need a local webserver in order to run the WebGUI locally. There are many possibilities for this, an easy one if you've already installed [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is:
1. run `npm install --global http-server` (only once)
2. go to the project directory and run `http-server`
3. open `localhost:8080` in your chromium-based browser and select the appropriate html file