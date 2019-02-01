const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const CurrencyPair = mongoose.Schema({
    ...baseModel,
    name: mongoose.SchemaTypes.String,
    fromId: { type: Mongoose.Schema.Types.ObjectId, ref: "Currency" },
    toId: { type: Mongoose.Schema.Types.ObjectId, ref: "Currency" }
});

module.exports = {
    CurrencyPair: mongoose.model("CurrencyPair", CurrencyPair)
};