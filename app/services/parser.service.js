const axios = require('axios');
const R = require('ramda');

const createRequest = url => axios.default.get(url);

const parseBinance = params => R.compose();

module.exports = {
    parseBinance
};
