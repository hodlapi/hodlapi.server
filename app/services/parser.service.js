const axios = require('axios');
const R = require('ramda');
const { store } = require('./storage.service');

const createRequest = url => axios.default.get(url);

const parseBinance = ({ symbol, intervals }) => new Promise((resolve, reject) => {
    console.log(symbol, intervals);
    store(symbol, intervals).then(() => {
        resolve();
    });
});

module.exports = {
    parseBinance
};
