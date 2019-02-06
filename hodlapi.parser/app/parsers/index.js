const { binanceParser } = require('./binance.parser');
const { binanceCurrenciesParser } = require('./currencies.parser');
const { zeroXParser } = require('./zeroX.parser')

module.exports = {
  binanceParser,
  binanceCurrenciesParser,
  zeroXParser
}
