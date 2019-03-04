const R = require('ramda');
const config = require('config');
const mandrill = require('mandrill-api/mandrill');
const moment = require('moment');
const logger = require('../logger');

const baseMessageConfig = email => ({
  from_email: config.get('mandrill.fromEmail'),
  from_name: config.get('mandrill.fromName'),
  to: [{
    email,
    name: 'Recipient Name',
    type: 'to',
  }],
  important: false,
});

const sendEmail = ({ data }, done) => {
  const {
    email,
    link,
  } = data;
  const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
  const message = {
    ...baseMessageConfig(email),
    subject: `Parsing completed ${moment().format('YYYY-MM-DD')}`,
    global_merge_vars: [{
      name: 'LINK_TO_CRYPTO_DATA',
      content: link,
    }],
  };
  // eslint-disable-next-line camelcase
  const template_name = 'crypto-data-ready';
  // eslint-disable-next-line camelcase
  const template_content = [{
    name: 'example name',
    content: 'example content',
  }];
  mandrillClient.messages.sendTemplate({
    template_name,
    template_content,
    message,
    async: false,
    ip_pool: 'Main Pool',
  }, (result) => {
    logger.log({
      level: 'info',
      message: `[mandrill] ${R.toString(result)}`,
    });
  }, (e) => {
    logger.log({
      level: 'error',
      message: `A mandrill error occurred: ${e.name} - ${e.message}`,
    });
  });
  done();
};

const sendSignUpEmail = ({ data }, done) => {
  const {
    email,
    password,
  } = data;
  const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
  const message = {
    ...baseMessageConfig(email),
    subject: 'Check out demo of HodlAPI',
    global_merge_vars: [{
      name: 'Password',
      content: password,
    }],
  };
  // eslint-disable-next-line camelcase
  const template_name = 'hodlapi-signup-email';
  // eslint-disable-next-line camelcase
  const template_content = [{
    name: 'example name',
    content: 'example content',
  }];
  mandrillClient.messages.sendTemplate({
    template_name,
    template_content,
    message,
    async: false,
    ip_pool: 'Main Pool',
  }, (result) => {
    logger.log({
      level: 'info',
      message: `[mandrill] ${R.toString(result)}`,
    });
  }, (e) => {
    logger.log({
      level: 'error',
      message: `A mandrill error occurred: ${e.name} - ${e.message}`,
    });
  });
  done();
};

const sendRestorePasswordEmail = ({
  data,
}, done) => {
  const {
    email,
    password,
  } = data;
  const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
  const message = {
    ...baseMessageConfig(email),
    subject: 'Password restore | HodlAPI',
    global_merge_vars: [{
      name: 'Password',
      content: password,
    }],
  };
  // eslint-disable-next-line camelcase
  const template_name = 'hodlapi-signup-email';
  // eslint-disable-next-line camelcase
  const template_content = [{
    name: 'example name',
    content: 'example content',
  }];
  mandrillClient.messages.sendTemplate({
    template_name,
    template_content,
    message,
    async: false,
    ip_pool: 'Main Pool',
  }, (result) => {
    logger.log({
      level: 'info',
      message: `[mandrill] ${R.toString(result)}`,
    });
  }, (e) => {
    logger.log({
      level: 'error',
      message: `A mandrill error occurred: ${e.name} - ${e.message}`,
    });
  });
  done();
};

module.exports = {
  sendEmail,
  sendSignUpEmail,
  sendRestorePasswordEmail,
};
