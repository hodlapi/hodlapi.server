const { sendEmail, sendSignUpEmail, sendRestorePasswordEmail } = require('./mail.worker');
const { parseHistoricalData } = require('./parser.creators');

module.exports = {
  sendEmail,
  sendSignUpEmail,
  parseHistoricalData,
  sendRestorePasswordEmail,
};
