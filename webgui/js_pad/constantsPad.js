import {FLipPad} from "./communication/FLipPad.js";
import {TabPad} from "./ui/views/TabPad.js";
import {TabSlots} from "../js/ui/views/TabSlots.js";
import {TabActions} from "../js/ui/views/TabActions.js";
import {TabGeneral} from "../js/ui/views/TabGeneral.js";
import {TabVisualization} from "../js_fm/ui/views/TabVisualization.js";

window.C = window.C || {};

C.CURRENT_DEVICE = C.AT_DEVICE_FLIPPAD;
C.DEVICE_IS_FABI = C.CURRENT_DEVICE === C.AT_DEVICE_FABI;
C.DEVICE_IS_FM = C.CURRENT_DEVICE === C.AT_DEVICE_FLIPMOUSE;
C.DEVICE_IS_FLIPPAD = C.CURRENT_DEVICE === C.AT_DEVICE_FLIPPAD;
C.DEVICE_IS_FM_OR_PAD = C.DEVICE_IS_FM || C.DEVICE_IS_FLIPPAD;
C.MIN_FIRMWARE_VERSION = '2.11.1';
C.MAX_NUMBER_SLOTS = 10;
C.MAX_LENGTH_SLOTNAME = 13;

C.TRANSLATION_FILTER = function (translationKey) {
    if (translationKey && C.DEVICE_IS_FLIPPAD && !translationKey.toLowerCase().includes("joystick") && !translationKey.includes('[[')) {
        translationKey = translationKey.replaceAll("Stick", "Pad");
        translationKey = translationKey.replaceAll("stick", "pad");
    } else if (C.DEVICE_IS_FLIPPAD && translationKey && translationKey.includes('[[')) {
        translationKey = translationKey.replaceAll("[[", "");
        translationKey = translationKey.replaceAll("]]", "");
    }
    return translationKey;
}

C.USB_DEVICE_FILTERS =  [
    {usbVendorId: 0x16c0} // Teensy
];

C.VIEWS = [{
    object: TabPad,
    hash: '#tabPad',
    label: 'Pad-Config'
}, {
    object: TabActions,
    hash: '#tabActions',
    label: 'Actions // Aktionen'
}, {
    object: TabSlots,
    hash: '#tabSlots',
    label: 'Slots // Slots'
}, {
    object: TabGeneral,
    hash: '#tabGeneral',
    label: 'General // Allgemein'
}, {
    object: TabVisualization,
    hash: '#tabVis',
    label: 'Visualization // Visualisierung'
}];

C.ADDITIONAL_LINKS = [{
    label: 'Ask as question // Eine Frage stellen',
    url: 'https://q2a.wbt.wien/ask'
}, {
    label: 'Licensing // Lizenzbestimmungen',
    url: 'https://github.com/asterics/FLipMouse/blob/master/LICENSE'
}, {
    label: 'Legal Notice // Impressum',
    url: L.translate('https://www.asterics-foundation.org/legal-notice/ // https://www.asterics-foundation.org/impressum/')
}]

C.AT_CMD_CATEGORIES = [{
    constant: C.AT_CMD_CAT_KEYBOARD,
    label: 'Keyboard // Tastatur'
}, {
    constant: C.AT_CMD_CAT_MOUSE,
    label: 'Mouse // Maus'
}, {
    constant: C.AT_CMD_CAT_JOYSTICK,
    label: 'Joystick'
}, {
    constant: C.AT_CMD_CAT_DEVICE,
    label: 'Device // Gerät'
}, {
    constant: C.AT_CMD_CAT_IR,
    label: 'Infrared // Infrarot'
}, {
    constant: C.AT_CMD_CAT_MACRO,
    label: 'Macro // Makro'
}];

