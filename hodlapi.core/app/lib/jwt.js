const jwt = require('jsonwebtoken');
const config = require('config');

const generateJWT = id => jwt.sign({ id }, config.get('jwt.secret'), { expiresIn: config.get('jwt.expiresIn') });

module.exports = {
  generateJWT
};
