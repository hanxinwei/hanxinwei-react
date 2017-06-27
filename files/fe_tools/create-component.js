const path = require('path');
const Item = require('./component-item').ComponentItem;

let item = Item.instance(process.argv[2].toLowerCase(), path.resolve(__dirname, '../fe/components'));
item.create();
console.log('Success');
