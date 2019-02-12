const R = require('ramda')
const {ZeroXTransaction, Rate1h, Rate5m, Rate15m, Rate30m} = require('../models')
const moment = require('moment')
const {HGET, HSET} = require('../utils/redis')

const checkTest = (data) => require('fs')
  .writeFileSync(require('path')
    .resolve(__dirname, './test.json'), JSON.stringify(data))


const intervalMap = {
  '1m': {num: 1, symb: 'm'},
  '15m': {num: 15, symb: 'm'},
  '30m': {num: 30, symb: 'm'},
  '60m': {num: 60, symb: 'h'},
}

const fold = R.curry((fn, data) => R.reduce(fn, R.head(data), R.tail(data) || []))
const mapPair = R.curry((method, [key, data]) => [key, method(data)])
const mapPairs = (fn) => R.map(mapPair(fn))
const countRate = (data) => R.path(['takerPrice', 'USD'], data) / R.path(['makerPrice', 'USD'], data)
const countPeaks = (fn) => R.compose(fold(fn), R.map(countRate))
const sumPath = (path) => R.compose(R.sum, R.map(R.compose(parseFloat, R.path(path))))
const sortByDate = (oldestFirst) => (a, b) => oldestFirst ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)

const transformTransactions = R.compose(
  R.map(R.last),
  mapPairs(R.applySpec({
    // currencyPair: {
    //   name: R.compose(
    //     (data) => R.concat(R.path(['makerToken', 'symbol'], data), R.path(['takerToken', 'symbol'], data)),
    //     R.head
    //   ),
    //   // add from and to id
    // },
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
    console.log(data)
    const model = new Model(data)
    model.save()
  }),
  R.flatten
)

const splitTransactionsByInterval = R.curry((interval, start, data) => {
  if (!data.length) return []
  
  const {num, symb} = interval
  const end = moment(start).add(num, symb).toISOString()
  const groupSize = R.findLastIndex(
    R.propSatisfies(d => {
      return (new Date(end) - new Date(d)) > 0
    }, 'date')
  )(data) + 1
  
  return [R.take(groupSize, data), ...splitTransactionsByInterval(interval, end, R.takeLast(data.length - groupSize, data))]
})

const splitFractionalTransaction = R.curry((interval, transactions) => R.compose(
  R.filter(R.length),
  R.reduce(R.concat, []),
  R.map((transactions1h) => splitTransactionsByInterval(
    interval,
    R.path([0, 'date'], transactions1h),
    transactions1h
  )),
)(transactions))

const zeroXTransformerInitial = async () => {
  try {
    const transactionsRes = await ZeroXTransaction.find()
    
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
    
    
    const splitTransactions1h = splitTransactionsByInterval(
      intervalMap['60m'],
      transactions[0].date
    )(transactions)
    
    const splitTransactions30m = splitFractionalTransaction(intervalMap['30m'])(splitTransactions1h)
    const splitTransactions15m = splitFractionalTransaction(intervalMap['15m'])(splitTransactions1h)
    const splitTransactions5m = splitFractionalTransaction(intervalMap['15m'])(splitTransactions1h)
    const splitTransactions1m = splitFractionalTransaction(intervalMap['1m'])(splitTransactions1h)
    
    const rates1h = R.map(transformTransactions, splitTransactions1h)
    const rates30m = R.map(transformTransactions, splitTransactions30m)
    const rates15m = R.map(transformTransactions, splitTransactions15m)
    const rates5m = R.map(transformTransactions, splitTransactions5m)
    const rates1m = R.map(transformTransactions, splitTransactions1m)
    
    saveRates(Rate1h)(rates1h)
    saveRates(Rate30m)(rates30m)
    
    const now = moment().toISOString()
    
    R.compose(
      R.forEach((int) => HSET('zeroX', int, now)),
      R.keys,
    )(intervalMap)
    
  } catch (e) {
    console.log(e)
  }
  
}


const conditionalSaveInterval = R.curry(async (interval, now, transactions) => {
  const storedIntervalTime = await HGET('zeroX', interval)
  if (moment.duration(now.diff(moment(storedIntervalTime))).asMinutes() < intervalMap[interval].num) {
    return
  }
  
  R.compose(
    // save to db
    R.map(transformTransactions),
    R.filter(R.length),
    splitTransactionsByInterval(intervalMap['15m'], now.format().toISOString())
  )(transactions)
  
  HSET('zeroX', `key-${interval}`, now.format())
  
})

const zeroXTransformNewTransactions = async () => {
  const now = moment()
  const newTransactions = require('./mock')
    .sort(sortByDate(true))
    .filter(R.allPass([R.path(['takerPrice', 'USD']), R.path(['makerPrice', 'USD'])]))
  
  if (!newTransactions.length) {
    console.log('No new transactions')
    return
  }
  
  const rates1m = R.compose(
    R.map(transformTransactions),
    R.filter(R.length),
    splitTransactionsByInterval(intervalMap['1m'], newTransactions[0].date)
  )(newTransactions)
  
  // save 1m rates into db
  
  R.compose(
    R.map(conditionalSaveInterval(R.__, now, newTransactions)),
    R.tail,
    R.keys,
  )(intervalMap)
  
}