const Router = require('koa-router');
const R = require('ramda');
const { generateJWT } = require('../lib');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const queue = require('../queue');

const router = new Router();

router.post('/login', async ctx => {
    const { login, password } = ctx.request.body;
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
    const isPasswordsMath = await bcrypt.compare(
        password,
        R.propOr('', 'password')(user)
    );
    if (isPasswordsMath) {
        ctx.status = 200;
        ctx.response.body = {
            token: generateJWT(user._id)
        };
    } else {
        ctx.status = 401;
    }
});

router.post('/create', async ctx => {
    const { login } = ctx.request.body;
    if (!login) {
        ctx.status = 400;
        ctx.body = {
            message: 'No login'
        };
        return;
    }
    const user = await User.findOne({
        login
    });
    if (user) {
        ctx.status = 400;
        ctx.body = {
            message: 'User with such login already exists'
        };
        return;
    }
    const generatedPassword = Math.random()
        .toString(36)
        .slice(-8);
    new User({
        login,
        password: await bcrypt.hash(generatedPassword, 10)
    }).save();
    queue.create('core.sendSignUpEmail', {
        login,
        password: generatedPassword
    }).save();
});

module.exports = router;