import {ATDevice} from "./communication/ATDevice.js";

window.C = window.C || {};

C.AT_DEVICE_FLIPMOUSE = 'FLipMouse';
C.AT_DEVICE_FABI = 'FABI';

C.GUI_IS_HOSTED = window.location.href.indexOf('localhost') > -1 || window.location.href.indexOf('asterics.github.io') > -1 || window.location.href.indexOf('file://') > -1 || window.location.hostname.indexOf('asterics') > -1;
C.GUI_IS_ON_DEVICE = !C.GUI_IS_HOSTED;
C.GUI_IS_MOCKED_VERSION = window.location.href.indexOf('mock') > -1;
C.IS_TOUCH_DEVICE = 'ontouchstart' in document.documentElement;

C.ARE_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':8092/ws/astericsData';
C.FLIP_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':1804/';
C.LIVE_VALUE_CONSTANT = 'VALUES:';

C.MAX_LENGTH_ATCMD = 400;
C.LENGTH_ATCMD_PREFIX = 6; //with space (e.g. "AT KW ")

// AT commands - general
C.AT_CMD_VERSION = 'AT ID';
C.AT_CMD_BTN_MODE = 'AT BM';

// AT commands - USB HID
C.AT_CMD_CLICK_MOUSE_L = 'AT CL';
C.AT_CMD_CLICK_MOUSE_R = 'AT CR';
C.AT_CMD_CLICK_MOUSE_M = 'AT CM';
C.AT_CMD_DOUBLECLICK_MOUSE_L = 'AT CD';

C.AT_CMD_HOLD_MOUSE_L = 'AT HL';
C.AT_CMD_HOLD_MOUSE_R = 'AT HR';
C.AT_CMD_HOLD_MOUSE_M = 'AT HM';

C.AT_CMD_RELEASE_MOUSE_L = 'AT RL';
C.AT_CMD_RELEASE_MOUSE_R = 'AT RR';
C.AT_CMD_RELEASE_MOUSE_M = 'AT RM';

C.AT_CMD_MOUSE_TOGGLE_L = 'AT TL';
C.AT_CMD_MOUSE_TOGGLE_R = 'AT TR';
C.AT_CMD_MOUSE_TOGGLE_M = 'AT TM';

C.AT_CMD_MOUSEWHEEL_UP = 'AT WU';
C.AT_CMD_MOUSEWHEEL_DOWN = 'AT WD';

C.AT_CMD_MOUSE_MOVEX = 'AT MX';
C.AT_CMD_MOUSE_MOVEY = 'AT MY';
C.AT_CMD_ORIENTATION_ANGLE = 'AT RO';

C.AT_CMD_JOYSTICK_X = 'AT JX';
C.AT_CMD_JOYSTICK_Y = 'AT JY';
C.AT_CMD_JOYSTICK_Z = 'AT JZ';
C.AT_CMD_JOYSTICK_ZTURN = 'AT JT';
C.AT_CMD_JOYSTICK_SLIDER = 'AT JS';
C.AT_CMD_JOYSTICK_BUTTON_PRESS = 'AT JP';
C.AT_CMD_JOYSTICK_BUTTON_RELEASE = 'AT JR';
C.AT_CMD_JOYSTICK_HAT_POS = 'AT JH';

C.AT_CMD_WRITEWORD = 'AT KW';
C.AT_CMD_KEYPRESS = 'AT KP';
C.AT_CMD_KEYHOLD = 'AT KH';
C.AT_CMD_KEYTOGGLE = 'AT KT';
C.AT_CMD_KEYRELEASE = 'AT KR';
C.AT_CMD_KEYRELEASEALL = 'AT RA';

//macro specific
C.AT_CMD_MACRO = 'AT MA';
C.AT_CMD_WAIT = 'AT WA';

// AT commands - Housekeeping
C.AT_CMD_SAVE_SLOT = 'AT SA';
C.AT_CMD_LOAD_SLOT = 'AT LO';
C.AT_CMD_LOAD_ALL = 'AT LA';
C.AT_CMD_NEXT_SLOT = 'AT NE';
C.AT_CMD_DELETE_SLOT = 'AT DE';
C.AT_CMD_RESET_DEVICE = 'AT RS';
C.AT_CMD_NO_CMD = 'AT NC';
C.AT_CMD_DEVICE_MODE = 'AT BT';

