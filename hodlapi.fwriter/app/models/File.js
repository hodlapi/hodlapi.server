const mongoose = require('mongoose');

const File = mongoose.Schema({
    url: mongoose.SchemaTypes.String,
    name: mongoose.SchemaTypes.String,
    extension: mongoose.SchemaTypes.String,
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request' },
});

module.exports = mongoose.model('File', File);