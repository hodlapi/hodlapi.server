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
        let request = await Request.findById(requestId).populate("files");
        const dataSourceId = request.dataSource;
        const startDate = request.fromDate;
        const endDate = request.toDate;
        const dataSource = await DataSource.findById(dataSourceId);
        const currencyPair = await CurrencyPair.findById(currencyPairId);

        const filename = helpers.composeFileName(dataSource.name)(
            currencyPair.name
        )(startDate)(endDate)(interval);
        let file = await File.findOne({
            name: filename,
            extension: ext
        });

        if (!file) {
            const ratesList = await getRateByInterval(interval)
                .find({
                    currencyPair: currencyPairId,
                    dataSource: dataSourceId,
                    openTime: {
                        $gte: new Date(startDate),
                        $lt: new Date(endDate)
                    }
                })
                .then((list = []) => list.map(binanceModelToRate));
            storeToFile(`${filename}.${ext}`, formatter(ratesList)).then(
                async() => {
                    const newFile = new File({
                        url: `${config.get("staticUrl")}/${filename}.${ext}`,
                        name: filename,
                        extension: ext,
                        request: requestId
                    });
                    try {
                        await newFile.save();
                        request.files.push(newFile);
                        await request.save();
                        resolve(newFile);
                    } catch (ex) {
                        console.log(ex);
                    }
                },
                err => reject(err)
            );
        } else {
            resolve(file);
        }
    })
);

module.exports = {
    store
};