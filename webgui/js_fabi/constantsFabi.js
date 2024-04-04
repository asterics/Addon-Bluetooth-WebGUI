import { TabSlots } from "../js/ui/views/TabSlots.js";
import { TabActions } from "../js/ui/views/TabActions.js";
import { TabGeneral } from "../js/ui/views/TabGeneral.js";
import { TabTimings } from "./ui/views/TabTimings.js";
import { TabSipPuff } from "../js/ui/views/TabSipPuff.js";
import { TabVisualization } from "./ui/views/TabVisualization.js";
import { FLipMouse } from "../js_fm/communication/FLipMouse.js";

window.C = window.C || {};

C.CURRENT_DEVICE = C.AT_DEVICE_FABI;
C.DEVICE_IS_FABI = C.CURRENT_DEVICE === C.AT_DEVICE_FABI;
C.DEVICE_IS_FM = C.CURRENT_DEVICE === C.AT_DEVICE_FLIPMOUSE;
C.DEVICE_IS_FLIPPAD = C.CURRENT_DEVICE === C.AT_DEVICE_FLIPPAD;
C.DEVICE_IS_FM_OR_PAD = C.DEVICE_IS_FM || C.DEVICE_IS_FLIPPAD;
C.MIN_FIRMWARE_VERSION = '2.5.0';
C.MAX_NUMBER_SLOTS = 10;
C.MAX_LENGTH_SLOTNAME = 11;
C.HELP_BASE_URL = 'https://github.com/asterics/FABI/blob/master/Documentation/UserManual/Markdown/Fabi%20User%20Manual.md // https://github.com/asterics/FABI/blob/master/Documentation/UserManual/Markdown/Fabi%20Anwendungsanleitung.md';

C.USB_DEVICE_FILTERS = [
    { usbVendorId: 0x2341, usbProductId: 0x8037 }, // Arduino Pro Micro
    { usbVendorId: 0x2E8A, usbProductId: 0xF10A }, // RaspberryPi PicoW
    { usbVendorId: 0x239A, usbProductId: 0xCAFE } // RaspberryPi PicoW - Adafruit TinyUSB Stack
    // { usbVendorId: 0x16c0 }, // Teensy 
];


