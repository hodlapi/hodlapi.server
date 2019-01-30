const axios = require('axios');
const R = require('ramda');
const trim = require('lodash/trim');
const moment = require('moment');
const Json2Csv = require('json2csv').Parser;
const logger = require('../logger');
const {
    Rate1h,
    Rate30m,
    Rate15m,
    Rate5m,
    Rate1m
} = require('../models');

const intervalsMap = {
    '1h': Rate1h,
    '30m': Rate30m,
    '15m': Rate15m,
    '5m': Rate5m,
    '1m': Rate1m
};

const parseBinance = params => axios.default.get('https://api.binance.com/api/v1/klines', {
        params
    })
    .then(R.propOr([], 'data'));

const saveRate = R.curry((_intervals, interval, symbol, data) => {
    const mappedData = { 
        symbol,
        openTime: data[0],
        open: data[1],
        hight: data[2],
        low: data[3],
        close: data[4],
        volume: data[5],
        closeTime: data[6],
        quoteAssetVol: data[7],
        numTrades: data[8],
        takerBuyBaseAssetVol: data[9],
        takerBuyQuoteAssetVol: data[10],
        ignore: data[11]
    };
    
    new _intervals[interval](mappedData).save().then(e => {
        console.log('Saved ', e);
        
    }, err => {
        console.log(err);
        
    });
})(intervalsMap); 

const consvertToCSV = data => {
    try {
        const fields = ["Open time", "open", "high", "low", "close", "volume", "close_time",
            "quote_asset_vol", "num_trades", "taker_buy_base_asset_vol", "taker_buy_quote_asset_vol", "ignore"
        ].map((label, value) => ({
            label,
            value: `${value}`
        }));
        const parser = new Json2Csv({
            fields
        });
        return parser.parse(data);
    } catch (e) {
        console.log(e);
    }
};

const binanceParser = ({
    symbol,
    interval,
    startDate = '2017-01-01',
    endDate
}) => new Promise(async (resolve, reject) => {
    /**
     * loop conditions
     * startTime - unix time of the first date
     */
    let startTime = moment(startDate).unix() * 1000;
    const currentDate = moment(endDate).unix() * 1000;
    const rateStore = saveRate(interval, symbol);

    let parsedLength = 1;
    while (startTime < currentDate && parsedLength > 0) {
        try {
            const data = await parseBinance({
                symbol,
                interval,
                startTime
            }) || [];
            parsedLength = data.length;
            // hack
            // courses = [...courses, ...data];
            
            data.map(e => {
                rateStore(e);
            });
            startTime = R.compose(
                R.inc,
                R.nth(6),
                R.last
            )(data);
            logger.log('info', `Parsed ${moment(startTime).toString()}`);
        } catch (e) {
            console.log(e);
            
            logger.log({
                level: 'error',
                message: `[parsing] ${R.toString(e)}`
            });
            reject(e);
            return;
        }
    }
    // try {
    //     await store(
    //         `${moment().format('YYYY-MM-DD')}_${symbol}/${interval}.csv`,
    //         consvertToCSV([...courses])
    //     );
    // } catch (e) {
    //     logger.log({
    //         level: 'error',
    //         message: `[storing csv] ${R.toString(e)}`
    //     });
    // }
    // try {
    //     await store(
    //         `${moment().format('YYYY-MM-DD')}_${symbol}/${interval}.json`,
    //         courses
    //     );
    // } catch (e) {
    //     logger.log({
    //         level: 'error',
    //         message: `[storing json] ${R.toString(e)}`
    //     });
    // }
    resolve();
});

module.exports = {
    binanceParser
};