//FM specific
C.AT_CMD_FLIPMOUSE_MODE = 'AT MM';
C.AT_CMD_START_REPORTING_LIVE = 'AT SR';
C.AT_CMD_STOP_REPORTING_LIVE = 'AT ER';
C.AT_CMD_CALIBRATION = 'AT CA';
C.AT_CMD_SENSITIVITY_X = 'AT AX';
C.AT_CMD_SENSITIVITY_Y = 'AT AY';
C.AT_CMD_DEADZONE_X = 'AT DX';
C.AT_CMD_DEADZONE_Y = 'AT DY';
C.AT_CMD_MAX_SPEED = 'AT MS';
C.AT_CMD_ACCELERATION = 'AT AC';

C.AT_CMD_SIP_THRESHOLD = 'AT TS';
C.AT_CMD_PUFF_THRESHOLD = 'AT TP';
C.AT_CMD_PUFF_STRONG_THRESHOLD = 'AT SP';
C.AT_CMD_SIP_STRONG_THRESHOLD = 'AT SS';

C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP = 'AT GV';
C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP = 'AT RV';
C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP = 'AT RH';
C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP = 'AT RH';

C.AT_CMD_IR_RECORD = 'AT IR';
C.AT_CMD_IR_PLAY = 'AT IP';
C.AT_CMD_IR_HOLD = 'AT IH';
C.AT_CMD_IR_STOP = 'AT IS';
C.AT_CMD_IR_DELETE = 'AT IC';
C.AT_CMD_IR_WIPE = 'AT IW';
C.AT_CMD_IR_LIST = 'AT IL';

// FABI-specific
C.AT_CMD_THRESHOLD_LONGPRESS = 'AT TT';
C.AT_CMD_THRESHOLD_DOUBLEPRESS = 'AT DP';
C.AT_CMD_THRESHOLD_AUTODWELL = 'AT AD';
C.AT_CMD_ANTITREMOR_PRESS = 'AT AP';
C.AT_CMD_ANTITREMOR_RELEASE = 'AT AR';
C.AT_CMD_ANTITREMOR_IDLE = 'AT AI';
C.AT_CMD_SET_COLOR = 'AT SC';

// Addon commands
C.AT_CMD_ADDON_COMMAND = 'AT BC';
C.AT_CMD_UPGRADE_ADDON = 'AT UG';

C.AT_CMDS_SETTINGS = [C.AT_CMD_BTN_MODE, C.AT_CMD_DEVICE_MODE, C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y,
    C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION, C.AT_CMD_FLIPMOUSE_MODE, C.AT_CMD_GAIN_VERTICAL_DRIFT_COMP, C.AT_CMD_RANGE_VERTICAL_DRIFT_COMP,
    C.AT_CMD_GAIN_HORIZONTAL_DRIFT_COMP, C.AT_CMD_RANGE_HORIZONTAL_DRIFT_COMP, C.AT_CMD_SIP_THRESHOLD, C.AT_CMD_PUFF_THRESHOLD,
    C.AT_CMD_PUFF_STRONG_THRESHOLD, C.AT_CMD_SIP_STRONG_THRESHOLD, C.AT_CMD_ORIENTATION_ANGLE, C.AT_CMD_THRESHOLD_DOUBLEPRESS, C.AT_CMD_THRESHOLD_LONGPRESS,
    C.AT_CMD_THRESHOLD_AUTODWELL, C.AT_CMD_ANTITREMOR_PRESS, C.AT_CMD_ANTITREMOR_RELEASE, C.AT_CMD_ANTITREMOR_IDLE, C.AT_CMD_SET_COLOR];

