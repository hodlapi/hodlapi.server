const mongoose = require("mongoose")
const baseModel = require("./BaseModel")

const ZeroXTransaction = mongoose.Schema({
  ...baseModel,
  amount: mongoose.SchemaTypes.Mixed,
  data: mongoose.SchemaTypes.Date,
  feeRecipient: mongoose.SchemaTypes.String,
  transactionId: mongoose.SchemaTypes.String,
  makerAddress: mongoose.SchemaTypes.String,
  makerAmount: mongoose.SchemaTypes.String,
  makerFee: mongoose.SchemaTypes.Mixed,
  makerPrice: mongoose.SchemaTypes.Mixed,
  makerToken: mongoose.SchemaTypes.Mixed,
  orderHash: mongoose.SchemaTypes.String,
  protocolVersion: mongoose.SchemaTypes.Number,
  status: mongoose.SchemaTypes.String,
  takerAddress: mongoose.SchemaTypes.String,
  takerAmount: mongoose.SchemaTypes.String,
  takerFee: mongoose.SchemaTypes.Mixed,
  takerPrice: mongoose.SchemaTypes.Mixed,
  takerToken: mongoose.SchemaTypes.Mixed,
  totalFees: mongoose.SchemaTypes.Mixed,
  transactionHash: mongoose.SchemaTypes.String,
})


module.exports = mongoose.model('zeroXTransaction', ZeroXTransaction);