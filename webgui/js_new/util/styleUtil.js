let styleUtil = {};

styleUtil.getCircleStyle = function (radius, color, border) {
    radius = radius || 10;
    color = color || 'red';
    border = border || 'none';
    return `min-width: ${radius}px;
                height: ${radius}px;
                background: ${color};
                -moz-border-radius: ${radius / 2}px;
                -webkit-border-radius: ${radius / 2}px;
                border-radius: ${radius / 2}px;
                top: -${radius / 2}px;
                left: -${radius / 2}px;
                border: ${border};`;
};

export {styleUtil};