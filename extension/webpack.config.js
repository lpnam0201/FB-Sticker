const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './scripts/main.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    plugins: [
        new CopyPlugin([
            { from: 'manifest.json' },
            { from: 'background.js' },
            { from: 'templates', to: 'templates' },
            { from: 'css', to: 'css' },
            { from: 'lib', to: 'lib' }, 
            { from: 'stickers', to: 'stickers' },
            { from: 'assets', to: 'assets' }
        ])
    ],
    devtool: 'source-map',
    mode: 'development'
}