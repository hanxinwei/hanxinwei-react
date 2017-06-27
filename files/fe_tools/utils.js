const fs = require('fs');
const chalk = require('chalk');
const path = require('path');

var kebabCaseTocamelCase = (name) => {
    return name
        .toLowerCase()
        .split('-')
        .map((name, index) => index === 0 ? name : (name.charAt(0).toUpperCase() + name.slice(1)))
        .join('');
}

var kebabCaseToPascalCase = (name) => {
    return name
        .toLowerCase()
        .split('-')
        .map((name, index) => (name.charAt(0).toUpperCase() + name.slice(1)))
        .join('');
}


var iskebabcase = (name) => {
    return /^[a-z0-9]+(-[a-z0-9]*)*$/.test(name);
}

var iscamelCase = (name) => {
    return /^[a-z0-9]+([A-Z][a-z0-9]*)*$/.test(name);
}

var writeFileOrWarn = (file, data) => {
    if (fs.existsSync(file)) {
        console.warn(chalk.red(`warn: ${file} already exists`));
    }
    else {
        fs.writeFileSync(file, data);
    }
}

let CategoryStyle = {
    Hierarchy: 10,
    Naming: 20
}

let getCategoryStyle = () => {
    let config = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (config && config.xbAngular && config.xbAngular.categoryStyle && config.xbAngular.categoryStyle.toLowerCase() === 'naming')
        return CategoryStyle.Naming;
    return CategoryStyle.Hierarchy;
}

let AppType = {
    NoRouter: 10,
    RouterRoot: 20,
    Router: 30
}

let getDefaultAppType = () => {
    let config = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
    if (config && config.xbAngular && config.xbAngular.defaultAppTpype) {
        switch (config.xbAngular.defaultAppTpype.toLowerCase()) {
            case 'norouer': return AppType.NoRouter;
            case 'routerroot': return AppType.RouterRoot;
            case 'router': return AppType.Router;
        }
        return AppType.NoRouter;
    }
}



module.exports = { kebabCaseTocamelCase, kebabCaseToPascalCase, iscamelCase, iskebabcase, writeFileOrWarn, getCategoryStyle, CategoryStyle, getDefaultAppType, AppType }

