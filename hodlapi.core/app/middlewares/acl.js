const R = require('ramda');

const aclMiddleware = (...roles) => async (ctx, next) => {
  const userRole = R.pathOr('', ['state', 'user', 'role', 'name'])(ctx);
  // eslint-disable-next-line no-unused-expressions
  R.contains(userRole)(roles) ? await next() : ctx.throw(403, 'Permission denied');
};

module.exports = {
  aclMiddleware,
};
