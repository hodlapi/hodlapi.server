const Router = require('koa-router');
const R = require('ramda');
const {
    generateJWT
} = require('../lib');
const bcrypt = require('bcryptjs');
const {
    User
} = require('../models');
const config = require('config');
const queue = require('../queue');
const logger = require('../logger');
const validator = require('koa-joi-validate');
const joi = require('joi');

const router = new Router();

const loginValidator = validator({
    body: {
        email: joi.string().email().required(),
        password: joi.string().required()
    }
});

router.post('/login', loginValidator, async ctx => {
    const {
        email,
        password
    } = ctx.request.body;
    const user = await User.findOne({
        email: R.toLower(email)
    });
    if (!user) {
        ctx.throw(401, 'Invalid credentials');
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
        ctx.throw(401, 'Invalid credentials');
    }
});

router.post('/create', async ctx => {
    let {
        login
    } = ctx.request.body;
    if (ctx.request.body.test === 'test') {
        ctx.status = 200;
        return;
    }
    logger.log({
        level: 'info',
        message: ctx.request.body
    });
    logger.log({
        level: 'info',
        message: ctx.request.body.email
    });
    if (ctx.request.body.email) {
        login = ctx.request.body.email;
    }
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
    queue
        .create('core.sendSignUpEmail', {
            email: login,
            password: generatedPassword
        })
        .save();
    ctx.status = 200;
});

router.post('/register', async ctx => {
    let {
        email,
        password
    } = ctx.request.body;
    if (!email) {
        ctx.status = 400;
        ctx.body = {
            message: 'No email'
        };
        return;
    }

    const user = await User.findOne({
        userName: email
    });
    if (user) {
        ctx.status = 400;
        ctx.body = {
            message: 'User with such userName already exists'
        };
        return;
    }

    new User({
        email: email,
        userName: email,
        password: await bcrypt.hash(password, 10)
    }).save();
    ctx.status = 200;
});

module.exports = router;