C.AT_CMDS_ACTIONS = C.AT_CMDS_ACTIONS.concat([{
    cmd: C.AT_CMD_CALIBRATION,
    label: 'Calibrate stick middle position // Stick-Mittelposition kalibrieren',
    shortLabel: 'Calibrate stick // Stick kalibrieren',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_IR_PLAY,
    label: 'Play infrared command // Infrarot-Kommando abspielen',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: FLipPad.getIRCommands
}, {
    cmd: C.AT_CMD_IR_HOLD,
    label: 'Hold infrared command (as long as input action) // Infrarot-Kommando halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold IR command // IR-Kommando halten',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: FLipPad.getIRCommands
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

C.BTN_CAT_BTN = 'BTN_CAT_BTN';
C.BTN_CAT_STICK = 'BTN_CAT_STICK';
C.BTN_CAT_SIPPUFF = 'BTN_CAT_SIPPUFF';
C.BTN_CAT_STICKPLUS = 'BTN_CAT_STICKPLUS';
C.BTN_CATEGORIES = [{
    constant: C.BTN_CAT_BTN,
    label: 'Buttons'
}, {
    constant: C.BTN_CAT_SIPPUFF,
    label: 'Sip/Puff // Ansaugen/Pusten'
}, {
    constant: C.BTN_CAT_STICK,
    label: 'Stick actions // Stick-Aktionen'
}, {
    constant: C.BTN_CAT_STICKPLUS,
    label: 'Advanced stick actions // Erweiterte Stick-Aktionen'
}]

C.BTN_MODES = [{
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
    label: 'Stick Up // Stick nach oben',
    category: C.BTN_CAT_STICK
}, {
    index: 5,
    label: 'Stick Down // Stick nach unten',
    category: C.BTN_CAT_STICK
}, {
    index: 6,
    label: 'Stick Left // Stick nach links',
    category: C.BTN_CAT_STICK
}, {
    index: 7,
    label: 'Stick Right // Stick nach rechts',
    category: C.BTN_CAT_STICK
}, {
    index: 8,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 9,
    label: 'Strong sip // Stark ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 10,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 11,
    label: 'Strong Puff // Stark pusten',
    category: C.BTN_CAT_SIPPUFF
}, {
    index: 12,
    label: 'Strong Sip + Up // Stark ansaugen + nach oben',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 13,
    label: 'Strong Sip + Down // Stark ansaugen + nach unten',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 14,
    label: 'Strong Sip + Left // Stark ansaugen + nach links',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 15,
    label: 'Strong Sip + Right // Stark ansaugen + nach rechts',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 16,
    label: 'Strong Puff + Up // Stark pusten + nach oben',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 17,
    label: 'Strong Puff + Down // Stark pusten + nach unten',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 18,
    label: 'Strong Puff + Left // Stark pusten + nach links',
    category: C.BTN_CAT_STICKPLUS
}, {
    index: 19,
    label: 'Strong Puff + Right // Stark pusten + nach rechts',
    category: C.BTN_CAT_STICKPLUS
}];

C.BTN_MODES_ACTIONLIST = C.BTN_MODES;

C.FLIPPAD_MODE_MOUSE = {
    value: 1,
    label: 'Mouse ([[stick]] mode) // Maus ([[Stick]]-Modus)'
};
C.FLIPPAD_MODE_PAD = {
    value: 5,
    label: 'Mouse (pad mode) // Maus (Pad-Modus)'
};
C.FLIPPAD_MODE_STICK_ALTERNATIVE = {
    value: 0,
    label: 'Alternative actions ([[stick]] mode) // Alternative Aktionen ([[Stick]]-Modus)'
};
C.FLIPPAD_MODE_PAD_ALTERNATIVE = {
    value: 6,
    label: 'Alternative actions (pad mode) // Alternative Aktionen (Pad-Modus)'
};
C.FLIPMOUSE_MODE_JOYSTICK_XY = {
    value: 2,
    label: 'Joystick (XY) // Joystick (XY)',
};
C.FLIPMOUSE_MODE_JOYSTICK_ZR = {
    value: 3,
    label: 'Joystick (ZR) // Joystick (ZR)'
};
C.FLIPMOUSE_MODE_JOYSTICK_SLIDERS = {
    value: 4,
    label: 'Joystick (Slider) // Joystick (Slider)'
};

C.FLIPMOUSE_MODES = [C.FLIPPAD_MODE_MOUSE, C.FLIPPAD_MODE_PAD, C.FLIPPAD_MODE_STICK_ALTERNATIVE, C.FLIPPAD_MODE_PAD_ALTERNATIVE, C.FLIPMOUSE_MODE_JOYSTICK_XY, C.FLIPMOUSE_MODE_JOYSTICK_ZR, C.FLIPMOUSE_MODE_JOYSTICK_SLIDERS];