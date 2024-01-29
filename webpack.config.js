const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'www/js'),
        filename: 'main.js',
    },
    mode: 'production',
};