const webpackMerge = require('webpack-merge');
const base = require('./webpack.base');
const path = require('path');
const fs = require('fs');
const categoryItem = require('./fe_tools/category-item');
const Item = categoryItem.Item, Category = categoryItem.Category, parse = categoryItem.parse;
const AppItem = require('./fe_tools/app-item').AppItem;

let root = parse(path.resolve(__dirname, './fe/apps'));
AppItem.replaceTo(root);
let apps = [...root.nodes.nodesInMap.values()].filter(node => node instanceof AppItem);

module.exports = (env) => {
    env = ['dev', 'prod'].indexOf(env) !== -1 ? env : 'dev';
    var options = {
        path: './fe_build',
        appCount: apps.length
    }
    if (env === 'dev') {
        options = webpackMerge(options, {
            compress: false,
            hashNaming: false,
            devServer: true,
            devtool: 'inline-source-map'
        })
    }
    else {
        options = webpackMerge(options, {
            compress: true,
            hashNaming: true,
            devServer: false
        })
    }

    return webpackMerge(base(options), (() => {
        let entry = {};
        apps.forEach(app => {
            entry[app.name] = path.join(app.path, './index.js');
        })
        return { entry }
    })());
}