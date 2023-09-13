//very lightweight replacement for jquery,
//see https://blog.garstasio.com/you-dont-need-jquery/selectors/#multiple-selectors
import {localStorageService} from "./localStorageService.js";

let L = function (selector) {
    if (selector instanceof Node) {
        return selector;
    }
    var selectorType = 'querySelectorAll';

    if (selector.indexOf('#') === 0 && selector.indexOf(' ') === -1) {
        selectorType = 'getElementById';
        selector = selector.substr(1, selector.length);
    }

    return document[selectorType](selector);
};

L.toggle = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("block");
    toggleInternal(args);
};

L.toggleInline = function () {
    var args = Array.prototype.slice.call(arguments);
    args.unshift("inline");
    toggleInternal(args);
};

function toggleInternal(args) {
    var displayModeShown = args[0];
    if (!args || args.length < 2) {
        return;
    }
    for (var i = 1; i < args.length; i++) {
        var selector = args[i];
        var elems = L.selectAsList(selector);
        elems.forEach(function (x) {
            if (x.style && x.style.display === "none") {
                x.style.display = displayModeShown;
            } else {
                x.style.display = "none";
            }
        });
    }
}

L.isVisible = function (selector) {
    var x = L(selector);
    return !(x.style && x.style.display === "none");
};

L.setVisible = function (selector, visible, visibleClass) {
    var elems = L.selectAsList(selector);
    elems.forEach(function (x) {
        if (visible == false) {
            x.style.display = "none";
        } else {
            x.style.display = visibleClass ? visibleClass : "block";
        }
    });
};

L.selectAsList = function (selector) {
    var result = L(selector);
    if (result && result.length > 0) {
        return result;
    }
    return result && !(result instanceof NodeList) ? [result] : [];
};

L.addClass = function (selector, className) {
    L.toggleClass(selector, className, false, true);
};

L.removeClass = function (selector, className) {
    L.toggleClass(selector, className, true, false);
};

L.toggleClass = function (selector, className, dontAdd, dontRemove) {
    let list = L.selectAsList(selector);
    list.forEach(function (elem) {
        let classes = elem.className.split(' ');
        if (classes.indexOf(className) === -1) {
            if (!dontAdd) {
                elem.className += ' ' + className;
                elem.className = elem.className.trim();
            }
        } else if (!dontRemove) {
            classes = classes.filter(c => c.trim() !== className);
            elem.className = classes.join(' ');
        }
    });
}

L.setSelected = function (selector, selected) {
    if (selected == undefined) selected = true;
    var list = L.selectAsList(selector);
    list.forEach(function (elem) {
        if (selected) {
            L.addClass(elem, 'selected');
        } else {
            L.removeClass(elem, 'selected');
        }
        elem.setAttribute('aria-selected', selected);
    });
};

L.setValue = function (selector, value) {
    var list = L.selectAsList(selector);
    list.forEach(function (elem) {
        if (elem.value) {
            elem.value = value;
        }
    });
};

L.hasFocus = function (selector) {
    return L(selector) == document.activeElement;
};

L.val2key = function (val, array) {
    for (var key in array) {
        if (array[key] == val) {
            return key;
        }
    }
    return false;
};

L.isFunction = function (functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
};

L.getIDSelector = function (id) {
    return '#' + id;
};

L.getPercentage = function (value, minRange, maxRange) {
    return (Math.round(((value - minRange) / (maxRange - minRange) * 100) * 1000) / 1000)
};

L.limitValue = function (value, min, max) {
    return Math.max(Math.min(value, max), min);
}

L.getMs = function () {
    return new Date().getTime();
};

L.deepCopy = function (object) {
    return JSON.parse(JSON.stringify(object));
};

L.removeAllChildren = function (selector) {
    var elm = L(selector);
    elm = elm instanceof NodeList ? elm : [elm];
    elm.forEach(function (elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    });
};

L.createElement = function (tagName, className, inner, style) {
    var e = document.createElement(tagName);
    e.className = className;
    e.style.cssText = style || '';
    if (inner) {
        inner = inner instanceof Array ? inner : [inner];
        inner.forEach(function (innerElem) {
            if (typeof innerElem === 'string') {
                e.innerHTML += innerElem;
            } else {
                e.appendChild(innerElem);
            }
        });
    }

    return e;
};

/**
 * creates a list of <option> elements as innerHTML for an <select> element.
 *
 * @param listValues the list of values for the <option> elements
 * @param listHtml a list of values for the innerHTML of the <option> elements, if a function it is used to translate a
 * value from the listValues, if not specified L.translate() is used to generate the innerHTML of the option elements.
 * @param defaultOption if specified a default option with the given innerHTML (or its translation) and value "-1" is added
 * @return {string}
 */
