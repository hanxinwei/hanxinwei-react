const path = require('path');
const fs = require('fs');
const url = require('url');
const webpack = require('webpack');
const manifestPlugin = require('webpack-manifest-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

let cssModulesIgnore;
if (fs.existsSync('./webpack.css-modules-ignore.js')) {
    cssModulesIgnore = require('./webpack.css-modules-ignore.js');
}
else {
    cssModulesIgnore = [];
}

var cssName = (hash) => {
    return hash ? 'css/[name].[contenthash].css' : 'css/[name].bundle.css';
}

var scriptName = (hash) => {
    return hash ? 'scripts/[name].[chunkhash].js' : 'scripts/[name].bundle.js';
}

var imgName = (hash) => {
    return hash ? 'images/[name].[hash].[ext]' : 'images/[name].[ext]';
}

module.exports = (options) => {
    options = options || {};
    if (!options.path) throw 'path required';
    options.compress = options !== undefined ? options.compress : false;
    options.hashNaming = options.hashNaming !== undefined ? options.hashNaming : false;
    options.devServer = options.devServer !== undefined ? options.devServer : true;

    var res = {
        output: {
            filename: scriptName(options.hashNaming),
            path: path.resolve(__dirname, options.path),
            publicPath: options.publicPath
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [{
                        loader: 'babel-loader',
                        options: { presets: ["env", "react"] }
                    }]
                },
                {
                    test: /\.css$/,
                    exclude: [/node_modules/].concat(cssModulesIgnore),
                    use: ExtractTextPlugin.extract({
                        use: [{
                            loader: 'css-loader',
                            options: {
                                modules: true,
                                localIdentName: '[path]__[local]--[hash:base64]'
                            }
                        }]
                    }),
                },
                {
                    test: /\.css$/,
                    include: [/node_modules/].concat(cssModulesIgnore),
                    use: ExtractTextPlugin.extract({
                        use: [{
                            loader: 'css-loader'
                        }]
                    }),

                },
                {
                    test: /\.(jpg|jpeg|png|gif)$/,
                    loader: `file-loader?name=${imgName(options.hashNaming)}`
                },
                {
                    test: /\.(htm|html)$/,
                    loader: 'html-loader'
                }
            ]
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin({
                name: 'common',
                minChunks: (module, count) => typeof options.appCount === 'number' ? count / options.appCount >= 0.3 : count >= 2
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                minChunks: (module) => module.context && module.context.indexOf('node_modules') !== -1
            }),
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity
            }),
            new manifestPlugin(),
            new ExtractTextPlugin(cssName(options.hashNaming)),
        ],
        stats: { children: false }
    };
    if (fs.existsSync('./webpack.stats.js')) {
        res.stats = require('./webpack.stats.js');
    }
    if (options.devServer) {
        var port = options.devServerPort === undefined ? 8080 : options.devServerPort;
        res.output.publicPath = url.resolve(`http://127.0.0.1:${port}`, options.path) + '/';
        res.devServer = {
            publicPath: url.resolve('/', options.path + '/'),
            stats: { children: false, chunks: false }
        }
        if (fs.existsSync('./webpack.stats.devserver.js')) {
            res.devServer.stats = require('./webpack.stats.devserver.js');
        }
        if (options.devServerPort) {
            res.devServer.port = options.devServerPort;
        }
    }
    else {
        res.output.publicPath = options.publicPath !== undefined ? options.publicPath : url.resolve('/', options.path) + '/';
    }

    if (options.compress) {
        res.plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                drop_console: true
            }
        }));
    }
    if (options.devtool) {
        res.devtool = options.devtool;
    }

    return res;
}