C.AT_CMD_CAT_KEYBOARD = 'AT_CMD_CAT_KEYBOARD';
C.AT_CMD_CAT_MOUSE = 'AT_CMD_CAT_MOUSE';
C.AT_CMD_CAT_JOYSTICK = 'AT_CMD_CAT_JOYSTICK';
C.AT_CMD_CAT_DEVICE = 'AT_CMD_CAT_DEVICE';
C.AT_CMD_CAT_IR = 'AT_CMD_CAT_IR';
C.AT_CMD_CAT_MACRO = 'AT_CMD_CAT_MACRO';

C.INPUTFIELD_TYPE_KEYBOARD = 'INPUTFIELD_TYPE_KEYBOARD';
C.INPUTFIELD_TYPE_TEXT = 'INPUTFIELD_TYPE_TEXT';
C.INPUTFIELD_TYPE_NUMBER = 'INPUTFIELD_TYPE_NUMBER';
C.INPUTFIELD_TYPE_SELECT = 'INPUTFIELD_TYPE_SELECT';
C.INPUTFIELD_TYPE_MACRO = 'INPUTFIELD_TYPE_MACRO';

C.AT_CMDS_ACTIONS = [{
    cmd: C.AT_CMD_NO_CMD,
    label: 'No command // Keine Funktion',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_L,
    label: 'Hold left mouse button (as long as input action) // Linke Maustaste halten (f??r Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold left mouse button // Linke Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_R,
    label: 'Hold right mouse button (as long as input action) // Rechte Maustaste halten (f??r Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold right mouse button // Rechte Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_M,
    label: 'Hold middle mouse button (as long as input action) // Mittlere Maustaste halten (f??r Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold middle mouse button // Mittlere Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_CLICK_MOUSE_L,
    label: 'Click left mouse button // Klick linke Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_CLICK_MOUSE_R,
    label: 'Click right mouse button // Klick rechte Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_CLICK_MOUSE_M,
    label: 'Click middle mouse button (wheel) // Klick mittlere Maustaste (Mausrad)',
    shortLabel: 'Click middle mouse button // Klick mittlere Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_DOUBLECLICK_MOUSE_L,
    label: 'Double click left mouse button // Doppelklick linke Maustaste',
    shortLabel: 'Double click mouse left // Doppelklick linke Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_L,
    label: 'Press or release left mouse button (toggle) // Dr??cken oder Loslassen linke Maustaste (wechseln)',
    shortLabel: 'Toggle left mouse button // Umschalten linke Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_R,
    label: 'Press or release right mouse button (toggle) // Dr??cken oder Loslassen rechte Maustaste (wechseln)',
    shortLabel: 'Toggle right mouse button // Umschalten rechte Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_M,
    label: 'Press or release middle mouse button (toggle) // Dr??cken oder Loslassen mittlere Maustaste (wechseln)',
    shortLabel: 'Toggle middle mouse button // Umschalten mittlere Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_RELEASE_MOUSE_L,
    label: 'Release left mouse button // Linke Maustaste loslassen',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_RELEASE_MOUSE_R,
    label: 'Release right mouse button // Rechte Maustaste loslassen',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_RELEASE_MOUSE_M,
    label: 'Release middle mouse button // Mittlere Maustaste loslassen',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSEWHEEL_UP,
    label: 'Scroll down // Nach unten scrollen',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSEWHEEL_DOWN,
    label: 'Scroll up // Nach oben scrollen',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_MOVEX,
    label: 'Move mouse horizontally (x-axis) // Maus horizontal bewegen (x-Achse)',
    shortLabel: 'Move mouse x-axis // Mausbewegung x-Achse',
    category: C.AT_CMD_CAT_MOUSE,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_MOUSE_MOVEY,
    label: 'Move mouse vertically (y-axis) // Maus vertikal bewegen (y-Achse)',
    shortLabel: 'Move mouse x-axis // Mausbewegung y-Achse',
    category: C.AT_CMD_CAT_MOUSE,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_KEYHOLD,
    label: 'Hold key(s) (as long as input action) // Taste(n) halten (f??r Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold key(s) // Taste(n) halten',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_KEYPRESS,
    label: 'Press key(s) + release automatically // Taste(n) dr??cken + wieder loslassen',
    shortLabel: 'Press key(s) // Taste(n) dr??cken',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_KEYTOGGLE,
    label: 'Press or release key(s) (toggle) // Taste(n) dr??cken oder auslassen (wechseln)',
    shortLabel: 'Press/release key(s) // Taste(n) dr??cken/auslassen',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_WRITEWORD,
    label: 'Write word // Schreibe Wort',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_TEXT
}, {
    cmd: C.AT_CMD_KEYRELEASE,
    label: 'Release specific key(s) // Spezifische Taste(n) auslassen',
    shortLabel: 'Release key(s) // Taste(n) auslassen',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_KEYRELEASEALL,
    label: 'Release all key(s) // Alle Taste(n) auslassen',
    shortLabel: 'Release key(s) // Taste(n) auslassen',
    category: C.AT_CMD_CAT_KEYBOARD
}, {
    cmd: C.AT_CMD_NEXT_SLOT,
    label: 'Load next slot // N??chsten Slot laden',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_LOAD_SLOT,
    label: 'Load slot by name // Slot per Name laden',
    category: C.AT_CMD_CAT_DEVICE,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: ATDevice.getSlots
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
    label: 'Press joystick button // Joystick-Button dr??cken',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_BUTTON_RELEASE,
    label: 'Release joystick button // Joystick-Button auslassen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_HAT_POS,
    label: 'Set joystick hat position // Joystick Hat-Position setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_MACRO,
    label: 'Custom macro // Benutzerdefiniertes Makro',
    category: C.AT_CMD_CAT_MACRO,
    input: C.INPUTFIELD_TYPE_MACRO
}];

