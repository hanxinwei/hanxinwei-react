const path = require('path');
const Item = require('./app-item').AppItem;

let item = Item.instance(process.argv[2].toLowerCase(), path.resolve(__dirname, '../fe/apps'));
item.create();
console.log('Success');
