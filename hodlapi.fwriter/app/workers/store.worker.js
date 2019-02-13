import { request } from "http";

const fs = require("fs");
const R = require("ramda");
const path = require("path");
const config = require("config");
const { helpers, binanceModelToRate } = require("../lib");
const {
    getRateByInterval,
    File,
    DataSource,
    CurrencyPair,
    Request
} = require("../models");

const folderExistingChecker = dirname =>
    !fs.existsSync(dirname) && fs.mkdirSync(dirname);

const writeDataToFile = R.curry(
    (filename, data) =>
    new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(`./static/${filename}`);
        writeStream.write(`${data}`);
        writeStream.end(e => {
            resolve();
        });
        writeStream.on("error", e => {
            reject(e);
        });
    })
);

const storeToFile = R.curry((filename, data) => {
    ["static", path.dirname(`static/${filename}`)].map(e =>
        folderExistingChecker(e)
    );
    return writeDataToFile(filename, data);
});

const store = R.curry(
    (requestId, interval, currencyPairId, ext, formatter) =>
    new Promise(async(resolve, reject) => {
        const dataSourceId = request.dataSource;
        let request = await Request.findById(requestId);
        const dataSource = await DataSource.findById(dataSourceId);
        const currencyPair = await CurrencyPair.findById(currencyPairId);

        const filename = helpers.composeFileName(dataSource.name)(
            currencyPair.name
        )(start)(end)(interval);
        let file = await File.findOne({
            name: filename,
            extension: ext
        });

        if (!file) {
            const ratesList = getRateByInterval(interval)
                .find({
                    currencyPair: currencyPairId,
                    dataSource: dataSourceId,
                    openTime: {
                        $gte: new Date(start),
                        $lt: new Date(end)
                    }
                })
                .then((list = []) => list.map(binanceModelToRate));
            storeToFile(`${filename}.${ext}`, formatter(ratesList)).then(() => {
                const newFile = new File({
                    url: `${config.get("staticUrl")}/${filename}.${ext}`,
                    name: filename,
                    extension: ext,
                    request: requestId
                });
                newFile.save();
                resolve(newFile);
                request.Files.push(newFile);
                request.save();
            });
        } else {
            resolve(file);
        }
    })
);

module.exports = {
    store
};