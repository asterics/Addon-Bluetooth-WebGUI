window.C = {};

C.GUI_IS_HOSTED = window.location.href.indexOf('localhost') > -1 || window.location.href.indexOf('asterics.github.io') > -1 || window.location.href.indexOf('file://') > -1;
C.GUI_IS_ON_DEVICE = !C.GUI_IS_HOSTED;
C.GUI_IS_MOCKED_VERSION = window.location.href.indexOf('mock') > -1;
C.IS_ELECTRON = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;
C.ELECTRON_CONFIG_FILENAME = 'FLipMouseGUIConfiguration';
C.IS_TOUCH_DEVICE = 'ontouchstart' in document.documentElement;

C.ARE_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':8092/ws/astericsData';
C.FLIP_WEBSOCKET_URL = 'ws://' + window.location.hostname + ':1804/';
C.LIVE_VALUE_CONSTANT = 'VALUES:';

C.MAX_LENGTH_ATCMD = 400;
C.LENGTH_ATCMD_PREFIX = 6; //with space (e.g. "AT KW ")
C.AT_CMD_WRITEWORD = 'AT KW';
C.AT_CMD_KEYPRESS = 'AT KP';
C.AT_CMD_KEYHOLD = 'AT KH';
C.AT_CMD_KEYTOGGLE = 'AT KT';
C.AT_CMD_KEYRELEASE = 'AT KR';
C.AT_CMD_KEYRELEASEALL = 'AT RA';
C.AT_CMD_BTN_MODE = 'AT BM';

C.AT_CMD_CLICK_MOUSE_L = 'AT CL';
C.AT_CMD_CLICK_MOUSE_R = 'AT CR';
C.AT_CMD_CLICK_MOUSE_M = 'AT CM';
C.AT_CMD_DOUBLECLICK_MOUSE_L = 'AT CD';
C.AT_CMD_MOUSE_TOGGLE_L = 'AT TL';
C.AT_CMD_MOUSE_TOGGLE_R = 'AT TR';
C.AT_CMD_MOUSE_TOGGLE_M = 'AT TM';
C.AT_CMD_HOLD_MOUSE_L = 'AT HL';
C.AT_CMD_HOLD_MOUSE_R = 'AT HR';
C.AT_CMD_HOLD_MOUSE_M = 'AT HM';
C.AT_CMD_RELEASE_MOUSE_L = 'AT RL';
C.AT_CMD_RELEASE_MOUSE_R = 'AT RR';
C.AT_CMD_RELEASE_MOUSE_M = 'AT RM';
C.AT_CMD_MOUSEWHEEL_UP = 'AT WU';
C.AT_CMD_MOUSEWHEEL_DOWN = 'AT WD';

C.AT_CMDS_MOUSE = [C.AT_CMD_CLICK_MOUSE_L, C.AT_CMD_CLICK_MOUSE_R, C.AT_CMD_CLICK_MOUSE_M, C.AT_CMD_DOUBLECLICK_MOUSE_L, C.AT_CMD_HOLD_MOUSE_L, C.AT_CMD_HOLD_MOUSE_R, C.AT_CMD_HOLD_MOUSE_M, C.AT_CMD_RELEASE_MOUSE_L, C.AT_CMD_RELEASE_MOUSE_R, C.AT_CMD_RELEASE_MOUSE_M, C.AT_CMD_MOUSEWHEEL_UP, C.AT_CMD_MOUSEWHEEL_DOWN];

C.AT_CMD_CALIBRATION = 'AT CA';
C.AT_CMD_NEXT_SLOT = 'AT NE';
C.AT_CMD_LOAD_SLOT = 'AT LO';
C.AT_CMD_MAKRO = 'AT MA';
C.AT_CMD_NO_CMD = 'AT NC';
C.AT_CMD_UPGRADE_ADDON = 'AT UG';

C.AT_CMD_JOYSTICK_X = 'AT JX';
C.AT_CMD_JOYSTICK_Y = 'AT JY';
C.AT_CMD_JOYSTICK_Z = 'AT JZ';
C.AT_CMD_JOYSTICK_ZTURN = 'AT JT';
C.AT_CMD_JOYSTICK_SLIDER = 'AT JS';
C.AT_CMD_JOYSTICK_BUTTON_PRESS = 'AT JP';
C.AT_CMD_JOYSTICK_BUTTON_RELEASE = 'AT JR';
C.AT_CMD_JOYSTICK_HAT_POS = 'AT JH';

