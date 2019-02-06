const R = require('ramda');
const {
    Currency,
    CurrencyPair,
    DataSource
} = require('../models');
const {
    binanceCurrenciesParser
} = require('../parsers');

const saveCurrenciesAndPair = dataSourceName => async (left, right) => {
    let from = await Currency.findOne({
        symbol: left
    }) || new Currency({
        symbol: left
    }).save();
    let to = await Currency.findOne({
        symbol: right
    }) || new Currency({
        symbol: right
    }).save();

    return CurrencyPair.findOne({
        name: `${left}${right}`,
        fromId: from._id,
        toId: to._id
    }).then(async doc => {
        if (!doc) {
            const pair = new CurrencyPair({
                name: `${left}${right}`,
                fromId: from._id,
                toId: to._id
            }).save();
            
            const dataSource = await DataSource.findOne({
                name: dataSourceName
            });
            dataSource.currencyPairs.push(await pair);
            return dataSource.save();
        }
    });

};

const binanceCurrenciesWorker = () => binanceCurrenciesParser(saveCurrenciesAndPair('Binance'));

module.exports = {
    binanceCurrenciesWorker
};