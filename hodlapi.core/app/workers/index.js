const { sendEmail, sendSignUpEmail } = require('./mail.worker');
const { parseHistoricalData } = require('./parser.creators');

module.exports = {
  sendEmail,
  sendSignUpEmail,
  parseHistoricalData,
};
