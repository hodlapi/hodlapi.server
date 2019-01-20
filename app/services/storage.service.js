const R = require('ramda');
const fs = require('fs');

const writeFile = (filename, data) => {
    return new Promise((resolve, reject) => {
        fs.appendFile(`./volumes/${filename}.txt`, data, err => {
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