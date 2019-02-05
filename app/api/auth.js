const Router = require("koa-router");
const R = require('ramda');
const {
  generateJWT
} = require('../lib');
const bcrypt = require('bcryptjs');
const {
  User
} = require('../models');

const router = new Router();

router.post('/login', async ctx => {
  const {
    login,
    password
  } = ctx.request.body;
  if (!login || !password) {
    ctx.status = 403;
    ctx.body = {
      status: 403,
      message: 'Invalid credentials'
    };
    return;
  }
  const user = await User.findOne({
    login
  });
  if (!user) {
    ctx.status = 401;
    return;
  }
  const isPasswordsMath = await bcrypt.compare(password, R.propOr('', 'password')(user));
  if (isPasswordsMath) {
    ctx.status = 200;
    ctx.response.body = {
      token: generateJWT(user._id)
    };
  } else {
    ctx.status = 401;
  }
});

module.exports = router;
