const R = require('ramda');
const {
  User
} = require('../models');

const userMiddleware = () => async (ctx, next) => {
  const stateUser = R.pathOr({}, ['state', 'user'])(ctx);
  const _id = R.pathOr(-1, ['id'])(stateUser);
  const {
    email,
    role
  } = await User.findOne({
    _id
  }).populate('role').exec() || {};

  ctx.state.user = {
    ...stateUser,
    email,
    role
  };
  await next();
}

module.exports = {
  userMiddleware
};