C.AT_CMDS_MACRO = [{
    cmd: C.AT_CMD_WAIT,
    label: 'Wait time in milliseconds // Warten (Millisekunden)',
    input: C.INPUTFIELD_TYPE_NUMBER
}];

// keycode stuff
C.KEYCODE_MAPPING = [];
C.PRINTABLE_KEYCODES = [];
C.KEYCODE_PREFIX = 'KEY_';
C.JS_KEYCODE_SHIFT = 16;
C.JS_KEYCODE_CTRL = 17;
C.JS_KEYCODE_ALT = 18;
C.JS_KEYCODE_BACKSPACE = 8;
C.JS_KEYCODE_SPACE = 32;
C.JS_KEYCODE_TAB = 9;
C.JS_KEYCODE_GUI = 91; //Windows / Mac key
C.JS_KEYCODE_F5 = 116;

//A-Z
for (var code = 65; code <= 90; code++) {
    C.KEYCODE_MAPPING[code] = C.KEYCODE_PREFIX + String.fromCharCode(code);
    C.PRINTABLE_KEYCODES.push(code);
}

//0-9
for (var code = 48; code <= 57; code++) {
    C.KEYCODE_MAPPING[code] = C.KEYCODE_PREFIX + String.fromCharCode(code);
    C.PRINTABLE_KEYCODES.push(code);
}

//F1-F12
for (var code = 112; code <= 123; code++) {
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
C.KEYCODE_MAPPING[92] = 'KEY_RIGHT_GUI';

C.SUPPORTED_KEYCODES = [];
for (var i = 0; i < 300; i++) {
    if (C.KEYCODE_MAPPING[i]) {
        C.SUPPORTED_KEYCODES.push(i);
    }
}

C.ERROR_FIRMWARE_OUTDATED = 'ERROR_FIRMWARE_OUTDATED';
C.ERROR_SERIAL_DENIED = 'ERROR_SERIAL_DENIED';
C.ERROR_SERIAL_BUSY = 'ERROR_SERIAL_BUSY';
C.ERROR_CONNECTION_LOST = 'ERROR_CONNECTION_LOST';
C.ERROR_SERIAL_NOT_SUPPORTED = 'ERROR_SERIAL_NOT_SUPPORTED';

C.SUCCESS_FIRMWAREUPDATE = 'fwupdatesuccess';

//live values
C.LIVE_PRESSURE = 'LIVE_PRESSURE';
C.LIVE_PRESSURE_MIN = 'LIVE_PRESSURE_MIN';
C.LIVE_PRESSURE_MAX = 'LIVE_PRESSURE_MAX';