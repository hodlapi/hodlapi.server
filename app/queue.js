const kue = require('kue-scheduler');
const zip = require('zip-dir');
const R = require('ramda');
const moment = require('moment');
const rimraf = require('rimraf');
const config = require('config');
const mandrill = require('mandrill-api/mandrill');
const logger = require('./logger');

const queue = kue.createQueue({
  redis: {
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    auth: config.get('redis.auth')
  }
});

// queue.process('binance', ({ data }, done) => {
//     const { email, symbol, intervals = [], startDate, endDate } = data;

//     const folderName = `${moment().format('YYYY-MM-DD')}_${symbol}`;
//     if (fs.existsSync(`./static/${folderName}`)) {
//         rimraf.sync(`./static/${folderName}`)
//     }
//     if (fs.existsSync(`./static/${folderName}.zip`)) {
//         fs.unlinkSync(`./static/${folderName}.zip`);
//     }
//     Promise.all(
//         R.compose(
//             R.map(interval => binanceParser({ symbol, interval, startDate, endDate, startDate }))
//         )(intervals)
//     ).then(() => {
//         console.log('Parsing completed');
//         logger.log({
//             level: 'info',
//             message: `Parsing [${symbol} ${email}] completed`
//         });
//         zip(`./static/${folderName}`, { saveTo: `./static/${folderName}.zip` }, err => {
//             if (fs.existsSync(`./static/${folderName}`)) {
//                 rimraf.sync(`./static/${folderName}`)
//             }
//             queue.create('sendEmail', { email, link: `${config.get('hostingUrl')}/${folderName}.zip` }).save();
//             done();
//         });
//     })
//         .catch(e => {
//             logger.log({
//                 level: 'error',
//                 message: `[parsing queue error] ${R.toString(e)}`
//             });
//             done();
//         });
// });

// queue.process('sendEmail', ({ data }, done) => {
//     const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
//     const message = {
//         'subject': `Parsing completed ${moment().format('YYYY-MM-DD')}`,
//         'from_email': config.get('mandrill.fromEmail'),
//         'from_name': config.get('mandrill.fromName'),
//         'to': [{
//             'email': data.email,
//             'name': "Recipient Name",
//             'type': "to"
//         }],
//         'global_merge_vars': [
//             {
//                 "name": "LINK_TO_CRYPTO_DATA",
//                 "content": data.link
//             }
//         ],
//         "important": false
//     };
//     var template_name = "crypto-data-ready";
//     var template_content = [{
//         "name": "example name",
//         "content": "example content"
//     }];
//     mandrillClient.messages.sendTemplate({ template_name, template_content, message, async: false, ip_pool: "Main Pool" }, (result) => {
//         logger.log({
//             level: 'info',
//             message: `[mandrill] ${R.toString(result)}`
//         });
//     }, (e) => {
//         logger.log({
//             level: 'error',
//             message: `A mandrill error occurred: ${e.name} - ${e.message}`
//         });
//     });
//     done();
// });

const currencyParsingJob = queue.createJob('parser.binance.currencies', null).attempts(1).priority('normal');

queue.now(currencyParsingJob);

module.exports = queue;
