import { TabStick } from "./ui/views/TabStick.js";
import { TabSlots } from "./ui/views/TabSlots.js";
import { TabActions } from "./ui/views/TabActions.js";
import { TabGeneral } from "./ui/views/TabGeneral.js";
import { TabTimings } from "./ui/views/TabTimings.js";
import { TabSipPuff } from "./ui/views/TabSipPuff.js";
import { TabVisualization } from "./ui/views/TabVisualization.js";

window.C = window.C || {};

C.CURRENT_DEVICE = C.CURRENT_DEVICE || null;   // is set in index.html based on the hostname and in ATDevice.js based on the device type

C.MIN_FIRMWARE_VERSION = '3.8.0';
C.MAX_NUMBER_SLOTS = 10;
C.MAX_LENGTH_SLOTNAME = 11;

// Device VID / PID filters for connection via USB (defines visible devices in connection dialog)
C.USB_DEVICE_FILTERS = [
    { usbVendorId: 0x2341, usbProductId: 0x8037 },  // Arduino Pro Micro for legacy FABI
    { usbVendorId: 0x16c0 },                        // Teensy for legacy FlipMouse 
    { usbVendorId: 0x2e8a },                        // Arduino Nano 2040 Connect (RP2040)
    { usbVendorId: 0x2341 },                        // Arduino Nano 2040 Connect (from 2023 on)
    { usbVendorId: 0x2E8A, usbProductId: 0xF10A },  // RaspberryPi PicoW
    { usbVendorId: 0x239A, usbProductId: 0xCAFE },  // RaspberryPi PicoW - Adafruit TinyUSB Stack
	{ usbVendorId: 0x2E8A, usbProductId: 0xF10F }   // RaspberryPi Pico2W
];

C.AT_DEVICE_FLIPMOUSE = 'FLipMouse';
C.AT_DEVICE_FLIPPAD = 'FLipPad';
C.AT_DEVICE_FABI = 'FABI';

// HW specific constants, available sensors and their types
C.PHYSICAL_BUTTON_COUNT = 5; // default value for fabi, can be overwritten by the device  

C.PRESSURE_SENSOR = 'PRESSURE_SENSOR';
C.PRESSURE_SENSOR_TYPE_NONE = 'PressureSensor=None';
C.PRESSURE_SENSOR_TYPE_DPS310 = 'PressureSensor=DSP310';
C.PRESSURE_SENSOR_TYPE_MPRLS = 'PressureSensor=MPRLS';
C.PRESSURE_SENSOR_TYPE_ADC = 'PressureSensor=InternalADC';

C.FORCE_SENSOR = 'FORCE_SENSOR';
C.FORECE_SENSOR_TYPE_NONE = 'ForceSensor=None'
C.FORCE_SENSOR_TYPE_NAU7802 = 'ForceSensor=NAU7802';
C.FORCE_SENSOR_TYPE_ADC = 'ForceSensor=InternalADC';

// Constants for web URLs and WebSocket connections
// TBD: add dynamic links and labels for Flipmouse and Flippad
C.GUI_IS_HOSTED = window.location.href.indexOf('localhost') > -1 || window.location.href.indexOf('asterics.github.io') > -1 || window.location.href.indexOf('file://') > -1 || window.location.hostname.indexOf('asterics') > -1;
C.GUI_IS_ON_DEVICE = !C.GUI_IS_HOSTED;
C.GUI_IS_MOCKED_VERSION = window.location.href.indexOf('mock') > -1;
C.IS_TOUCH_DEVICE = 'ontouchstart' in document.documentElement;

C.ARE_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':8092/ws/astericsData';
C.FLIP_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':1804/';

