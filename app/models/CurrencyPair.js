const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const CurrencyPair = mongoose.Schema({
    ...baseModel,
    name: mongoose.SchemaTypes.String,
    fromId: { type: mongoose.SchemaTypes.ObjectId, ref: "Currency" },
    toId: { type: mongoose.SchemaTypes.ObjectId, ref: "Currency" }
});

module.exports = {
    CurrencyPair
};