const mongoose = require('mongoose');
const baseModel = require('./BaseModel');
const RequestStatuses = Object.freeze({
    created: 'created',
    fetchingData: 'fetchingData',
    preparingFiles: 'preparingFiles',
    ready: 'ready'
});

const Request = mongoose.Schema({
    ...baseModel,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dataSource: { type: mongoose.Schema.Types.ObjectId, ref: 'DataSource' },
    currencyPairs: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'CurrencyPair' }
    ],
    intervals: [mongoose.SchemaTypes.String],
    fromDate: mongoose.SchemaTypes.Date,
    toDate: mongoose.SchemaTypes.Date,
    status: mongoose.SchemaTypes.String,
    description: mongoose.SchemaTypes.String,
    extensions: [mongoose.SchemaTypes.String],
    files: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}, { timestamps: true });

module.exports = {
    Request: mongoose.model('Request', Request),
    RequestStatuses
};