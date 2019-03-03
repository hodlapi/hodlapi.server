const R = require('ramda');
const {
  User,
} = require('../models');

const userMiddleware = () => async (ctx, next) => {
  const stateUser = R.pathOr({}, ['state', 'user'])(ctx);
  // eslint-disable-next-line no-underscore-dangle
  const _id = R.pathOr(null, ['id'])(stateUser);
  const {
    email,
    role,
  } = await User.findOne({
    _id,
  }).populate('role').exec() || {};

  ctx.state.user = {
    ...stateUser,
    email,
    role,
  };
  await next();
};

module.exports = {
  userMiddleware,
};
