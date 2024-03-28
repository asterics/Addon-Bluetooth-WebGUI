window.mock = {};
mock.deviceSlotNr = 0;
mock.slotNames = ['mouse', 'test'];

function MockCommunicator() {
    let DEFAULT_CONFIGURATION = ['AT SC 0x00ffff', 'AT SB 2', 'AT AX 60', 'AT AY 60', 'AT DX 20', 'AT DY 20', 'AT MS 50', 'AT AC 50', 'AT TS 500', 'AT TP 525', 'AT WS 3', 'AT SP 700', 'AT SS 300', 'AT MM 1', 'AT GU 50', 'AT GD 50', 'AT GL 50', 'AT GR 50', 'AT RO 0', 'AT BT 1', 'AT BM 01', 'AT NE', 'AT BM 02', 'AT KP KEY_ESC', 'AT BM 03', 'AT NC', 'AT BM 04', 'AT KP KEY_UP', 'AT BM 05', 'AT KP KEY_DOWN', 'AT BM 06', 'AT KP KEY_LEFT', 'AT BM 07', 'AT KP KEY_RIGHT', 'AT BM 08', 'AT PL', 'AT BM 09', 'AT NC', 'AT BM 10', 'AT CR', 'AT BM 11', 'AT CA', 'AT BM 12', 'AT NC', 'AT BM 13', 'AT NC', 'AT BM 14', 'AT NC', 'AT BM 15', 'AT NC', 'AT BM 16', 'AT NC', 'AT BM 17', 'AT NC', 'AT BM 18', 'AT NC', 'AT BM 19', 'AT NC'];
    var VALUE_CONSTANT = 'VALUES:';
    var _valueHandler = null;
    var _invervalHandler = null;
    var thiz = this;

    this.setValueHandler = function (handler) {
        _valueHandler = handler;
    };

    this.sendData = function (value, timeout) {
        if (!value) return;
        thiz.pressure = thiz.pressure || 500;
        thiz.x = thiz.x || 0;
        thiz.y = thiz.y || 0;
        thiz.incrementP = thiz.incrementP || 1;
        thiz.incrementXY = thiz.increment || 1;

        return new Promise(function (resolve) {
            if (value == 'AT') {
                resolve('');
            } else if (value.indexOf('AT SR') > -1) {
                _invervalHandler = setInterval(function () {
                    if (L.isFunction(_valueHandler)) {
                        thiz.pressure += thiz.incrementP;
                        thiz.x += thiz.incrementXY * getRandomInt(-5, 5);
                        thiz.y += thiz.incrementXY * (-1) * getRandomInt(-5, 5);
                        if (thiz.pressure > 550 || thiz.pressure < 450) {
                            thiz.incrementP *= -1;
                        }
                        if (thiz.y > 100 || thiz.y < -100 || thiz.x > 100 || thiz.x < -100) {
                            thiz.incrementXY *= -1;
                        }
                        _valueHandler(`${VALUE_CONSTANT}${thiz.pressure},${getRandomInt(500, 600)},${getRandomInt(500, 600)},${getRandomInt(500, 600)},${getRandomInt(500, 600)},${thiz.x},${thiz.y},111,${mock.deviceSlotNr},10,10`);
                    }
                }, 200);

            } else if (value.indexOf('AT ER') > -1) {
                clearInterval(_invervalHandler);

            } else if (value.indexOf('AT LA') > -1) { // LA = Load All. 
                let defaultCmds = DEFAULT_CONFIGURATION.join('\n');
                let cmds = 'Slot:mouse\n' + defaultCmds + '\n';
                cmds = cmds + 'Slot:test\n' + defaultCmds + '\nEND';
                resolve(cmds);

            } else if (value.indexOf('AT CA') > -1) {
                thiz.x = 0;
                thiz.y = 0;

            } else if (value.indexOf('AT LO') > -1) {
                let slotName = value.replace('AT LO ', '');
                mock.deviceSlotNr = mock.slotNames.indexOf(slotName);
                resolve('OK');

            } else if (value.indexOf('AT IL') > -1) { // IL = Lists all stored infrared command names.
                resolve('IRCommand0:play\nIRCommand1:pause\nIRCommand2:stop');

            } else if (value.indexOf('AT ID') > -1) {
                resolve('VERSION 3.14');

            } else if (value.indexOf('AT SA') > -1) {
                resolve('OK');
            }
            setTimeout(function () {
                resolve();
            }, timeout);
        });
    };
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomInt2(factor) {
    return Math.floor((Math.random() - Math.random()) * factor);
}