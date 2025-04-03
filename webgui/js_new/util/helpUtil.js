let helpUtil = {};

let currentHash = '';

helpUtil.openHelp = function () {
    if (C.HELP_BASE_URL) {
        window.open(L.translate(C.HELP_BASE_URL) + L.translate(currentHash), '_blank');
    }
}

helpUtil.setHash = function (hash) {
    currentHash = hash;
}

export {helpUtil};