let path = require('path');
let fs = require('fs');

const categorySep = '.', itemFile = './index.js',
    regexPathSep = new RegExp(`\\${path.sep}`, 'g'),
    regexCategorySep = new RegExp(`\\${categorySep}`, 'g'),
    regexLeadingOrTrailingCategorySeps = new RegExp(`^\\${categorySep}+|\\${categorySep}+\$`, 'g'),
    regexRepeatedCategorySeps = new RegExp(`\\${categorySep}{2,}`, 'g'),
    sortFunc = (a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    }

let NodeOperationError = {
    CategoryItemConflict: 10,
    ItemCategoryConflict: 20,
    ItemItemConflict: 30
}

let NodeType = {
    Root: 10,
    Category: 20,
    Item: 30
}

class NodeCollection {
    constructor(root) {
        this.root = root;
        this.nodesInMap = new Map();
    }
    findNode(name) {
        return this.nodesInMap.get(name);
    }
    findParentNode(name) {
        var levels = name.split(categorySep);
        levels.pop();
        if (levels.length === 0) return this.root;
        return this.findNode(levels.join(categorySep));
    }
    sortResursive(node) {
        node.children.sort(sortFunc);
        node.children.forEach(child => this.sortResursive(child));
    }
    normalize() {
        this.sortResursive(this.root);
    }
    parse() {
        this.parseRecursive(this.root.path, 1);
    }
    parseRecursive(dir, hierarchyLevel) {
        fs.readdirSync(dir)
            .filter(subDir => fs.statSync(path.join(dir, subDir)).isDirectory())
            .map(subDir => path.join(dir, subDir))
            .forEach(subDir => {
                let name = path.relative(this.root.path, subDir)
                    .trim()
                    .replace(regexPathSep, categorySep)
                    .replace(regexLeadingOrTrailingCategorySeps, '')
                    .replace(regexRepeatedCategorySeps, categorySep);

                let nameSegments = name.split(categorySep);

                let names = nameSegments.map((segment, index) => nameSegments.slice(0, index + 1).join(categorySep));
                let parent = hierarchyLevel > 1 ? this.findNode(names[hierarchyLevel - 2]) : this.root;
                names.forEach((name, index) => {
                    if (index >= hierarchyLevel - 1) {
                        let isLeaf = index === names.length - 1;
                        let isItem = isLeaf && fs.existsSync(path.join(subDir, itemFile));

                        let node = this.findNode(name);
                        if (node) {
                            if (node.type === NodeType.Item && !isItem) {
                                throw NodeOperationError.ItemCategoryConflict;
                            }
                            if (node.type === NodeType.Category && isItem) {
                                throw NodeOperationError.CategoryItemConflict;
                            }
                            if (node.type === NodeType.Item && isItem) {
                                throw NodeOperationError.ItemItemConflict;
                            }
                            if (node.path !== subDir) {
                                if (typeof node.path === 'string') node.path = [node.path, subDir];
                                else node.path.push(subDir);
                            }
                        }
                        else {
                            node = isItem ? new Item(name, subDir, this.root) : new Category(name, subDir, this.root)
                            node.parent = parent;
                            parent.children.push(node);
                            this.nodesInMap.set(name, node);
                        }

                        parent = node;
                    }
                });

                this.parseRecursive(subDir, hierarchyLevel + 1);
            })
    }
}

class Node {
    constructor(name, path, root) {
        this.name = name;
        this.path = path;
        this.root = root;
        this.parent = null;
        this.children = [];
    }
    get isRoot() {
        return this.root === this;
    }
}

class Category extends Node {
    constructor(name, path, root) {
        super(name, path, root);
        this.type = NodeType.Category;
    }
}

class Item extends Node {
    constructor(name, path, root) {
        super(name, path, root);
        this.type = NodeType.Item;
    }
    get seperatedNames() {
        return this.name.split(categorySep);
    }
    get categoryName() {
        let seperatedNames = this.seperatedNames;
        if (seperatedNames.length > 1) {
            seperatedNames.pop();
            return seperatedNames.join(categorySep);
        }
        return null;
    }
    get itemName() {
        return this.seperatedNames.pop();
    }
}

class Root extends Category {
    constructor(path) {
        super(null, path, null);
        this.root = this;
        this.nodes = new NodeCollection(this);
        this.type = NodeType.Root;
    }
    parse() {
        this.nodes.parse();
        return this;
    }
    normalize() {
        this.nodes.normalize();
        return this;
    }
}


let parse = (dir) => {
    return (new Root(dir)).parse().normalize();
}

module.exports = {
    Node, Root, Item, Category, NodeType, NodeOperationError, parse,
    categorySep, itemFile,
    regexCategorySep, regexPathSep, regexLeadingOrTrailingCategorySeps, regexRepeatedCategorySeps,
    sortFunc
};

