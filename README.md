# FABI & FLipMouse Configurator

You can configure your FLipMouse or FABI device via this page.

> :warning: You need a Chromium based browser! (Chromium, Chrome, Edge, Vivaldi,...)

To adjust settings on your assistive device, please:

1. Connect your device to the PC
2. Select your device from below to go to the configuration page

## Please select your device
<ul>
    <li>
        <a href="https://flipmouse.asterics.eu" style="border: 1px solid; margin-bottom: 1em">
            <span>FLipMouse</span>
            <div style="border: 1px solid"><img src="https://github.com/asterics/Addon-Bluetooth-WebGUI/blob/main/webgui/img/fm_lowres.png" alt="FLipMouse logo" width="300"/></div>
        </a>
    </li>
    <li>
        <a href="https://fabi.asterics.eu" style="border: 1px solid">
            <span>FABI</span>
            <div style="border: 1px solid"><img src="https://github.com/asterics/Addon-Bluetooth-WebGUI/blob/main/webgui/img/fabi_lowres.png" alt="FABI logo" width="300"/></div>
        </a>
    </li>
</ul>

## Run WebGUI locally
To run the WebGUIs locally you need to download this repository and start a local webserver to serve the data. Do the following steps:
1. Clone the repository with `git clone https://github.com/asterics/Addon-Bluetooth-WebGUI.git`
2. Install any local webserver, e.g. [http-server from npm](https://www.npmjs.com/package/http-server) with `npm install --global http-server` (or Python: `python3 -m http.server 8080`)
3. Start the local webserver to serve documents from the webgui folder e.g. with `cd Addon-Bluetooth-WebGUI/webgui` and starting `http-server` in this directory
4. Open `http://localhost:8080/index_fm.htm` or `http://localhost:8080/index_fabi.htm` in your browser

## Test suites
There are automatic test suites for testing correct function of the AT command API for a device:
* [FLipMouse tests](https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/test_fm.htm)
* [FABI tests](https://asterics.github.io/Addon-Bluetooth-WebGUI/webgui/test_fabi.htm)

## Developer information

This project here has two purposes:

* We will use it as landing page for this site (GitHub pages)
* All build files for building the ESP32 based Bluetooth and WebGUI addon are located here

If you are interested in flashing/updating your ESP32 addon for FABI/FLipMouse, please go to this repository's page: [Addon-Bluetooth-WebGUI](https://github.com/asterics/Addon-Bluetooth-WebGUI)
