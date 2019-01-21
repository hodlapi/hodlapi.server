const R = require('ramda');
const fs = require('fs');
const path = require('path');

const writeFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        const dirname = path.dirname(`${filename}.txt`);
        if (!fs.existsSync(`./static/${dirname}`)) {
            fs.mkdirSync(`./static/${dirname}`);
        }
        
        fs.appendFile(`./static/${filename}.txt`, data, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
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