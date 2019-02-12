const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const Request = mongoose.Schema({
    ...baseModel,
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    currencyPairs: [{ type: mongoose.Schema.Types.ObjectId, ref: "CurrencyPair" }],
    intervals: [mongoose.SchemaTypes.String],
    fromDate: mongoose.SchemaTypes.Date,
    toDate: mongoose.SchemaTypes.Date,
    status: mongoose.SchemaTypes.Mixed,
    description: mongoose.SchemaTypes.String,
    extensions: [mongoose.SchemaTypes.String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: "File" }]
}, { timestamps: true });

module.exports = mongoose.model('Request', Request);
