const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const logger = require('../logger');
const {
  CurrencyPair,
  Request
} = require('../models');
const validator = require('koa-joi-validate');
const joi = require('joi');

const queue = require('../queue');

const router = new Router();

const requestValidator = validator({
  body: {
    dataSource: joi.string().required(),
    intervals: joi.array().required(),
    pairs: joi.array().required(),
    range: joi.array(),
    extensions: joi.array()
  }
});

const create = async ctx => {
  let {
    dataSource,
    intervals,
    pairs,
    range: [start, end] = [],
    extensions = ['json', 'csv']
  } = ctx.request.body;

  logger.log({
    level: 'info',
    message: `Request created for ${R.path(['user', 'email'])(ctx)}`
  });

  start = start || '2017-01-01';
  end = end || moment().format('YYYY-MM-DD');

  const request = await new Request({
    user: R.pathOr(null, ['state', 'user', '_id'])(ctx),
    currencyPairs: [...pairs],
    intervals,
    fromDate: start,
    toDate: end,
    extensions
  }).save();
  const jobs = R.compose(
    R.flatten,
    R.map(pair =>
      R.map(async interval => queue.create('fwriter.write', {
        pair: await CurrencyPair.findOne({
          _id: pair
        }),
        dataSourceId: dataSource,
        interval,
        range: {
          start,
          end
        },
        request,
        extensions
      }))(intervals)
    )
  )(pairs);

  R.map(e => {
    e.then(job => {
      job.save();
      job.on('complete', result => {
        queue.create('core.sendFileEmail', {
          email,
          link: `${config.get('hostingUrl')}/${result}`
        }).save();
      });
    });
  })(jobs);

  ctx.status = 200;
  ctx.body = {
    status: 200,
    message: 'Success'
  };
}

router.post('/request', requestValidator, create);

module.exports = router;
