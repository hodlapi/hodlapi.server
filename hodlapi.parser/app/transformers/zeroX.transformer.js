const R = require('ramda')
const { Types } = require('mongoose')
const {
  ZeroXTransaction, DataSource, CurrencyPair,
  Rate1h, Rate5m, Rate15m, Rate30m, Rate1m,
} = require('../models')
const moment = require('moment')

const { ObjectId } = Types
// const {HGET, HSET} = require('../utils/redis')


const intervalMap = {
  '1m': {num: 1, symb: 'm'},
  '5m': {num: 5, symb: 'm'},
  '15m': {num: 15, symb: 'm'},
  '30m': {num: 30, symb: 'm'},
  '60m': {num: 60, symb: 'm'},
}

const fold = R.curry((fn, data) => R.reduce(fn, R.head(data), R.tail(data) || []))
const mapPair = R.curry((method, [key, data]) => [key, method(data)])
const mapPairs = (fn) => R.map(mapPair(fn))
const countRate = (data) => R.path(['takerPrice', 'USD'], data) / R.path(['makerPrice', 'USD'], data)
const countPeaks = (fn) => R.compose(fold(fn), R.map(countRate))
const sumPath = (path) => R.compose(R.sum, R.map(R.compose(parseFloat, R.path(path))))

const createTransactionsTransformer = ({ dataSourceId, currencyPairs }) => R.compose(
  R.map(R.last),
  mapPairs(R.applySpec({
    // add currency pair
    dataSource: R.always(ObjectId(dataSourceId)),
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
)

const saveRates = (Model) => R.compose(
  R.forEach((data) => {
    const model = new Model(data)
    model.save()
  }),
  R.flatten
)

const splitTransactionsByInterval = R.curry((start, interval, data) => {
  if (!data.length) return []
  
  const {num, symb} = interval
  const end = moment(start).add(num, symb).toISOString()
  
  const leftSize = R.findLastIndex(
    R.propSatisfies(d => (new Date(end) - new Date(d)) < 0, 'date')
  )(data) + 1
  
  return [R.takeLast(data.length - leftSize, data), ...splitTransactionsByInterval(end, interval, R.take(leftSize, data))]
})

const zeroXTransformerInitial = async () => {
  try {
    console.log('starting initial 0x transactions transform')
    const transactionsRes = await ZeroXTransaction.find({}).sort({ date: -1 })
    
    const transactions = R.compose(
      R.filter(
        R.allPass([R.path(['takerPrice', 'USD']), R.path(['makerPrice', 'USD'])])
      ),
      R.defaultTo([])
    )(transactionsRes)
    
    if (!transactions.length) {
      console.log('Up to date')
      return
    }
    
    console.log(`Transactions to transform ${transactions.length}`)
    
    const dataSourceId = await DataSource.findOne({
      name: '0x'
    }).then(R.prop('_id'))
    const currencyPairs = await CurrencyPair.find({})
    
    const startDate = moment(R.last(transactions).date).startOf('hour').format()
    const splitTransactions = splitTransactionsByInterval(startDate)
    const transactionsTransformer = createTransactionsTransformer({ dataSourceId, currencyPairs })
    
    const transactionsToRates = (interval, trns) => R.compose(
      R.map(transactionsTransformer),
      splitTransactions(intervalMap[interval]),
    )(trns)
    
    const rates1h = transactionsToRates('60m', transactions)
    const rates30m = transactionsToRates('30m', transactions)
    const rates15m = transactionsToRates('15m', transactions)
    const rates5m = transactionsToRates('5m', transactions)
    const rates1m = transactionsToRates('1m', transactions)
    
    saveRates(Rate1h)(rates1h)
    saveRates(Rate30m)(rates30m)
    saveRates(Rate15m)(rates15m)
    saveRates(Rate5m)(rates5m)
    saveRates(Rate1m)(rates1m)
    
    // const now = moment().toISOString()
    R.compose(
      // R.forEach((int) => HSET('zeroX', int, now)),
      R.keys,
    )(intervalMap)
    
  } catch (e) {
    console.log(e)
  } finally {
    console.log('initial transform 0x completed')
  }
  
}

// zeroXTransformerInitial()

const conditionalSaveInterval = R.curry(async ({interval, model, now, transactions, transformer}) => {
  const storedIntervalTime = await HGET('zeroX', interval)
  if (moment.duration(moment(now).diff(moment(storedIntervalTime))).asMinutes() < interval.num) {
    return
  }
  
  R.compose(
    saveRates(model),
    R.map(transformer),
    R.filter(R.length),
    splitTransactionsByInterval(interval, now)
  )(transactions)
  
  HSET('zeroX', `key-${interval}`, now)
  
})

const zeroXTransformNewTransactions = async () => {
  try {
    const now = moment().format()
    const newTransactions = await ZeroXTransaction.find({
      date: {
        $gt: now,
      }
    })
      .sort({ date: -1 })
      .then(R.filter(R.allPass([R.path(['takerPrice', 'USD']), R.path(['makerPrice', 'USD'])])))
      
  
    if (!newTransactions.length) {
      console.log('No new transactions')
      return
    }
  
    const dataSourceId = await DataSource.findOne({
      name: '0x'
    }).then(R.prop('_id'))
    const currencyPairs = await CurrencyPair.find({})
  
    const transactionsTransformer = createTransactionsTransformer({ dataSourceId })
    
    const rates1m = R.compose(
      R.map(transactionsTransformer),
      R.filter(R.length),
      splitTransactionsByInterval(
        now,
        intervalMap['1m']
      )
    )(newTransactions)
  
    saveRates(Rate1m)(rates1m)
  
    // R.compose(
    //   R.map(([interval, model]) => conditionalSaveInterval({
    //     interval, model, now, newTransactions, transformer: transactionsTransformer
    //   })),
    //   R.zip(R.__, [Rate5m, Rate15m, Rate30m, Rate1h]),
    //   R.tail,
    //   R.values,
    // )(intervalMap)
  
    console.log('new transactions saved')
    
  } catch (e) {
    console.log(e)
  }
}

// zeroXTransformNewTransactions()