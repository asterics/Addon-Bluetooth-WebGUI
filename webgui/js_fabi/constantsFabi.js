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
C.MAX_NUMBER_SLOTS = 10;
C.MAX_LENGTH_SLOTNAME = 11;

C.USB_DEVICE_FILTERS =  [
    {usbVendorId: 0x2341, usbProductId: 0x8037} // Arduino Pro Micro
];

C.VIEWS = [{
    object: TabActions,
    hash: '#tabActions',
    label: 'Actions // Aktionen'
}, {
    object: TabSlots,
    hash: '#tabSlots',
    label: 'Slots // Slots'
}, {
    object: TabTimings,
    hash: '#tabTimings',
    label: 'Timings'
}, {
    object: TabSipPuff,
    hash: '#tabPuff',
    label: 'Sip and Puff // Saug-Puste-Steuerung'
}, {
    object: TabGeneral,
    hash: '#tabGeneral',
    label: 'General // Allgemein'
}];
C.VIEW_START_HASH = '#tabActions';

C.ADDITIONAL_LINKS = [{
    label: 'More information about FABI // Mehr Infos zu FABI',
    url: L.translate('https://www.asterics-foundation.org/projects/fabi/ // https://www.asterics-foundation.org/projekte-2/fabi/')
}, {
    label: 'Ask questions about FABI // Eine Frage zu FABI stellen',
    url: 'https://q2a.wbt.wien/ask'
}, {
    label: 'Licensing // Lizenzbestimmungen',
    url: 'https://github.com/asterics/FABI/blob/master/LICENSE'
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

C.BTN_MODES_ACTIONLIST = [{
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