// Additional links for the footer of the app
C.ADDITIONAL_LINKS = [{
    label: 'More information about FABI // Mehr Infos zu FABI',
    url: 'https://www.asterics-foundation.org/projects/fabi/ // https://www.asterics-foundation.org/projekte-2/fabi/'
}, {
    label: 'User manual // Benutzerhandbuch',
    url: 'https://github.com/asterics/FABI/blob/master/Documentation/UserManual/Markdown/Fabi%20User%20Manual.md // https://github.com/asterics/FABI/blob/master/Documentation/UserManual/Markdown/Fabi%20Anwendungsanleitung.md',
    // url: 'https://github.com/asterics/FLipMouse/blob/master/Documentation/UserManual/Markdown/FLipMouseUserManual.md // https://github.com/asterics/FLipMouse/blob/master/Documentation/UserManual/Markdown/FLipMouseAnwendungsanleitung.md';

}, {
    label: 'Licensing // Lizenzbestimmungen',
    url: 'https://github.com/asterics/FABI/blob/master/LICENSE'
}, {
    label: 'Legal Notice // Impressum',
    url: 'https://www.asterics-foundation.org/legal-notice/ // https://www.asterics-foundation.org/impressum/'
}]


C.MAX_LENGTH_ATCMD = 400;
C.LENGTH_AT_CMD_PREFIX = 6; //with space (e.g. "AT KW ")
C.MAX_LENGTH_VOICEMESSAGE = 100; // max length of voice message for slot change (in characters)


// List of views in the main view, with their labels, hashes and visibility functions
C.VIEWS = [{
    object: TabStick,
    hash: '#tabStick',
    label: 'Stick-Config',
    helpHash: '#stick-configuration-tab-stick-config // #stick-konfiguration-tab-stick-config',
    visibleFn: (ATDevice) => ATDevice.getSensorInfo()[C.FORCE_SENSOR]
}, {
    object: TabSipPuff,
    hash: '#tabPuff',
    label: 'Sip and Puff // Saug-Puste-Steuerung',
    helpHash: '#sip-and-puff-tab-using-a-pressure-sensor // #verwendung-eines-drucksensors-sip-puff---reiter-saug-puste-steuerung',
    visibleFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]
}, {
    object: TabActions,
    hash: '#tabActions',
    label: 'Actions // Aktionen',
    helpHash: '#actions-tab-assigning-button-functions // #zuweisung-der-taster-funktionen-reiter-aktionen'
}, {
    object: TabSlots,
    hash: '#tabSlots',
    label: 'Slots // Slots',
    helpHash: '#slots-tab-using-configuration-slots // #verwendung-der-speicherplätze-reiter-slots'
}, {
    object: TabTimings,
    hash: '#tabTimings',
    label: 'Timings',
    helpHash: '#timings-tab-antitremor-and-special-functions // #einstellmöglichkeiten-im-reiter-timings',
    visibleFn: (ATDevice) => false // TODO: enable this tab, when the timing functionality is implemented
}, {
    object: TabGeneral,
    hash: '#tabGeneral',
    label: 'General // Allgemein',
    helpHash: '#general-tab-bluetooth-and-firmware-options // #einstellmöglichkeiten-im-reiter-allgemein'
}, {
    object: TabVisualization,
    hash: '#tabVis',
    label: 'Visualization // Visualisierung',
}];

// Default view to show when the app starts
C.VIEW_START_HASH = '#tabActions';

// Categories for button actions
C.BTN_CAT_BTN = 'BTN_CAT_BTN';
C.BTN_CAT_BTN_LONGPRESS = 'BTN_CAT_BTN_LONGPRESS';
C.BTN_CAT_SIPPUFF = 'BTN_CAT_SIPPUFF';
C.BTN_CAT_STRONG_SIPPUFF = "BTN_CAT_STRONG_SIPPUFF"
C.BTN_CAT_STICK = 'BTN_CAT_STICK';
C.BTN_CAT_BTN_STRONG_SIPPUFF = 'BTN_CAT_BTN_STRONG_SIPPUFF';

