const R = require('ramda');
const config = require('config');
const mandrill = require('mandrill-api/mandrill');
const logger = require('../logger');
const moment = require('moment');

const sendEmail = ({ data }, done) => {
  const {
    email,
    link
  } = data;
  const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
  const message = {
    'subject': `Parsing completed ${moment().format('YYYY-MM-DD')}`,
    'from_email': config.get('mandrill.fromEmail'),
    'from_name': config.get('mandrill.fromName'),
    'to': [{
      'email': email,
      'name': "Recipient Name",
      'type': "to"
    }],
    'global_merge_vars': [{
      "name": "LINK_TO_CRYPTO_DATA",
      "content": link
    }],
    "important": false
  };
  var template_name = "crypto-data-ready";
  var template_content = [{
    "name": "example name",
    "content": "example content"
  }];
  mandrillClient.messages.sendTemplate({
    template_name,
    template_content,
    message,
    async: false,
    ip_pool: "Main Pool"
  }, (result) => {
    logger.log({
      level: 'info',
      message: `[mandrill] ${R.toString(result)}`
    });
  }, (e) => {
    logger.log({
      level: 'error',
      message: `A mandrill error occurred: ${e.name} - ${e.message}`
    });
  });
  done();
};

module.exports = {
  sendEmail
};
