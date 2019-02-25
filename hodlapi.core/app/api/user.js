const R = require('ramda');
const Router = require('koa-router');
const {
  User
} = require('../models');
const {
  aclMiddleware
} = require('../middlewares');
const validator = require('koa-joi-validate');
const joi = require('joi');

const router = new Router();

/**
 * Validators block
 */

const listParamsValidator = validator({
  params: {
    offset: joi.number(),
    limit: joi.number()
  }
});

const createUserValidator = validator({
  body: {
    email: joi.required().email()
  }
});

const removeUserValidator = validator({
  params: {
    id: joi.number().required()
  }
});

const updateUserValidator = validator({

});

/**
 * Actions block
 */
const list = async ctx => {};

const index = async ctx => {};

const create = async ctx => {};

const remove = async ctx => {};

const update = async ctx => {};

/**
 * Routes block
 */
router.get('/:id', index);
router.get('/', aclMiddleware('SUPERADMIN', 'ADMIN'), listParamsValidator, list);
router.post('/', aclMiddleware('SUPERADMIN', 'ADMIN'), createUserValidator, create);
router.put('/:id', aclMiddleware('SUPERADMIN', 'ADMIN'), update);
// TODO: implement redirect to /:id with user.id
// router.put('/me', );
router.delete('/', aclMiddleware('SUPERADMIN', 'ADMIN'), removeUserValidator, remove);

module.exports = router;
