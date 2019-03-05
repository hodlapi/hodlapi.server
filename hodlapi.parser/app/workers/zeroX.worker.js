const {
  zeroXParser,
} = require('../parsers');
const {
  ZeroXTransaction,
} = require('../models');

const zeroXWorker = () => ZeroXTransaction
  .countDocuments()
  .then(zeroXParser);

module.exports = {
  zeroXWorker,
};