L.createSelectItems = function (listValues, listHtml, defaultOption) {
    var result = '';
    var hasHtml = listHtml && listHtml.length == listValues.length;
    var hasHtmlFn = L.isFunction(listHtml);

    for (var i = 0; i < listValues.length; i++) {
        var html = hasHtmlFn ? listHtml(listValues[i]) : (hasHtml ? listHtml[i] : L.translate(listValues[i]));
        var elem = L.createElement('option', '', html);
        elem.value = listValues[i];
        result += elem.outerHTML + '\n';
    }

    if (defaultOption) {
        result = '<option value="-1" disabled selected hidden>' + L.translate('SELECT_SPECIAL_KEY') + '</option>\n' + result;
    }
    return result;
};

/**
 * returns true if the current browser language contains the given localeString
 */
L.isLang = function (localeString) {
    var lang = window.navigator.userLanguage || window.navigator.language;
    return lang.indexOf(localeString) > -1;
};

window.lang = '';
window.customLang = '';
L.getLang = function () {
    var lang = window.customLang || window.navigator.userLanguage || window.navigator.language;
    return window.lang || lang.substring(0, 2);
};

/**
 * translates an translation key. More arguments can be passed in order to replace placeholders ("{?}") in the translated texts.
 * e.g.
 * var key = 'SAY_HELLO_KEY'
 * translation: 'SAY_HELLO_KEY' -> 'Hello {?} {?}'
 * L.translate(key, 'Tom', 'Mayer') == 'Hello Tom Mayer'
 *
 * @param translationKey the key to translate
 * @return {*}
 */
L.translate = function (translationKey) {
    if (translationKey === null || translationKey === undefined) {
        return '';
    }
    translationKey = translationKey + '';
    let translated = '';
    if (translationKey.indexOf(' // ') > -1) {
        let translations = translationKey.split(' // ');
        translated = 'de'.toUpperCase() === L.getLang().toUpperCase() ? translations[1] : translations[0];
    } else {
        translated = translationKey;
    }
    for (let i = 1; i < arguments.length; i++) {
        translated = translated.replace('{?}', L.translate(arguments[i]));
    }
    return translated;
};

L.getLastElement = function (array) {
    return array.slice(-1)[0];
};

L.replaceAll = function (string, search, replace) {
    return string.replace(new RegExp(search, 'g'), replace);
};

L.equalIgnoreCase = function (str1, str2) {
    return str1.toUpperCase() === str2.toUpperCase();
};

L.loadScript = function (source, fallbackSource) {
    console.log("loading script: " + source);
    var script = document.createElement('script');
    return new Promise(function (resolve) {
        script.onload = function () {
            console.log("loaded: " + source);
            resolve(true);
        };
        script.onerror = function () {
            console.log("error loading: " + source);
            if (fallbackSource) {
                L.loadScript(fallbackSource).then(resolve);
            } else {
                resolve(false);
            }
        };
        script.src = source;
        document.head.appendChild(script);
    });
};

//THX: https://phpcoder.tech/wp-content/cache/all/create-dynamically-generated-text-file-and-download-using-javascript/index.html
L.downloadasTextFile = function (filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

L.getReadableATCMD = function (atCmd) {
    if (!atCmd) {
        return L.translate(C.AT_CMD_NO_CMD);
    }
    let prefix = atCmd.substring(0, C.LENGTH_ATCMD_PREFIX - 1).trim();
    let cmdObject = C.AT_CMDS_ACTIONS.filter(elem => elem.cmd === prefix)[0];
    let label = cmdObject ? (cmdObject.shortLabel || cmdObject.label) : atCmd;
    return L.translate(label);
}

L.HTTPRequest = function (url, method, responseType) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = responseType;
    return new Promise((resolve, reject) => {
        xhr.onload = function () {
            if (xhr.status === 200) {
                resolve(xhr.response);
            } else {
                reject();
            }
        };
        xhr.send();
    });
}

/**
 * Starts a HTTP request or returns a cached version of the result if it was already executed before.
 * @param url
 * @param method HTTP method, e.g. GET
 * @param responseType e.g. 'text', 'json' or 'arraybuffer'
 * @param storeKey (optional) key to store/cache the result in local storage
 * @param timeToLive (optional) time in milliseconds the cached version is valid
 * @return {Promise<unknown>|Promise<ArrayBuffer>} promise resolving to the result of the request
 */
