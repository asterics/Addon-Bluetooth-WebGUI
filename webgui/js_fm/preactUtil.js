let preactUtil = {};

preactUtil.toggleState = function (instance, propertyName) {
    if (instance.state[propertyName] === true || instance.state[propertyName] === false) {
        let newState = {};
        newState[propertyName] = !instance.state[propertyName];
        instance.setState(newState);
    }
};

export {preactUtil};