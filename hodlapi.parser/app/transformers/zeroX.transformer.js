const R = require('ramda');
const moment = require('moment');

const intervalMap = {
  '1m': { num: 1, symb: 'm' },
  '15m': { num: 1, symb: 'm' },
  '30m': { num: 1, symb: 'm' },
  '1h': { num: 1, symb: 'h' },
};

const fold = R.curry((fn, data) => R.reduce(fn, R.head(data), R.tail(data) || []));
const mapPair = R.curry((method, [key, data]) => [key, method(data)]);
const mapPairs = fn => R.map(mapPair(fn));
const countRate = data => R.path(['takerPrice', 'USD'], data) / R.path(['makerPrice', 'USD'], data);
const countPeaks = fn => R.compose(fold(fn), R.map(countRate));
const sumPath = path => R.compose(R.sum, R.map(R.compose(parseFloat, R.path(path))));
// eslint-disable-next-line max-len
const sortByDate = oldestFirst => (a, b) => (oldestFirst ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date));

const transformTransactions = R.compose(
  R.fromPairs,
  mapPairs(R.applySpec({
    currencyPair: {
      name: R.compose(
        data => R.concat(R.path(['makerToken', 'symbol'], data), R.path(['takerToken', 'symbol'], data)),
        R.head,
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
  R.groupBy(({ makerToken, takerToken }) => makerToken.symbol + takerToken.symbol),
);


const splitTransactionsByInterval = R.curry((interval, start, data) => {
  if (!data.length) return [];

  const { num, symb } = interval;
  const end = moment(start).add(num, symb).toISOString();
  const groupSize = R.findLastIndex(
    R.propSatisfies(d => (new Date(end) - new Date(d)) > 0, 'date'),
  )(data) + 1;
  return [
    R.take(groupSize, data),
    ...splitTransactionsByInterval(interval, end, R.takeLast(data.length - groupSize, data))
  ];
});

const splitFractionalTransaction = interval => R.compose(
  R.filter(R.length),
  R.reduce(R.concat, []),
  R.map(transactions1h => splitTransactionsByInterval(
    interval,
    R.path([0, 'date'], transactions1h),
    transactions1h,
  )),
);

const zeroXTransformer = async () => {
  try {
    // const lastRateClose = await ZeroXTransaction.findOne({ dataSource: '0x-id' }, { date: -1 }).select({ closeTime: 1 })
    // const newTransactions = await ZeroXTransaction.find({
    //   date: { $gt: lastRateClose }
    // })

    const newTransactions = require('./mock')
      .sort(sortByDate(true))
      .filter(R.allPass([R.path(['takerPrice', 'USD']), R.path(['makerPrice', 'USD'])]));

    if (!newTransactions.length) {
      console.log('Up to date');
      return;
    }

    const splitTransactions1h = splitTransactionsByInterval(
      intervalMap['1h'],
      newTransactions[0].date,
    )(newTransactions);

    const splitTransactions30m = splitFractionalTransaction(intervalMap['30m'])(splitTransactions1h);
    const splitTransactions15m = splitFractionalTransaction(intervalMap['15m'])(splitTransactions1h);
    const splitTransactions5m = splitFractionalTransaction(intervalMap['15m'])(splitTransactions1h);
    const splitTransactions1m = splitFractionalTransaction(intervalMap['1m'])(splitTransactions1h);

    const Rates1h = R.map(transformTransactions, splitTransactions1h);
    const Rates30m = R.map(transformTransactions, splitTransactions30m);
    const Rates15m = R.map(transformTransactions, splitTransactions15m);
    const Rates5m = R.map(transformTransactions, splitTransactions5m);
    const Rates1m = R.map(transformTransactions, splitTransactions1m);
  } catch (e) {
    console.log(e);
  }
};

zeroXTransformer();
