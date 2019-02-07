const R = require('ramda')
// const {ZeroXTransaction, Rate1h, Rate5m, Rate15m, Rate30m } = require('../models')
const { Rate1m, Rate5m, Rate15m, Rate30m, Rate1h } = require('../models')
const moment = require('moment')
const mock = require('./dump')

const fold = R.curry((fn, data) => R.reduce(fn, R.head(data), R.tail(data) || []))
const mapPair = R.curry((method, [key, data]) => [key, method(data)])
const mapPairs = (fn) => R.map(mapPair(fn))
const countRate = (data) => R.path(['takerPrice', 'USD'], data) / R.path(['makerPrice', 'USD'], data)
const countPeaks = (fn) => R.compose(fold(fn), R.map(countRate))
const sumPath = (path) => R.compose(R.sum, R.map(R.compose(parseFloat, R.path(path))))

const ZeroXTransaction = {
  find() {
    return mock
  }
}

const transformTransactions = R.compose(
  mapPairs(R.applySpec({
    currencyPair: {
      name: R.compose(
        (data) => R.concat(R.path(['makerToken', 'symbol'], data), R.path(['takerToken', 'symbol'], data)),
        R.head
      ),
      // add from and to id
    },
    openTime: R.path([0, 'date']),
    closeTime: R.compose(R.prop('date'), R.last),
    open: R.compose(countRate, R.head),
    close: R.compose(countRate, R.last),
    low: countPeaks((a, b) => R.min(a, b)),
    high: countPeaks(R.max),
    volume: sumPath(['takerAmount']),
    quoteAssetVol: sumPath(['makerAmount']),
    numTrades: R.length,
  })),
  mapPairs(R.sort((a, b) => new Date(b.date) - new Date(a.date))),
  R.toPairs,
  R.groupBy(({makerToken, takerToken}) => makerToken.symbol + takerToken.symbol),
  R.filter(R.allPass([R.path(['takerPrice', 'USD']), R.path(['makerPrice', 'USD'])])),
)

const saveRates = (Model) => R.forEach((data) => new Model(data).save())

const zeroXTransformer = async () => {
  try {
    const lastRateClose = await ZeroXTransaction.findOne({ dataSource: '0x-id' }, { date: -1 }).select({ closeTime: 1 })
    const newTransactions = await ZeroXTransaction.find({
      date: { $gt: lastRateClose }
    })
  
    if (!newTransactions.length) {
      console.log('Up to date')
      return
    }
    
    const rates = transformTransactions(newTransactions)
    
    saveRates(Rate1m)(rates)
    
    
  } catch (e) {
    console.log(e)
  }
  
}
