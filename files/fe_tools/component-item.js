const path = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const categoryItem = require('./category-item');
const utils = require('./utils.js');
const categoryStyle = utils.getCategoryStyle(), CategoryStyle = utils.CategoryStyle;
const NodeType = categoryItem.NodeType;
NodeType.ComponentItem = 40;

const ngNameRegexp = /\.\s*component\s*\(\s*['"]\s*(.*)\s*['"]/;

class ComponentItem extends categoryItem.Item {
    constructor(name, path, root) {
        super(name, path, root);
        this.type = NodeType.ComponentItem;
    }
    get hasExample() {
        return fs.existsSync(path.join(this.path, 'example.js'));
    }
    get camelCaseItemName() {
        return utils.kebabCaseTocamelCase(this.itemName);
    }
    get PascalCaseItemName() {
        return utils.kebabCaseToPascalCase(this.itemName);
    }
    get isItemNamekebabCase() {
        return utils.iskebabcase(this.itemName);
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

        utils.writeFileOrWarn(path.join(this.path, 'index.js'), indexJS(this));
        utils.writeFileOrWarn(path.join(this.path, 'index.css'), '');
        utils.writeFileOrWarn(path.join(this.path, 'example.html'), exampleHtml(this));
        utils.writeFileOrWarn(path.join(this.path, 'example.js'), exampleJS(this));
        utils.writeFileOrWarn(path.join(this.path, 'example.css'), '');

    }

    static from(item) {
        return new ComponentItem(item.name, item.path, item.root);
    }
    static instance(name, rootPath) {
        let root = new categoryItem.Root(rootPath);
        return new ComponentItem(name, null, root);
    }
    static replaceTo(node) {
        ComponentItem.replaceRecursive(node);
    }
    static replaceRecursive(node) {
        node.children.forEach((child, index) => {
            if (child instanceof categoryItem.Category) {
                ComponentItem.replaceRecursive(child)
            }
            if (child instanceof categoryItem.Item) {
                let item = ComponentItem.from(child);
                node.children.splice(index, 1, item);
                node.root.nodes.nodesInMap.set(child.name, item);
            }
        })
    }
}


let indexJS = (component) => {
    return `import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import styles from './index.css';

class ${component.PascalCaseItemName} extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div style={{fontSize:'50px',textAlign:'center'}} >${component.PascalCaseItemName}</div>
        );
    }
}

export { ${component.PascalCaseItemName} as default }
`;
}

let exampleHtml = (component) => {
    return `
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>${component.name}</title>
        <meta charset="UTF-8">
        <link href="../css/vendor.bundle.css" rel="stylesheet">
        <link href="../css/common.bundle.css" rel="stylesheet">
        <link href="../css/${component.name}.bundle.css" rel="stylesheet">
        <script type="text/javascript" src="../scripts/manifest.bundle.js" ></script>
        <script type="text/javascript" src="../scripts/vendor.bundle.js" ></script>
        <script type="text/javascript" src="../scripts/common.bundle.js" ></script>
    </head>
    <body>
         <div id='root'></div>
         <script type="text/javascript" src="../scripts/${component.name}.bundle.js" ></script>
    </body>
</html>
`;
}

let exampleJS = (component) => {
    return `import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import '${path.relative(component.path, path.resolve(component.root.path, '../shared-css/reset.css')).replace(categoryItem.regexPathSep, '/')}';
import commonStyles from '${path.relative(component.path, path.resolve(component.root.path, '../shared-css/common.css')).replace(categoryItem.regexPathSep, '/')}';
import styles from './index.css';
import ${component.PascalCaseItemName} from './index';

class App extends Component {
    constructor(props) {
        super(props);
        this.state = { styles }
    }
    render() {
        return (
            <${component.PascalCaseItemName} />
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root')
);
`;
}

module.exports = { ComponentItem }