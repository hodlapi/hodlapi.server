const R = require('ramda');
const Router = require('koa-router');
const validator = require('koa-joi-validate');
const joi = require('joi');
const joiObjectId = require('@wegolook/joi-objectid');
const bcrypt = require('bcryptjs');
const {
  User,
  Role,
} = require('../models');
const {
  aclMiddleware,
} = require('../middlewares');
const {
  coreQueue,
} = require('../queue');

const joiExtended = joi.extend(joiObjectId);
const router = new Router();

const meMiddleware = async (ctx, next) => {
  ctx.params.id = R.pathOr(null, ['state', 'user', 'id'])(ctx);
  await next();
};

/**
 * Validators block
 */

const listParamsValidator = validator({
  params: {
    offset: joi.number(),
    limit: joi.number(),
  },
});

const createUserValidator = validator({
  body: {
    email: joi.string().email().required(),
  },
});

const removeUserValidator = validator({
  params: {
    id: joiExtended.objectId().required(),
  },
});

const updateUserValidator = validator({
  params: {
    id: joiExtended.objectId().required(),
  },
  body: {
    username: joi.string(),
    role: joiExtended.objectId(),
    password: joi.string().min(8),
  },
});

const indexUserValidator = validator({
  params: {
    id: joiExtended.objectId().required(),
  },
});

/**
 * Actions block
 */
const list = async (ctx) => {
  const {
    limit = 20, offset = 0,
  } = R.pathOr({}, ['request', 'query'])(ctx);
  const users = await User.find()
    .populate('role')
    .select('-password')
    .skip(+offset)
    .limit(+limit);
  ctx.body = R.defaultTo([])(users);
};

const index = async (ctx) => {
  const {
    id,
  } = R.pathOr({}, ['params'])(ctx);
  const user = await User.findOne({
    _id: id,
  }).select('-password');

  if (user) {
    ctx.body = user;
  } else {
    ctx.throw(404, 'User not found');
  }
};

const create = async (ctx) => {
  const {
    email,
  } = R.path(['request', 'body'])(ctx);
  const user = await User.findOne({
    email,
  });
  if (user) {
    ctx.throw(400, 'User already exists');
  }
  const password = Math.random()
    .toString(36)
    .slice(-8);
  const role = await Role.findOne({
    name: 'SUBSCRIBER',
  });
  new User({
    email,
    password: bcrypt.hashSync(password, 10),
    role: R.prop('_id')(role),
  }).save();
  coreQueue
    .create('sendSignUpEmail', {
      email,
      password,
    })
    .save();
  ctx.status = 200;
};

const remove = async (ctx) => {
  const {
    id,
  } = R.pathOr({}, ['params'])(ctx);
  const user = await User.findByIdAndDelete({
    _id: id,
  });
  if (user) {
    ctx.body = user;
  } else {
    ctx.throw(404, 'User not found');
  }
};

const update = async (ctx) => {
  const {
    username,
    password,
    role,
  } = R.pathOr({}, ['request', 'body'])(ctx);
  const {
    id,
  } = R.path(['params'])(ctx);
  const user = await User.findOne({ _id: id });
  if (username) {
    user.username = username;
  }
  if (password) {
    user.password = bcrypt.hashSync(password, 10);
  }
  if (role) {
    user.role = role;
  }
  user.save();
  ctx.status = 200;
};

/**
 * Routes block
 */
router.get('/me', meMiddleware, index);
router.get('/:id', aclMiddleware('SUPERADMIN', 'ADMIN'), indexUserValidator, index);
router.get('/', aclMiddleware('SUPERADMIN', 'ADMIN'), listParamsValidator, list);
router.post('/', aclMiddleware('SUPERADMIN', 'ADMIN'), createUserValidator, create);
router.put('/me', meMiddleware, updateUserValidator, async (ctx, next) => {
  ctx.request.body = R.compose(
    R.omit(['role']),
    R.pathOr({}, ['request', 'body']),
  )(ctx);
  await next();
}, update);
router.put('/:id', aclMiddleware('SUPERADMIN', 'ADMIN'), updateUserValidator, update);
router.delete('/:id', aclMiddleware('SUPERADMIN', 'ADMIN'), removeUserValidator, remove);

module.exports = router;
