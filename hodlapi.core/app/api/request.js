const Router = require('koa-router');
const R = require('ramda');
const moment = require('moment');
const config = require('config');
const logger = require('../logger');
const {
  CurrencyPair,
  Request,
  RequestStatuses
} = require('../models');
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
    user: R.pathOr(null, ['id'])(userObject),
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
      R.map(interval =>
        queue.create('fwriter.write', {
          requestId: request._id,
          interval,
          pair
        }))(intervals)
    )
  )(currencyPairs);

  const jobsFinishedPromises = R.map(jobPromise => new Promise((resolve, reject) => {
    jobPromise.then(
      job => {
        job.save();
        job.on('complete', files => {
          resolve(files);
        });
      },
      err => reject(errr)
    )
  }))(jobs);

  Promise.all(jobsFinishedPromises).then(
    results => {
      let archiveJob = queue.create('fwriter.archiveResult', {
        files: R.flatten(results),
        requestId: request._id
      });
      archiveJob.save();
      archiveJob.on('complete', result => {
        request.resultUrl = `${config.get('filesStorageUrl')}/${result}`;
        request.status = RequestStatuses.ready;
        request.save();
        queue
          .create('core.sendFileEmail', {
            email: userObject.email,
            link: `${config.get('filesStorageUrl')}/${result}`
          })
          .save();
      });
    },
    err => {
      ctx.throw(500, err);
    }
  );

  ctx.status = 200;
  ctx.body = {
    status: 200,
    message: 'Success'
  };
};

const createParse = async ctx => {
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
    user: R.pathOr(null, ['id'])(userObject),
    dataSource: dataSource,
    currencyPairs: [...currencyPairs],
    intervals,
    fromDate: start,
    toDate: end,
    extensions,
    status: RequestStatuses.created
  }).save();

  const jobs = R.compose(
    R.map(e => new Promise((resolve, reject) => {
      e.then(job => {
        job.save();
        job.on('complete', e => {
          resolve(e);
        });
      });
    })),
    R.flatten,
    R.map(pair => R.map(async interval => queue.create('parser.binance.rates', {
      pair: await CurrencyPair.findOne({
        _id: pair
      }).exec(),
      interval,
      start,
      end
    }))(intervals))
  )(currencyPairs);
  Promise.all(jobs).then(data => {
    console.log(data);

  });
};

router.post('/request', requestValidator, create);
router.post('/request/parse', requestValidator, createParse);

module.exports = router;
