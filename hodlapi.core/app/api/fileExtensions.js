const Router = require('koa-router');

const router = new Router();

const fileExtensions = async (ctx) => {
  ctx.body = [
    {
      name: 'CSV',
      ext: '.csv',
    },
    {
      name: 'JSON',
      ext: '.json',
    },
  ];
};

router.get('/fileExtensions', fileExtensions);

module.exports = router;
