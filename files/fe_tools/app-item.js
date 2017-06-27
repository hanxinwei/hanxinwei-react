const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const categoryItem = require('./category-item');
const utils = require('./utils.js');
const categoryStyle = utils.getCategoryStyle(), CategoryStyle = utils.CategoryStyle;
const NodeType = categoryItem.NodeType;
NodeType.AppItem = 50;

const routerSep = '/', regexRouterSep = new RegExp(`\\${routerSep}`, 'g'), angularRouterSep = '.';

class AppItem extends categoryItem.Item {
    constructor(name, path, root) {
        super(name, path, root);
        this.type = NodeType.AppItem;

        this.router = null;
        let seperatedItemNames = this.itemName.split(routerSep);
        if (seperatedItemNames.length > 1) {
            this.router = seperatedItemNames.filter(name => name);
            this.name = `${this.categoryName ? `${this.categoryName}.` : ``}${this.router.concat([]).pop()}`;
        }
    }

    create() {
        let itemPath;

        if (categoryStyle === CategoryStyle.Hierarchy) {
            itemPath = this.name
                .replace(categoryItem.regexLeadingOrTrailingCategorySeps, '')
                .replace(categoryItem.regexRepeatedCategorySeps, categoryItem.categorySep)
                .replace(categoryItem.regexCategorySep, path.sep);
        }
        else {
            itemPath = this.name
                .replace(categoryItem.regexLeadingOrTrailingCategorySeps, '')
                .replace(categoryItem.regexRepeatedCategorySeps, categoryItem.categorySep);
        }
        this.path = path.join(this.root.path, itemPath);
        mkdirp.sync(this.path);

        if (this.router) {
            utils.writeFileOrWarn(path.join(this.path, 'index.html'), indexHtml(this));
        }
        utils.writeFileOrWarn(path.join(this.path, 'index.js'), indexJS(this));
        utils.writeFileOrWarn(path.join(this.path, 'index.css'), '');
    }

    static from(item) {
        return new AppItem(item.name, item.path, item.root);
    }
    static instance(name, rootPath) {
        let root = new categoryItem.Root(rootPath);
        return new AppItem(name, null, root);
    }
    static replaceTo(node) {
        AppItem.replaceRecursive(node);
    }
    static replaceRecursive(node) {
        node.children.forEach((child, index) => {
            if (child instanceof categoryItem.Category) {
                AppItem.replaceRecursive(child)
            }
            if (child instanceof categoryItem.Item) {
                let item = AppItem.from(child);
                node.children.splice(index, 1, item);
                node.root.nodes.nodesInMap.set(child.name, item);
            }
        })
    }
}

let indexJS = (app) => {
    return `import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '${path.relative(app.path, path.resolve(app.root.path, '../shared-css/reset.css')).replace(categoryItem.regexPathSep, '/')}';
import commonStyles from '${path.relative(app.path, path.resolve(app.root.path, '../shared-css/common.css')).replace(categoryItem.regexPathSep, '/')}';
import styles from './index.css';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { styles }
    }
    render() {
        return (
            <div style={{fontSize:'50px',textAlign:'center'}} >index</div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
`;
}

let indexHtml = (app) => {
    return `
<div style="font-size:50px;text-align:center">${app.itemName}</div>
<ui-view></ui-view>
`;
}

module.exports = { AppItem }