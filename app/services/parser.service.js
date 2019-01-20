const axios = require('axios');
const R = require('ramda');

const createRequest = url => axios.default.get(url);

const parseBinance = params => Promise.resolve();

module.exports = {
    parseBinance
};
