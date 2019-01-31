const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const Request = mongoose.Schema({
    ...baseModel,
    email: mongoose.SchemaTypes.String,
    //user: { type: Schema.Types.ObjectId, ref: "User" },
    currencyPairs: [{ type: Schema.Types.ObjectId, ref: "CurrencyPair" }],
    intervals: [mongoose.SchemaTypes.String],
    fromDate: mongoose.SchemaTypes.Date,
    toDate: mongoose.SchemaTypes.Date,
    RequestDate: mongoose.SchemaTypes.Date,
    status: mongoose.SchemaTypes.Mixed,
    description: mongoose.SchemaTypes.String
});

module.exports = {
    Request: mongoose.model("Request", Request)
};