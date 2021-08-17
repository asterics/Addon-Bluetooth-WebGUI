import {TabSlots} from "../js/ui/views/TabSlots.js";
import {TabActions} from "../js/ui/views/TabActions.js";
import {TabGeneral} from "../js/ui/views/TabGeneral.js";
import {TabTimings} from "./ui/views/TabTimings.js";
import {TabSipPuff} from "../js/ui/views/TabSipPuff.js";

window.C = window.C || {};

C.CURRENT_DEVICE = C.AT_DEVICE_FABI;
C.DEVICE_IS_FABI = true;
C.DEVICE_IS_FM = false;
C.MIN_FIRMWARE_VERSION = '2.5.0';

C.USB_DEVICE_FILTERS =  [
    {usbVendorId: 0x2341, usbProductId: 0x8037} // Arduino Pro Micro
];

C.VIEWS = [{
    object: TabActions,
    hash: '#tabActions',
    label: 'Actions // Aktionen'
}, {
    object: TabTimings,
    hash: '#tabTimings',
    label: 'Timings'
}, {
    object: TabSipPuff,
    hash: '#tabPuff',
    label: 'Sip and Puff // Saug-Puste-Steuerung'
}, {
    object: TabSlots,
    hash: '#tabSlots',
    label: 'Slots // Slots'
}, {
    object: TabGeneral,
    hash: '#tabGeneral',
    label: 'General // Allgemein'
}];

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
    constant: C.AT_CMD_CAT_MACRO,
    label: 'Macro // Makro'
}];

C.BTN_CAT_BTN = 'BTN_CAT_BTN';
C.BTN_CAT_BTN_LONGPRESS = 'BTN_CAT_BTN_LONGPRESS';
C.BTN_CAT_SIPPUFF = 'BTN_CAT_SIPPUFF';
C.BTN_CATEGORIES = [{
    constant: C.BTN_CAT_BTN,
    label: 'Buttons'
}, {
    constant: C.BTN_CAT_SIPPUFF,
    label: 'Sip/Puff // Ansaugen/Pusten'
}]

C.BTN_CATEGORIES_LONGPRESS = [{
    constant: C.BTN_CAT_BTN,
    label: 'Buttons'
}, {
    constant: C.BTN_CAT_BTN_LONGPRESS,
    label: 'Buttons long press // Buttons lange drücken'
}, {
    constant: C.BTN_CAT_SIPPUFF,
    label: 'Sip/Puff // Ansaugen/Pusten'
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

C.BTN_MODES_LONGPRESS = [{
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
    label: 'Button 1 long press // Button 1 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
}, {
    index: 8,
    label: 'Button 2 long press // Button 2 lange drücken',
    category: C.BTN_CAT_BTN_LONGPRESS
},  {
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