const { userMiddleware } = require('./user');
const { aclMiddleware } = require('./acl');

module.exports = {
  userMiddleware,
  aclMiddleware,
};
