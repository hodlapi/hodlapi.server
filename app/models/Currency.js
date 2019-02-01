const mongoose = require("mongoose");
const baseModel = require("./BaseModel");

const Currency = mongoose.Schema({
    ...baseModel,
    name: mongoose.SchemaTypes.String,
    fullName: mongoose.SchemaTypes.String,
    symbol: mongoose.SchemaTypes.String
});

module.exports = {
    Currency
};