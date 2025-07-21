import { ATDevice } from "./communication/ATDevice.js";

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

C.AT_CMD_JOYSTICK_AXIS0 = 'AT J0';
C.AT_CMD_JOYSTICK_AXIS1 = 'AT J1';
C.AT_CMD_JOYSTICK_AXIS2 = 'AT J2';
C.AT_CMD_JOYSTICK_AXIS3 = 'AT J3';
C.AT_CMD_JOYSTICK_AXIS4 = 'AT J4';
C.AT_CMD_JOYSTICK_AXIS5 = 'AT J5';
C.AT_CMD_JOYSTICK_BUTTON_PRESS = 'AT JP';
C.AT_CMD_JOYSTICK_BUTTON_RELEASE = 'AT JR';
C.AT_CMD_JOYSTICK_HAT_POS = 'AT JH';

C.AT_CMD_WRITEWORD = 'AT KW';
C.AT_CMD_KEYPRESS = 'AT KP';
C.AT_CMD_KEYHOLD = 'AT KH';
C.AT_CMD_KEYTOGGLE = 'AT KT';
C.AT_CMD_KEYRELEASE = 'AT KR';
C.AT_CMD_KEYRELEASEALL = 'AT RA';

// AT commands - Macro specific
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
C.AT_CMD_BUZZER_MODE = 'AT AB';
C.AT_CMD_SET_COLOR = 'AT SC';
C.AT_CMD_KEYBOARD_LAYOUT = 'AT KL'; 

C.DEVICE_MODE_USB = 1;
C.DEVICE_MODE_BT = 2;
C.DEVICE_MODE_USB_BT = 3;

C.AT_CMD_STICK_MODE = 'AT MM';
C.AT_CMD_START_REPORTING_LIVE = 'AT SR';
C.AT_CMD_STOP_REPORTING_LIVE = 'AT ER';
C.AT_CMD_CALIBRATION = 'AT CA';
C.AT_CMD_SENSITIVITY_X = 'AT AX';
C.AT_CMD_SENSITIVITY_Y = 'AT AY';
C.AT_CMD_DEADZONE_X = 'AT DX';
C.AT_CMD_DEADZONE_Y = 'AT DY';
C.AT_CMD_MAX_SPEED = 'AT MS';
C.AT_CMD_ACCELERATION = 'AT AC';
C.AT_CMD_SENSORBOARD = 'AT SB';

C.AT_CMD_SIP_THRESHOLD = 'AT TS';
C.AT_CMD_PUFF_THRESHOLD = 'AT TP';
C.AT_CMD_PUFF_STRONG_THRESHOLD = 'AT SP';
C.AT_CMD_SIP_STRONG_THRESHOLD = 'AT SS';

// AT commands - Infrared specific
C.AT_CMD_IR_RECORD = 'AT IR';
C.AT_CMD_IR_PLAY = 'AT IP';
C.AT_CMD_IR_HOLD = 'AT IH';
C.AT_CMD_IR_STOP = 'AT IS';
C.AT_CMD_IR_DELETE = 'AT IC';
C.AT_CMD_IR_WIPE = 'AT IW';
C.AT_CMD_IR_LIST = 'AT IL';
C.AT_CMD_IR_TIMEOUT = 'AT IT';

// AT commands - Macro specific
C.AT_CMD_MACRO = 'AT MA';
C.AT_CMD_WAIT = 'AT WA';

// AT commands - Audio specific
C.AT_CMD_AUDIO_TRANSMISSION = 'AT AT';
C.AT_CMD_AUDIO_VOLUME = 'AT AV';
C.AT_CMD_AUDIO_REMOVE = 'AT AR';
C.AT_CMD_AUDIO_PLAY   = 'AT AP';

// AT commands - Timing specific
C.AT_CMD_THRESHOLD_AUTODWELL = 'AT AD';
C.AT_CMD_THRESHOLD_LONGPRESS = 'AT LP'; 
C.AT_CMD_THRESHOLD_MULTIPRESS = 'AT MP';
// TBD: handle long press / multi press  etc, decide if/how to integrate anti-tremor timings ...
// C.AT_CMD_ANTITREMOR_PRESS = 'AT AP';
// C.AT_CMD_ANTITREMOR_RELEASE = 'AT AR';
// C.AT_CMD_ANTITREMOR_IDLE = 'AT AI';


// Constants for live values (sent from the device)
C.LIVE_VALUE_CONSTANT = 'VALUES:';


// AT command selection for slot settings (TBD: enable global settings in specific data structure, not only per slot-settings)
C.AT_CMDS_SETTINGS = [C.AT_CMD_BTN_MODE, C.AT_CMD_DEVICE_MODE, C.AT_CMD_SENSITIVITY_X, C.AT_CMD_SENSITIVITY_Y, C.AT_CMD_DEADZONE_X, C.AT_CMD_DEADZONE_Y,
C.AT_CMD_MAX_SPEED, C.AT_CMD_ACCELERATION, C.AT_CMD_STICK_MODE, C.AT_CMD_SIP_THRESHOLD, C.AT_CMD_PUFF_THRESHOLD, C.AT_CMD_PUFF_STRONG_THRESHOLD, 
C.AT_CMD_SIP_STRONG_THRESHOLD, C.AT_CMD_ORIENTATION_ANGLE, C.AT_CMD_THRESHOLD_AUTODWELL, C.AT_CMD_THRESHOLD_LONGPRESS,  C.AT_CMD_THRESHOLD_MULTIPRESS,
C.AT_CMD_SET_COLOR, C.AT_CMD_SENSORBOARD, C.AT_CMD_KEYBOARD_LAYOUT, C.AT_CMD_AUDIO_VOLUME, C.AT_CMD_BUZZER_MODE];