L.CachedHTTPRequest = function (url, method, responseType, storeKey, timeToLive) {
    let PREKEY = 'FMFABI_CACHEDREQ_';
    let requestId = url + method + responseType;
    storeKey = storeKey || requestId;
    let key = PREKEY + storeKey;
    timeToLive = timeToLive !== undefined ? timeToLive : 3600 * 1000; // 1 hour
    let stored = localStorageService.get(key);
    let storedObject = stored ? JSON.parse(stored) : null;
    let storedRequestId = storedObject ? storedObject.requestId : null;
    if (storedObject && new Date().getTime() - storedObject.time < timeToLive && requestId === storedRequestId) {
        log.info('using cache for request...')
        let data = storedObject.data;
        if (responseType === 'arraybuffer') {
            let byteArray = new Uint8Array(storedObject.data);
            data = byteArray.buffer;
        }
        return Promise.resolve(data);
    }
    let promise = L.HTTPRequest(url, method, responseType);
    promise.then(result => {
        if (responseType === 'arraybuffer') {
            window.result = result;
            result = Array.from(new Uint8Array(result));
        }
        localStorageService.save(key, JSON.stringify({
            data: result,
            time: new Date().getTime(),
            requestId: requestId
        }))
    });
    return promise;
}

L.parseVersion = function (versionString) {
    versionString = versionString || '';
    let items = versionString.split(/[ \n:_]/g).map(e => e.replace(/[^0-9.]/g, '')).filter(e => !!e && e.includes('.')); //only parts with numbers and dots
    versionString = items[0]; // assume first part with numbers and dots is version string
    if (!versionString) {
        return {};
    }
    let versions = versionString.split('.');
    return {
        major: parseInt(versions[0]) || 0,
        minor: parseInt(versions[1]) || 0,
        patch: parseInt(versions[2]) || 0
    }
}

L.formatVersion = function (versionString) {
    let version = L.parseVersion(versionString);
    return `${version.major}.${version.minor}.${version.patch}`;
}

L.isVersionNewer = function (oldVersion, newVersion) {
    let vOld = L.parseVersion(oldVersion);
    let vNew = L.parseVersion(newVersion);
    if (vOld.major !== vNew.major) return vNew.major > vOld.major;
    if (vOld.minor !== vNew.minor) return vNew.minor > vOld.minor;
    if (vOld.patch !== vNew.patch) return vNew.patch > vOld.patch;
    return false;
}

L.isVersionEqual = function (oldVersion, newVersion) {
    let vOld = L.parseVersion(oldVersion);
    let vNew = L.parseVersion(newVersion);
    return vOld.major === vNew.major && vOld.minor === vNew.minor && vOld.patch === vNew.patch;
}

/**
 * Calls the given function after a specified timeout. Another subsequent call cancels and restarts the timeout.
 *
 * @param fn the function to call
 * @param timeout
 * @param key for identifying the called function. If several functions are debounced at the same time, different keys
 *        have to be specified for identifying them
 */
L.timeoutHandlers = {}
L.debounce = function (fn, timeout, key) {
    key = key || 'DEFAULT';
    if (!fn && !timeout) {
        log.warn('called util.debounce() without needed parameters. aborting.');
        return;
    }
    if (L.timeoutHandlers[key]) {
        clearTimeout(L.timeoutHandlers[key]);
    }
    L.timeoutHandlers[key] = setTimeout(function () {
        fn();
    }, timeout);
};

/**
 * clears any existing timeout created by "debounce()" before by given key
 * @param key
 */
L.clearDebounce = function (key) {
    key = key || 'DEFAULT';
    if (L.timeoutHandlers[key]) {
        clearTimeout(L.timeoutHandlers[key]);
    }
};

/**
 * returns minimum of both values, or the non-NaN value of one value is NaN
 * @param val1
 * @param val2
 * @return {*|number}
 */
L.robustMin = function (val1, val2) {
    return robustExtremeFn(Math.min, val1, val2);
}

/**
 * returns maximum of both values, or the non-NaN value of one value is NaN
 * @param val1
 * @param val2
 * @return {*|number}
 */
L.robustMax = function (val1, val2) {
    return robustExtremeFn(Math.max, val1, val2);
}

function robustExtremeFn(extremeFn, val1, val2) {
    val1 = parseInt(val1);
    val2 = parseInt(val2);
    if (!isNaN(val1) && !isNaN(val2)) {
        return extremeFn(val1, val2);
    }
    return isNaN(val1) ? val2 : val1;
}

window.L = L;

export {L}