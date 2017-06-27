const fs = require('fs');
const path = require('path');
const webpackMerge = require('webpack-merge');
const base = require('./webpack.base');
const mkdirp = require('mkdirp');
const categoryItem = require('./fe_tools/category-item');
const Item = categoryItem.Item, Category = categoryItem.Category, parse = categoryItem.parse;
const ComponentItem = require('./fe_tools/component-item').ComponentItem;

var srcDir = './fe/components',
    buildDir = './fe_build_components';


var indexTemplate = () => {
    return `
   <!DOCTYPE html>
<html lang="en" ng-app="runtime" ng-controller="example">
<head>
    <title>Components List</title>
    <meta charset="UTF-8">
    <style>
        .components {
            width: 100%;node
            margin-top: 30px;
            clear: both;
        }    
        .components th {
            color: steelblue;
            font-size: 22px;
        }       
        .components td {
            text-align: center;
        }   
        .components tr.no {
            background-color: rgba( 2, 2, 2, 0.16);
        }
        .components td.wrong {
            color: red
        }
    </style>
</head>
<body>
    <div style="width:900px;margin:0 auto;">
        <div style="text-align: center;font-size: 32px;color:steelblue;margin-bottom: 20px">
            ${components.length} Components 
            / ${components.filter(component => component.example).length} with example 
        </div>
        ${(() => {
            return categories.map(category => {

                let components = category.children.filter(node => node instanceof ComponentItem);

                return `
                   ${(() => {
                        if (showCategory)
                            return `
                           <div style="text-align: center;font-size: 20px;color:steelblue;margin-top:25px;margin-bottom: 20px;clear:both;position:relative">
                             <div style="position:absolute"> ${ category === root ? '' : category.name} </div>
                             ${components.length} Components / ${components.filter(cmpt => cmpt.hasExample).length} with example 
                           </div>
                       `;
                        else {
                            return '';
                        }
                    })()}

                <table class="components">
                   <tr>
                     <th> </th>
                     <th> Component name</th>
                     <th> example </th>
                  </tr>

                  ${components.map((component, index) => `
                        <tr ${(() => {
                            if (component.index) return '';
                            else return `class="no"`;
                        })(component)}>
                           <td> ${index + 1} </td>
                           <td> ${component.PascalCaseItemName} </td>                         
                           <td>
                           ${(() => {
                            if (component.hasExample) return `<a href="components/${component.name}.html" target="_blank">example</a>`;
                            else return '';
                        })()}
                           </td>                       
                      </tr>
                      `  ).join('\n')}
                </table >             
                `;
            }).join('\n')
        })()}       
    </div >
</body >
</html >
    `;
}


let root = parse(path.resolve(__dirname, srcDir));
ComponentItem.replaceTo(root);

let categories = [...root.nodes.nodesInMap.values()].filter(node => node instanceof Category);
categories.unshift(root);
let showCategory = categories.length > 1;
let components = [...root.nodes.nodesInMap.values()].filter(node => node instanceof ComponentItem);

function ComponentExamplesPlugin() {
}
ComponentExamplesPlugin.prototype.apply = function (compiler) {

    compiler.plugin('compilation', (compilation) => {

        compilation.plugin('additional-chunk-assets', () => {

            let content = indexTemplate(components);
            compilation.assets['index.html'] = {
                source: () => content,
                size: () => content.length
            }

            components.filter(component => component.hasExample)
                .forEach(component => {

                    let content = fs.readFileSync(path.join(component.path, 'example.html'), 'utf8');
                    compilation.assets[`components/${component.name}.html`] = {
                        source: () => content,
                        size: () => content.length
                    }
                });

        });

    });
}

module.exports = (env) => {
    env = ['dev', 'prod'].indexOf(env) !== -1 ? env : 'dev';
    var options = {
        path: buildDir,
        publicPath: '../',
        compress: false,
        hashNaming: false,
        devServer: true,
        devServerPort: 8081,
        devtool: 'inline-source-map',
        appCount: components.length
    }
    if (env == 'prod') {
        options = webpackMerge(options, {
            devServer: false
        })
    }

    return webpackMerge(base(options), {
        plugins: [
            new ComponentExamplesPlugin()
        ]
    }, (() => {
        var entry = {};
        components.forEach(component => {
            if (component.hasExample)
                entry[component.name] = path.join(component.path, "example.js");
        })
        return { entry }
    })());
}