// AT command categories
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


// AT command selection for button actions and their description
C.AT_CMDS_ACTIONS = [{
    cmd: C.AT_CMD_NO_CMD,
    label: 'No command (empty) // Keine Funktion (leer)',
    shortLabel: '(empty) // (leer)',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_L,
    label: 'Hold left mouse button (as long as input action) // Linke Maustaste halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold left mouse button // Linke Maustaste halten',
    macroLabel: 'Hold left mouse button // Linke Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_R,
    label: 'Hold right mouse button (as long as input action) // Rechte Maustaste halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold right mouse button // Rechte Maustaste halten',
    macroLabel: 'Hold right mouse button // Rechte Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_M,
    label: 'Hold middle mouse button (as long as input action) // Mittlere Maustaste halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold middle mouse button // Mittlere Maustaste halten',
    macroLabel: 'Hold middle mouse button // Mittlere Maustaste halten',
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
    label: 'Press or release left mouse button (toggle) // Drücken oder Loslassen linke Maustaste (umschalten)',
    shortLabel: 'Toggle left mouse button // Umschalten linke Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_R,
    label: 'Press or release right mouse button (toggle) // Drücken oder Loslassen rechte Maustaste (umschalten)',
    shortLabel: 'Toggle right mouse button // Umschalten rechte Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_M,
    label: 'Press or release middle mouse button (toggle) // Drücken oder Loslassen mittlere Maustaste (umschalten)',
    shortLabel: 'Toggle middle mouse button // Umschalten mittlere Maustaste',
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
    shortLabel: 'Move mouse y-axis // Mausbewegung y-Achse',
    category: C.AT_CMD_CAT_MOUSE,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_KEYHOLD,
    label: 'Hold key(s) (as long as input action) // Taste(n) halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold key(s) // Taste(n) halten',
    macroLabel: 'Hold key(s) // Taste(n) halten',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_KEYPRESS,
    label: 'Press key(s) + release automatically // Taste(n) drücken + wieder loslassen',
    shortLabel: 'Press key(s) // Taste(n) drücken',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_KEYTOGGLE,
    label: 'Press or release key(s) (toggle) // Taste(n) drücken oder auslassen (umschalten)',
    shortLabel: 'Press/release key(s) // Taste(n) drücken/auslassen',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_KEYBOARD
}, {
    cmd: C.AT_CMD_WRITEWORD,
    label: 'Write word // Schreibe Wort',
    category: C.AT_CMD_CAT_KEYBOARD,
    input: C.INPUTFIELD_TYPE_TEXT
}, {
    cmd: C.AT_CMD_NEXT_SLOT,
    label: 'Load next slot // Nächsten Slot laden',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_LOAD_SLOT,
    label: 'Load slot by name // Slot per Name laden',
    category: C.AT_CMD_CAT_DEVICE,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: ATDevice.getSlots
}, { 
    cmd: C.AT_CMD_CALIBRATION,
    label: 'Calibrate stick middle position // Stick-Mittelposition kalibrieren',
    shortLabel: 'Calibrate stick // Stick kalibrieren',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_IR_PLAY,
    label: 'Play infrared command // Infrarot-Kommando abspielen',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: ATDevice.getIRCommands
}, {
    cmd: C.AT_CMD_IR_HOLD,
    label: 'Hold infrared command (as long as input action) // Infrarot-Kommando halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold IR command // IR-Kommando halten',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: ATDevice.getIRCommands
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS0,
    label: 'Joystick 1 set x-axis // Joystick 1 x-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS1,
    label: 'Joystick 1 set y-axis // Joystick 1 y-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS2,
    label: 'Joystick 2 set x-axis // Joystick 2 x-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS3,
    label: 'Joystick 2 set y-axis // Joystick 2 y-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS4,
    label: 'Joystick 3 set x-axis // Joystick 3 x-Achse setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_AXIS5,
    label: 'Joystick 3 set y-axis // Joystick 3 y-Achse setzen',
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
}, {
    cmd: C.AT_CMD_MACRO,
    label: 'Custom macro // Benutzerdefiniertes Makro',
    category: C.AT_CMD_CAT_MACRO,
    input: C.INPUTFIELD_TYPE_MACRO
}];

// AT command selection for macro actions (additional to the AT commands for button actions)
C.AT_CMDS_MACRO = C.AT_CMDS_MACRO || [];
C.AT_CMDS_MACRO = [{
    cmd: C.AT_CMD_WAIT,
    label: 'Wait time in milliseconds // Warten (Millisekunden)',
    input: C.INPUTFIELD_TYPE_NUMBER
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
} ];
