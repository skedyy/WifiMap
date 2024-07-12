const path = require('path');

module.exports = {
    entry:{
        app: [path.join(__dirname,"src/main.js"), path.join(__dirname,"src/uiElements.js")],
    },
    output: {
        path: path.resolve(__dirname, 'www/js'),
        filename: 'main.js',
    },
    mode: 'production',
};