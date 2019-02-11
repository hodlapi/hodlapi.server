const {
  zeroXParser
} = require('../parsers')
const {
  ZeroXTransaction
} = require('../models')

const zeroXWorker = () => ZeroXTransaction
    .countDocuments()
    .then(zeroXParser)
    .then((diff) => {
      console.log(`loaded ${diff} transactions`);
      return diff;
    });

module.exports = {
  zeroXWorker
}