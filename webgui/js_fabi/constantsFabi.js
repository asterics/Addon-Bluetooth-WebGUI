import {TabSlots} from "../js/ui/views/TabSlots.js";
import {TabActions} from "../js/ui/views/TabActions.js";
import {TabGeneral} from "../js/ui/views/TabGeneral.js";
import {TabTimings} from "./ui/views/TabTimings.js";

window.C = window.C || {};

C.CURRENT_DEVICE = C.AT_DEVICE_FABI;
C.DEVICE_IS_FABI = true;
C.DEVICE_IS_FM = false;
C.MIN_FIRMWARE_VERSION = '2.5.0';

C.USB_DEVICE_FILTERS =  [
    {usbVendorId: 0x2341} // Arduino Pro Micro
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
C.BTN_CATEGORIES = [{
    constant: C.BTN_CAT_BTN,
    label: 'Buttons'
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
}, ];