C.BTN_CATEGORIES = [{
    constant: C.BTN_CAT_BTN,
    label: 'Buttons'
}, {
    constant: C.BTN_CAT_BTN_LONGPRESS,
    label: 'Buttons long press // Buttons lange drücken'
}, {
    constant: C.BTN_CAT_SIPPUFF,
    label: 'Sip/Puff // Ansaugen/Pusten'
}, {
    constant: C.BTN_CAT_STRONG_SIPPUFF,
    label: 'Strong Sip/Puff // Starkes Ansaugen/Pusten'
}, {
    constant: C.BTN_CAT_STICK,
    label: 'Stick actions // Stick-Aktionen'
}, {
    constant: C.BTN_CAT_BTN_STRONG_SIPPUFF,
    label: 'Combine button and strong Sip/Puff actions // Kombiniere button und starke Ansaugen/Pusten Aktionen'
}]


// List of button modes and their actions (depending on device type)
export function getBtnModesActionList() {
    let currentIndex = 1;
    let list = [];
    // console.log("C.CURRENT_DEVICE=", C.CURRENT_DEVICE, "C.DEVICE_IS_FABI=", C.DEVICE_IS_FABI, "C.DEVICE_IS_FM=", C.DEVICE_IS_FM, "C.PYHSICAL_BUTTON_COUNT=", C.PYHSICAL_BUTTON_COUNT);
    // Add buttons depending on device
    if (C.DEVICE_IS_FABI === true) {
        // FABI: 5 buttons
        for (let i = 1; i <= 5; i++) {
            list.push({
                index: currentIndex++,
                label: `Button ${i}`,
                category: C.BTN_CAT_BTN
            });
        }
    } else if (C.DEVICE_IS_FM === true) {
        // FLIPMOUSE: 3 buttons
        for (let i = 1; i <= 3; i++) {
            list.push({
                index: currentIndex++,
                label: `Button ${i}`,
                category: C.BTN_CAT_BTN
            });
        }
    }

    // Add the rest of the actions (stick, sip/puff, etc.) as before
    list = list.concat([
        {
            index: currentIndex++,
            label: 'Stick Up // Stick rauf',
            category: C.BTN_CAT_STICK,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, { 
            index: currentIndex++,
            label: 'Stick Down // Stick runter',
            category: C.BTN_CAT_STICK,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, { 
            index: currentIndex++,
            label: 'Stick Left // Stick links',
            category: C.BTN_CAT_STICK,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, { 
            index: currentIndex++,
            label: 'Stick Right // Stick rechts',
            category: C.BTN_CAT_STICK,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Sip // Ansaugen',
            category: C.BTN_CAT_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Puff // Pusten',
            category: C.BTN_CAT_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Sip // Starkes Ansaugen',
            category: C.BTN_CAT_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Puff // Starks Pusten',
            category: C.BTN_CAT_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Sip + Up // Stark ansaugen + nach oben',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Sip + Down // Stark ansaugen + nach unten',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Sip + Left // Stark ansaugen + nach links',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Sip + Right // Stark ansaugen + nach rechts',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Puff + Up // Stark pusten + nach oben',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Puff + Down // Stark pusten + nach unten',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Puff + Left // Stark pusten + nach links',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        }, {
            index: currentIndex++,
            label: 'Strong Puff + Right // Stark pusten + nach rechts',
            category: C.BTN_CAT_BTN_STRONG_SIPPUFF,
            visibleBtnFn: (ATDevice) => ATDevice.getSensorInfo()[C.PRESSURE_SENSOR] && ATDevice.getSensorInfo()[C.FORCE_SENSOR]
        } ]);

    return list;
}
// C.BTN_MODES_ACTIONLIST = getBtnModesActionList();



/*   TDB: handle long press / multiple press actions
}, { 
    index: currentIndex++,
    label: 'Button 1 long press // Button 1 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
  (...)
*/

// Modes for the stick input and their descriptions
C.STICK_MODE_ALT = {
    value: 0,
    label: 'Alternative actions // Alternative Aktionen',
};
C.STICK_MODE_MOUSE = {
    value: 1,
    label: 'Mouse movement // Mausbewegung'
};
C.STICK_MODE_JOYSTICK_1 = {
    value: 2,
    label: 'Joystick 1  // Joystick 1',
};
C.STICK_MODE_JOYSTICK_2 = {
    value: 3,
    label: 'Joystick 2 // Joystick 2'
};
C.STICK_MODE_JOYSTICK_3 = {
    value: 4,
    label: 'Joystick 3 // Joystick 3'
};
C.STICK_MODE_PAD_JOYSTICK = {
    value: 5,
    label: 'Mouse (joystick mode) // Maus (Joystick-Modus)'
};
C.STICK_MODE_PAD_TOUCHPAD = {
    value: 6,
    label: 'Mouse (touchpad mode) // Maus (Touchpad-Modus)'
};

C.FLIPPAD_MODE_STICK_ALTERNATIVE = {
    value: 0,
    label: 'Alternative actions (stick mode) // Alternative Aktionen (Stick-Modus)'
};
C.FLIPPAD_MODE_PAD_ALTERNATIVE = {
    value: 6,
    label: 'Alternative actions (pad mode) // Alternative Aktionen (Pad-Modus)'
};

C.STICK_MODES = [C.STICK_MODE_MOUSE, C.STICK_MODE_ALT, C.STICK_MODE_JOYSTICK_1, C.STICK_MODE_JOYSTICK_2, C.STICK_MODE_JOYSTICK_3];


// Events for refreshing views / configuration changes
C.EVENT_CONFIG_CHANGED = "EVENT_CONFIG_CHANGED";
C.EVENT_REFRESH_MAIN = "EVENT_REFRESH_MAIN";

// keycode stuff
C.KEYCODE_MAPPING = [];
C.PRINTABLE_KEYCODES = [];
C.KEYCODE_PREFIX = 'KEY_';
C.JS_KEYCODE_SHIFT = 16;
C.JS_KEYCODE_CTRL = 17;
C.JS_KEYCODE_ALT = 18;
C.JS_KEYCODE_RIGHTALT = 225;
C.JS_KEYCODE_BACKSPACE = 8;
C.JS_KEYCODE_SPACE = 32;
C.JS_KEYCODE_TAB = 9;
C.JS_KEYCODE_GUI = 91; //Windows / Mac key
C.JS_KEYCODE_F5 = 116;

// A-Z
for (var code = 65; code <= 90; code++) {
    C.KEYCODE_MAPPING[code] = C.KEYCODE_PREFIX + String.fromCharCode(code);
    C.PRINTABLE_KEYCODES.push(code);
}

// 0-9
for (var code = 48; code <= 57; code++) {
    C.KEYCODE_MAPPING[code] = C.KEYCODE_PREFIX + String.fromCharCode(code);
    C.PRINTABLE_KEYCODES.push(code);
}

// F1-F24
for (var code = 112; code <= 135; code++) {
    C.KEYCODE_MAPPING[code] = C.KEYCODE_PREFIX + 'F' + (code - 111);
}

C.KEYCODE_MAPPING[37] = 'KEY_LEFT';
C.KEYCODE_MAPPING[38] = 'KEY_UP';
C.KEYCODE_MAPPING[39] = 'KEY_RIGHT';
C.KEYCODE_MAPPING[40] = 'KEY_DOWN';
C.KEYCODE_MAPPING[13] = 'KEY_ENTER';
C.KEYCODE_MAPPING[27] = 'KEY_ESC';
C.KEYCODE_MAPPING[C.JS_KEYCODE_BACKSPACE] = 'KEY_BACKSPACE';
C.KEYCODE_MAPPING[C.JS_KEYCODE_TAB] = 'KEY_TAB';
C.KEYCODE_MAPPING[36] = 'KEY_HOME'; //pos1
C.KEYCODE_MAPPING[33] = 'KEY_PAGE_UP';
C.KEYCODE_MAPPING[34] = 'KEY_PAGE_DOWN';
C.KEYCODE_MAPPING[46] = 'KEY_DELETE';
C.KEYCODE_MAPPING[45] = 'KEY_INSERT';
C.KEYCODE_MAPPING[35] = 'KEY_END';
C.KEYCODE_MAPPING[144] = 'KEY_NUM_LOCK';
C.KEYCODE_MAPPING[145] = 'KEY_SCROLL_LOCK';
C.KEYCODE_MAPPING[C.JS_KEYCODE_SPACE] = 'KEY_SPACE';
C.KEYCODE_MAPPING[20] = 'KEY_CAPS_LOCK';
C.KEYCODE_MAPPING[19] = 'KEY_PAUSE';
C.KEYCODE_MAPPING[C.JS_KEYCODE_SHIFT] = 'KEY_SHIFT';
C.KEYCODE_MAPPING[C.JS_KEYCODE_CTRL] = 'KEY_CTRL';
C.KEYCODE_MAPPING[C.JS_KEYCODE_ALT] = 'KEY_ALT';
C.KEYCODE_MAPPING[C.JS_KEYCODE_GUI] = 'KEY_GUI'; //Windows
C.KEYCODE_MAPPING[C.JS_KEYCODE_RIGHTALT] = 'KEY_RIGHT_ALT'; //Windows
C.KEYCODE_MAPPING[92] = 'KEY_RIGHT_GUI';
C.KEYCODE_MAPPING[187] = 'KEY_PLUS';
C.KEYCODE_MAPPING[189] = 'KEY_MINUS';
C.KEYCODE_MAPPING[300] = 'KEY_ASTERISK';
C.KEYCODE_MAPPING[301] = 'KEY_SLASH';
C.KEYCODE_MAPPING[190] = 'KEY_DOT';
C.KEYCODE_MAPPING[302] = 'KEY_COLON';
C.KEYCODE_MAPPING[303] = 'KEY_SEMICOLON';
C.KEYCODE_MAPPING[191] = 'KEY_HASH';
C.KEYCODE_MAPPING[107] = 'KEY_KP_PLUS';
C.KEYCODE_MAPPING[109] = 'KEY_KP_MINUS';
C.KEYCODE_MAPPING[106] = 'KEY_KP_ASTERISK';
C.KEYCODE_MAPPING[111] = 'KEY_KP_SLASH';

C.SUPPORTED_KEYCODES = [];
for (var i = 0; i < 400; i++) {
    if (C.KEYCODE_MAPPING[i]) {
        C.SUPPORTED_KEYCODES.push(i);
    }
}

C.ERROR_FIRMWARE_OUTDATED = 'ERROR_FIRMWARE_OUTDATED';
C.ERROR_LEGACY_FIRMWARE = 'ERROR_LEGACY_FIRMWARE';
C.ERROR_WRONG_DEVICE = 'ERROR_WRONG_DEVICE';
C.ERROR_SERIAL_DENIED = 'ERROR_SERIAL_DENIED';
C.ERROR_SERIAL_BUSY = 'ERROR_SERIAL_BUSY';
C.ERROR_CONNECTION_LOST = 'ERROR_CONNECTION_LOST';
C.ERROR_SERIAL_CONNECT_FAILED = 'ERROR_SERIAL_CONNECT_FAILED';
C.ERROR_SERIAL_NOT_SUPPORTED = 'ERROR_SERIAL_NOT_SUPPORTED';

C.SUCCESS_FIRMWAREUPDATE = 'fwupdatesuccess';

// constants for live value reporting
C.LIVE_PRESSURE = 'LIVE_PRESSURE';
C.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
C.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';

C.LIVE_UP = 'LIVE_UP';
C.LIVE_DOWN = 'LIVE_DOWN';
C.LIVE_LEFT = 'LIVE_LEFT';
C.LIVE_RIGHT = 'LIVE_RIGHT';
C.LIVE_MOV_X = 'LIVE_MOV_X';
C.LIVE_MOV_Y = 'LIVE_MOV_Y';
C.LIVE_MOV_X_MIN = 'LIVE_MOV_X_MIN';
C.LIVE_MOV_X_MAX = 'LIVE_MOV_X_MAX';
C.LIVE_MOV_Y_MIN = 'LIVE_MOV_Y_MIN';
C.LIVE_MOV_Y_MAX = 'LIVE_MOV_Y_MAX';
C.LIVE_BUTTONS = 'LIVE_BUTTONS';