C.AT_CMD_MQTT_PUBLISH = 'AT MQ';
C.AT_CMD_REST = 'AT RE';

C.AT_CMD_IR_RECORD = 'AT IR';
C.AT_CMD_IR_PLAY = 'AT IP';
C.AT_CMD_IR_HOLD = 'AT IH';
C.AT_CMD_IR_STOP = 'AT IS';
C.AT_CMD_IR_DELETE = 'AT IC';
C.AT_CMD_IR_WIPE = 'AT IW';
C.AT_CMD_IR_LIST = 'AT IL';

C.AT_CMD_MQTT_BROKER = 'AT MH';
C.AT_CMD_MQTT_DELIMITER = 'AT ML';
C.AT_CMD_WIFI_NAME = 'AT WH';
C.AT_CMD_WIFI_PASSWORD = 'AT WP';

C.AT_CMDS_FLIP = [C.AT_CMD_CALIBRATION, C.AT_CMD_NEXT_SLOT, C.AT_CMD_LOAD_SLOT, C.AT_CMD_MQTT_PUBLISH, C.AT_CMD_REST, C.AT_CMD_NO_CMD];

C.AT_CMD_CAT_KEYBOARD = 'AT_CMD_CAT_KEYBOARD';
C.AT_CMD_CAT_MOUSE = 'AT_CMD_CAT_MOUSE';
C.AT_CMD_CAT_JOYSTICK = 'AT_CMD_CAT_JOYSTICK';
C.AT_CMD_CAT_DEVICE = 'AT_CMD_CAT_DEVICE';
C.AT_CMD_CAT_IR = 'AT_CMD_CAT_IR';
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
}];

C.INPUTFIELD_TYPE_KEYBOARD = 'INPUTFIELD_TYPE_KEYBOARD';
C.INPUTFIELD_TYPE_TEXT = 'INPUTFIELD_TYPE_TEXT';
C.INPUTFIELD_TYPE_NUMBER = 'INPUTFIELD_TYPE_NUMBER';
C.INPUTFIELD_TYPE_SELECT = 'INPUTFIELD_TYPE_SELECT';

C.AT_CMDS_ACTIONS = [{
    cmd: C.AT_CMD_NO_CMD,
    label: 'No command // Keine Funktion',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_L,
    label: 'Hold left mouse button (as long as input action) // Linke Maustaste halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold left mouse button // Linke Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_R,
    label: 'Hold right mouse button (as long as input action) // Rechte Maustaste halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold right mouse button // Rechte Maustaste halten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_HOLD_MOUSE_M,
    label: 'Hold middle mouse button (as long as input action) // Mittlere Maustaste halten (für Dauer der Eingabe-Aktion)',
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
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_L,
    label: 'Press or release left mouse button (toggle) // Drücken oder Loslassen linke Maustaste (wechseln)',
    shortLabel: 'Press/release left mouse button // Drücken/Loslassen linke Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_R,
    label: 'Press or release right mouse button (toggle) // Drücken oder Loslassen rechte Maustaste (wechseln)',
    shortLabel: 'Press/release right mouse button // Drücken/Loslassen rechte Maustaste',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSE_TOGGLE_M,
    label: 'Press or release middle mouse button (toggle) // Drücken oder Loslassen mittlere Maustaste (wechseln)',
    shortLabel: 'Press/release middle mouse button // Drücken/Loslassen mittlere Maustaste',
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
    label: 'Mouse wheel up // Mausrad nach oben',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_MOUSEWHEEL_DOWN,
    label: 'Mouse wheel down // Mausrad nach unten',
    category: C.AT_CMD_CAT_MOUSE
}, {
    cmd: C.AT_CMD_KEYHOLD,
    label: 'Hold key(s) (as long as input action) // Taste(n) halten (für Dauer der Eingabe-Aktion)',
    shortLabel: 'Hold key(s) // Taste(n) halten',
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
    label: 'Press or release key(s) (toggle) // Taste(n) drücken oder auslassen (wechseln)',
    shortLabel: 'Press/release key(s) // Taste(n) drücken/auslassen',
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
    label: 'Load next slot // Nächsten Slot laden',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_LOAD_SLOT,
    label: 'Load slot by name // Slot per Name laden',
    category: C.AT_CMD_CAT_DEVICE,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: 'flip.getSlots'
}, {
    cmd: C.AT_CMD_CALIBRATION,
    label: 'Calibrate stick middle position // Stick-Mittelposition kalibrieren',
    category: C.AT_CMD_CAT_DEVICE
}, {
    cmd: C.AT_CMD_IR_PLAY,
    label: 'Play infrared command // Infrarot-Kommando abspielen',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: 'flip.getIRCommands'
}, {
    cmd: C.AT_CMD_IR_HOLD,
    label: 'Hold infrared command // Infrarot-Kommando halten',
    category: C.AT_CMD_CAT_IR,
    input: C.INPUTFIELD_TYPE_SELECT,
    optionsFn: 'flip.getIRCommands'
}, {
    cmd: C.AT_CMD_IR_STOP,
    label: 'Stop infrared command // Infrarot-Kommando stoppen',
    category: C.AT_CMD_CAT_IR
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
    label: 'Press joystick button // Joystick-Button drücken',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_BUTTON_RELEASE,
    label: 'Release joystick button // Joystick-Button auslassen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}, {
    cmd: C.AT_CMD_JOYSTICK_HAT_POS,
    label: 'Set hat switch position // Joystick Rundblickschalter-Position setzen',
    category: C.AT_CMD_CAT_JOYSTICK,
    input: C.INPUTFIELD_TYPE_NUMBER
}];