C.VIEWS = [{
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
    helpHash: '#timings-tab-antitremor-and-special-functions // #einstellmöglichkeiten-im-reiter-timings'
}, {
    object: TabSipPuff,
    hash: '#tabPuff',
    label: 'Sip and Puff // Saug-Puste-Steuerung',
    helpHash: '#sip-and-puff-tab-using-a-pressure-sensor // #verwendung-eines-drucksensors-sip-puff---reiter-saug-puste-steuerung'
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



C.VIEW_START_HASH = '#tabActions';


C.ADDITIONAL_LINKS = [{
    label: 'More information about FABI // Mehr Infos zu FABI',
    url: 'https://www.asterics-foundation.org/projects/fabi/ // https://www.asterics-foundation.org/projekte-2/fabi/'
}, {
    label: 'User manual // Benutzerhandbuch',
    url: C.HELP_BASE_URL
}, {
    label: 'Ask questions about FABI // Eine Frage zu FABI stellen',
    url: 'https://q2a.wbt.wien/ask'
}, {
    label: 'Licensing // Lizenzbestimmungen',
    url: 'https://github.com/asterics/FABI/blob/master/LICENSE'
}, {
    label: 'Legal Notice // Impressum',
    url: 'https://www.asterics-foundation.org/legal-notice/ // https://www.asterics-foundation.org/impressum/'
}]



C.AT_CMD_CATEGORIES = [{
    constant: C.AT_CMD_CAT_KEYBOARD,
    label: 'Keyboard // Tastatur'
}, {
    constant: C.AT_CMD_CAT_MOUSE,
    label: 'Mouse // Maus'
}, {
    constant: C.AT_CMD_CAT_DEVICE,
    label: 'Device // Gerät'
}, {
    constant: C.AT_CMD_CAT_IR,
    label: 'Infrared // Infrarot'
}, {
    constant: C.AT_CMD_CAT_MACRO,
    label: 'Macro // Makro'
}, {
    constant: C.AT_CMD_CAT_JOYSTICK,
    label: 'Joystick'
}];



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




C.AT_CMDS_ACTIONS = C.AT_CMDS_ACTIONS.concat([{ // These are visible, when pressing, for example, on the Slot for Button 1.
    cmd: C.AT_CMD_CALIBRATION,
    label: 'Calibrate stick middle position // Stick-Mittelposition kalibrieren',
    shortLabel: 'Calibrate stick // Stick kalibrieren',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_IR_PLAY,
    label: 'Play infrared command // Infrarot-Kommando abspielen',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: FLipMouse.getIRCommands
}, {
    cmd: C.AT_CMD_IR_HOLD,
    label: 'Hold infrared command (as long as input action) // Infrarot-Kommando halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold IR command // IR-Kommando halten',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: FLipMouse.getIRCommands
}, {
    cmd: C.AT_CMD_JOYSTICK_X,
    label: 'Joystick set x-axis // Joystick x-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_Y,
    label: 'Joystick set y-axis // Joystick y-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_Z,
    label: 'Joystick set z-axis // Joystick z-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_ZTURN,
    label: 'Joystick set z-turn // Joystick z-Drehung setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_SLIDER,
    label: 'Joystick set slider // Joystick Regler setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_BUTTON_PRESS,
    label: 'Hold joystick button (as long as input action) // Joystick-Button halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold joystick button // Joystick-Button halten',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER,
    minValue: 1,
    maxValue: 32
}, {
    cmd: C.AT_CMD_JOYSTICK_HAT_POS,
    label: 'Set joystick hat position // Joystick Hat-Position setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}]);



C.AT_CMDS_MACRO = C.AT_CMDS_MACRO || [];

C.AT_CMDS_MACRO = C.AT_CMDS_MACRO.concat([{
    cmd: C.AT_CMD_JOYSTICK_BUTTON_RELEASE,
    label: 'Release joystick button // Joystick-Button auslassen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER,
    minValue: 1,
    maxValue: 32
}, {
    cmd: C.AT_CMD_IR_STOP,
    label: 'Stop infrared command // Infrarot-Kommando stoppen',
    category: C.AT_CMD_CAT_IR
}]);


C.BTN_MODES_FABI_V2 = [{
    index: 1,
    label: 'Button 1',
    category: C.BTN_CAT_BTN
}, {
    index: 2,
    label: 'Button 2',
    category: C.BTN_CAT_BTN
}, {
    index: 3,
    label: 'Button 3',
    category: C.BTN_CAT_BTN
}, {
    index: 4,
    label: 'Button 4',
    category: C.BTN_CAT_BTN
}, {
    index: 5,
    label: 'Button 5',
    category: C.BTN_CAT_BTN
}, {
    index: 6,
    label: 'Button 6',
    category: C.BTN_CAT_BTN
}, {
    index: 7,
    label: 'Button 7',
    category: C.BTN_CAT_BTN
}, {
    index: 8,
    label: 'Button 8',
    category: C.BTN_CAT_BTN
}, {
    index: 10,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 11,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}];



C.BTN_MODES_FABI_V3 = [{
    index: 1,
    label: 'Button 1',
    category: C.BTN_CAT_BTN
}, {
    index: 2,
    label: 'Button 2',
    category: C.BTN_CAT_BTN
}, {
    index: 3,
    label: 'Button 3',
    category: C.BTN_CAT_BTN
}, {
    index: 4,
    label: 'Button 4',
    category: C.BTN_CAT_BTN
}, {
    index: 5,
    label: 'Button 5',
    category: C.BTN_CAT_BTN
}, {
    index: 6,
    label: 'Button 1 long press // Button 1 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 7,
    label: 'Button 2 long press // Button 2 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 8,
    label: 'Button 3 long press // Button 3 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 9,
    label: 'Button 4 long press // Button 4 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 10,
    label: 'Button 5 long press // Button 5 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 11,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 12,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 13,
    label: 'Strong Sip // Starkes Ansaugen',
    category: C.BTN_CAT_STRONG_SIPPUFF
}, {
    index: 14,
    label: 'Strong Puff // Starks Pusten',
    category: C.BTN_CAT_STRONG_SIPPUFF
}, {
    index: 15,
    label: 'Strong Sip + Button 2 // Stark ansaugen + Button 2',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 16,
    label: 'Strong Sip + Button 3 // Stark ansaugen + Button 3',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 17,
    label: 'Strong Sip + Button 4 // Stark ansaugen + Button 4',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 18,
    label: 'Strong Sip + Button 5 // Stark ansaugen + Button 5',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 19,
    label: 'Strong Puff + Button 2 // Stark pusten + Button 2',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 20,
    label: 'Strong Puff + Button 3 // Stark pusten + Button 3',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 21,
    label: 'Strong Puff + Button 4 // Stark pusten + Button 4',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 22,
    label: 'Strong Puff + Button 5 // Stark pusten + Button 5',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}];


C.BTN_MODES_FABI_V2_ACTIONLIST = [{
    index: 1,
    label: 'Button 1',
    category: C.BTN_CAT_BTN
}, {
    index: 2,
    label: 'Button 2',
    category: C.BTN_CAT_BTN
}, {
    index: 3,
    label: 'Button 3',
    category: C.BTN_CAT_BTN
}, {
    index: 4,
    label: 'Button 4',
    category: C.BTN_CAT_BTN
}, {
    index: 5,
    label: 'Button 5',
    category: C.BTN_CAT_BTN
}, {
    index: 6,
    label: 'Button 6',
    category: C.BTN_CAT_BTN
}, {
    index: 7,
    label: 'Button 7',
    category: C.BTN_CAT_BTN
}, {
    index: 8,
    label: 'Button 8',
    category: C.BTN_CAT_BTN
}, {
    index: 7,
    label: 'Button 1 long press // Button 1 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 8,
    label: 'Button 2 long press // Button 2 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 9,
    label: 'Button 3 long press // Button 3 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 10,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 11,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}];




C.BTN_MODES_FABI_V3_ACTIONLIST = [{ // This can be seen within the actions tab. 
    index: 1,
    label: 'Button 1',
    category: C.BTN_CAT_BTN
}, {
    index: 2,
    label: 'Button 2',
    category: C.BTN_CAT_BTN
}, {
    index: 3,
    label: 'Button 3',
    category: C.BTN_CAT_BTN
}, {
    index: 4,
    label: 'Button 4',
    category: C.BTN_CAT_BTN
}, {
    index: 5,
    label: 'Button 5',
    category: C.BTN_CAT_BTN
}, {
    index: 6,
    label: 'Button 1 long press // Button 1 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 7,
    label: 'Button 2 long press // Button 2 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 8,
    label: 'Button 3 long press // Button 3 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 9,
    label: 'Button 4 long press // Button 4 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 10,
    label: 'Button 5 long press // Button 5 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 11,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 12,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 13,
    label: 'Strong Sip // Starkes Ansaugen',
    category: C.BTN_CAT_STRONG_SIPPUFF
}, {
    index: 14, // CHECK: No clue whether the index can simply be incremented (this applys to all strong Sip/Puffs).
    label: 'Strong Puff // Starks Pusten',
    category: C.BTN_CAT_STRONG_SIPPUFF
}, {
    index: 15,
    label: 'Strong Sip + Button 2 // Stark ansaugen + Button 2',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 16,
    label: 'Strong Sip + Button 3 // Stark ansaugen + Button 3',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 17,
    label: 'Strong Sip + Button 4 // Stark ansaugen + Button 4',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 18,
    label: 'Strong Sip + Button 5 // Stark ansaugen + Button 5',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 19,
    label: 'Strong Puff + Button 2 // Stark pusten + Button 2',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 20,
    label: 'Strong Puff + Button 3 // Stark pusten + Button 3',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 21,
    label: 'Strong Puff + Button 4 // Stark pusten + Button 4',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}, {
    index: 22,
    label: 'Strong Puff + Button 5 // Stark pusten + Button 5',
    category: C.BTN_CAT_BTN_STRONG_SIPPUFF
}];
