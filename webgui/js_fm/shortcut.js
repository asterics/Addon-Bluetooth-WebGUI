window.addEventListener('keydown', event => {
    if (event.key === 'c' && event.ctrlKey) {
        if (window.flip && window.flip.isInitialized()) {
            window.flip.calibrate();
        }
    }
})
