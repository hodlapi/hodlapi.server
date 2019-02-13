const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const logger = require('../logger');
const { CurrencyPair, Request, RequestStatuses } = require('../models');
const validator = require('koa-joi-validate');
const joi = require('joi');

const queue = require('../queue');

const router = new Router();

const requestValidator = validator({
    body: {
        dataSource: joi.string().required(),
        intervals: joi.array().required(),
        currencyPairs: joi.array().required(),
        range: joi.array(),
        extensions: joi.array()
    }
});

const create = async ctx => {
    let {
        dataSource,
        intervals,
        currencyPairs,
        range: [start, end] = [],
        extensions = ['json', 'csv']
    } = ctx.request.body;

    logger.log({
        level: 'info',
        message: `Request created for ${R.path(['state', 'user', 'email'])(ctx)}`
    });

    start = start || '2017-01-01';
    end = end || moment().format('YYYY-MM-DD');
    const userObject = R.pathOr(null, ['state', 'user'])(ctx);

    const request = await new Request({
        user: R.pathOr(null, ['_id'])(userObject),
        dataSource: dataSource,
        currencyPairs: [...currencyPairs],
        intervals,
        fromDate: start,
        toDate: end,
        extensions,
        status: RequestStatuses.created
    }).save();
    const jobs = R.compose(
        R.flatten,
        R.map(pair =>
            R.map(async interval =>
                queue.create('fwriter.write', {
                    requestId: request._id,
                    interval,
                    pair
                })
            )(intervals)
        )
    )(currencyPairs);

    R.map(e => {
        e.then(job => {
            job.save();
            job.on('complete', result => {
                queue
                    .create('core.sendFileEmail', {
                        email: userObject.email,
                        link: `${config.get('hostingUrl')}/${result}`
                    })
                    .save();
            });
        });
    })(jobs);

    ctx.status = 200;
    ctx.body = {
        status: 200,
        message: 'Success'
    };
};

router.post('/request', requestValidator, create);

module.exports = router;