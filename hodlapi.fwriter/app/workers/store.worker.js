const fs = require('fs');
const R = require('ramda');
const path = require('path');
const config = require('config');
const {
    helpers,
    binanceModelToRate
} = require('../lib');
const {
    getRateByInterval,
    File,
    DataSource
} = require('../models');

const folderExistingChecker = dirname => !fs.existsSync(dirname) && fs.mkdirSync(dirname);

const writeDataToFile = R.curry((filename, data) => new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(`./static/${filename}`);
    writeStream.write(`${data}`);
    writeStream.end(e => {
        resolve();
    });
    writeStream.on('error', e => {
        reject(e);
    });
}));

const storeToFile = R.curry((filename, data) => {
    ['static', path.dirname(`static/${filename}`)].map(e => folderExistingChecker(e));
    return writeDataToFile(filename, data);
});

const store = R.curry((dataSourceId, interval, currencyPairId, start, end, ext, formatter) => new Promise((resolve, reject) => {
    DataSource.findById(dataSourceId).then(dataSource => {
        //ToDo: Change to use currencyPairNAme instead of Id
        const filename = helpers.composeFileName(dataSource.name)(currencyPairId)(start)(end)(interval);
        File.findOne({
            name: filename,
            extension: ext
        }).then(data => {
            if (!data) {
                getRateByInterval(interval).find({
                        currencyPair: currencyPairId,
                        dataSource: dataSourceId,
                        openTime: {
                            $gte: new Date(start),
                            $lt: new Date(end)
                        }
                    })
                    .then((list = []) => list.map(binanceModelToRate))
                    .then(list => {
                        storeToFile(`${filename}.${ext}`, formatter(list)).then(() => {
                            const file = new File({
                                url: `${config.get('staticUrl')}/${filename}.${ext}`,
                                name: filename,
                                extension: ext
                            });
                            file.save();
                            resolve(file);
                        });
                    }, err => reject(err));
            } else {
                resolve(data);
            }
        }, err => reject(err));
    }, err => reject(err));
}));

module.exports = {
    store
};