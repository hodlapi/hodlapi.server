const axios = require('axios');
const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const logger = require('../logger');

const queue = require('../queue');

const router = new Router();

const getRequests = async (ctx) => {
    
};

router.get('/requests', getRequests);

module.exports = router;