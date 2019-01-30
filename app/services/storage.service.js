const R = require('ramda');
const fs = require('fs');
const path = require('path');

const writeFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        const dirname = path.dirname(`${filename}`);
        if (!fs.existsSync(`./static/${dirname}`)) {
            fs.mkdirSync(`./static/${dirname}`);
        }
        const writeStream = fs.createWriteStream(`./static/${filename}`);
        writeStream.write(data);
        writeStream.end(e => {
            resolve();
        });
    });
};

const storeTypes = {
    file: writeFile
};

const store = (key, data, storeType = storeTypes.file) => R.compose(
    R.curry(storeType)(key),
    R.toString
)(data);

module.exports = {
    store
};