C.ADDITIONAL_FIELD_TEXT = 'ADDITIONAL_FIELD_TEXT';
C.ADDITIONAL_FIELD_SELECT = 'ADDITIONAL_FIELD_SELECT';
C.ADDITIONAL_DATA_CMDS = [C.AT_CMD_LOAD_SLOT, C.AT_CMD_KEYPRESS, C.AT_CMD_WRITEWORD];

C.KEYCODE_MAPPING = [];
C.PRINTABLE_KEYCODES = [];
C.KEYCODE_PREFIX = 'KEY_';
C.FLIP_KEYCODE_ALT_GR = 'KEY_RIGHT_ALT'; //is really Ctrl + Alt
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

C.DEFAULT_CONFIGURATION = ['AT AX 60', 'AT AY 60', 'AT DX 20', 'AT DY 20', 'AT MS 50', 'AT AC 50', 'AT TS 500', 'AT TP 525', 'AT WS 3', 'AT SP 700', 'AT SS 300', 'AT MM 1', 'AT GU 50', 'AT GD 50', 'AT GL 50', 'AT GR 50', 'AT RO 0', 'AT BT 1', 'AT BM 01', 'AT NE', 'AT BM 02', 'AT KP KEY_ESC', 'AT BM 03', 'AT NC', 'AT BM 04', 'AT KP KEY_UP', 'AT BM 05', 'AT KP KEY_DOWN', 'AT BM 06', 'AT KP KEY_LEFT', 'AT BM 07', 'AT KP KEY_RIGHT', 'AT BM 08', 'AT PL', 'AT BM 09', 'AT NC', 'AT BM 10', 'AT CR', 'AT BM 11', 'AT CA', 'AT BM 12', 'AT NC', 'AT BM 13', 'AT NC', 'AT BM 14', 'AT NC', 'AT BM 15', 'AT NC', 'AT BM 16', 'AT NC', 'AT BM 17', 'AT NC', 'AT BM 18', 'AT NC', 'AT BM 19', 'AT NC'];
C.DEFAULT_SLOTNAME = 'mouse';

