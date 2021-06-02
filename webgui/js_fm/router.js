window.router = {};

router.views = {};
router.currentView = null;

router.addView = function(hash, viewObject) {
    router.views[hash] = viewObject;
}

router.toView = function(viewId) {
    let viewIds = Object.keys(router.views);
    viewId = viewId || window.location.hash;
    viewId = viewIds.includes(viewId) ? viewId : viewIds[0];
    let view = router.views[viewId];

    L.setSelected('.menubutton', false);
    L.setSelected(viewId + 'Btn');
    changeView(view);
    window.domI18nInstance.changeLanguage();
    window.location.hash = viewId;
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

function changeView(view, valueHandler, initFn) {
    if (router.currentView && router.currentView.destroy) {
        router.currentView.destroy();
    }
    router.currentView = view;
    if (view && view.init) {
        view.init();
    }
    if (view.valueHandler) {
        flip.startLiveValueListener(view.valueHandler);
    } else {
        flip.stopLiveValueListener();
    }
    if (initFn) {
        initFn();
    }
}