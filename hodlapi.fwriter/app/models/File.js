const mongoose = require('mongoose');

const File = mongoose.Schema({
    url: mongoose.SchemaTypes.String,
    name: mongoose.SchemaTypes.String,
    extension: mongoose.SchemaTypes.String
});

module.exports = mongoose.model('File', File);