C.BTN_MODE_BUTTON_1 = 'BTN_MODE_BUTTON_1';
C.BTN_MODE_BUTTON_2 = 'BTN_MODE_BUTTON_2';
C.BTN_MODE_BUTTON_3 = 'BTN_MODE_BUTTON_3';
C.BTN_MODE_STICK_UP = 'BTN_MODE_STICK_UP';
C.BTN_MODE_STICK_DOWN = 'BTN_MODE_STICK_DOWN';
C.BTN_MODE_STICK_LEFT = 'BTN_MODE_STICK_LEFT';
C.BTN_MODE_STICK_RIGHT = 'BTN_MODE_STICK_RIGHT';
C.BTN_MODE_SIP = 'BTN_MODE_SIP';
C.BTN_MODE_STRONG_SIP = 'BTN_MODE_STRONG_SIP';
C.BTN_MODE_PUFF = 'BTN_MODE_PUFF';
C.BTN_MODE_STRONG_PUFF = 'BTN_MODE_STRONG_PUFF';
C.BTN_MODE_STRONG_SIP_UP = 'BTN_MODE_STRONG_SIP_UP';
C.BTN_MODE_STRONG_SIP_DOWN = 'BTN_MODE_STRONG_SIP_DOWN';
C.BTN_MODE_STRONG_SIP_LEFT = 'BTN_MODE_STRONG_SIP_LEFT';
C.BTN_MODE_STRONG_SIP_RIGHT = 'BTN_MODE_STRONG_SIP_RIGHT';
C.BTN_MODES = [C.BTN_MODE_BUTTON_1, C.BTN_MODE_BUTTON_2, C.BTN_MODE_BUTTON_3,
    C.BTN_MODE_STICK_UP, C.BTN_MODE_STICK_DOWN, C.BTN_MODE_STICK_LEFT, C.BTN_MODE_STICK_RIGHT,
    C.BTN_MODE_SIP, C.BTN_MODE_STRONG_SIP, C.BTN_MODE_PUFF, C.BTN_MODE_STRONG_PUFF];
C.BTN_MODES_WITHOUT_STICK = [C.BTN_MODE_BUTTON_1, C.BTN_MODE_BUTTON_2, C.BTN_MODE_BUTTON_3,
    C.BTN_MODE_SIP, C.BTN_MODE_STRONG_SIP, C.BTN_MODE_PUFF, C.BTN_MODE_STRONG_PUFF];

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

C.BTN_MODES2 = [{
    constant: C.BTN_MODE_BUTTON_1,
    index: 1,
    label: 'Button 1',
    category: C.BTN_CAT_BTN
}, {
    constant: C.BTN_MODE_BUTTON_2,
    index: 2,
    label: 'Button 2',
    category: C.BTN_CAT_BTN
}, {
    constant: C.BTN_MODE_BUTTON_3,
    index: 3,
    label: 'Button 3',
    category: C.BTN_CAT_BTN
}, {
    constant: C.BTN_MODE_STICK_UP,
    index: 4,
    label: 'Stick Up // Stick nach oben',
    category: C.BTN_CAT_STICK
}, {
    constant: C.BTN_MODE_STICK_DOWN,
    index: 5,
    label: 'Stick Down // Stick nach unten',
    category: C.BTN_CAT_STICK
}, {
    constant: C.BTN_MODE_STICK_LEFT,
    index: 6,
    label: 'Stick Left // Stick nach links',
    category: C.BTN_CAT_STICK
}, {
    constant: C.BTN_MODE_STICK_RIGHT,
    index: 7,
    label: 'Stick Right // Stick nach rechts',
    category: C.BTN_CAT_STICK
}, {
    constant: C.BTN_MODE_SIP,
    index: 8,
    label: 'Sip // Ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    constant: C.BTN_MODE_STRONG_SIP,
    index: 9,
    label: 'Strong sip // Stark ansaugen',
    category: C.BTN_CAT_SIPPUFF
}, {
    constant: C.BTN_MODE_STRONG_SIP,
    index: 10,
    label: 'Puff // Pusten',
    category: C.BTN_CAT_SIPPUFF
}, {
    constant: C.BTN_MODE_STRONG_SIP,
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

C.LEARN_CAT_KEYBOARD = 'LEARN_CAT_KEYBOARD';
C.LEARN_CAT_MOUSE = 'LEARN_CAT_MOUSE';
C.LEARN_CAT_IR = 'LEARN_CAT_IR';
C.LEARN_CAT_FLIPACTIONS = 'LEARN_CAT_FLIPACTIONS';
C.LEARN_CAT_CUSTOM = 'LEARN_CAT_CUSTOM';

C.FLIPMOUSE_MODE_MOUSE = {
    value: 1,
    label: 'Mouse movement // Mausbewegung'
};
C.FLIPMOUSE_MODE_ALT = {
    value: 0,
    label: 'Alternative actions // Alternative Aktionen',
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
C.FLIPMOUSE_MODES = [C.FLIPMOUSE_MODE_MOUSE, C.FLIPMOUSE_MODE_ALT, C.FLIPMOUSE_MODE_JOYSTICK_XY, C.FLIPMOUSE_MODE_JOYSTICK_ZR, C.FLIPMOUSE_MODE_JOYSTICK_SLIDERS];
