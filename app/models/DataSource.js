const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const DataSource = mongoose.Schema({
    ...baseModel,
    name: mongoose.SchemaTypes.String,
    lastUpdated: mongoose.SchemaTypes.Date,
    currencyPairs: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'CurrencyPair' }],
    url: mongoose.SchemaTypes.String
});

module.exports = {
    DataSource
};