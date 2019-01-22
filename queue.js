const kue = require('kue');
const fs = require('fs');
const zip = require('zip-dir');
const R = require('ramda');
const moment = require('moment');
const rimraf = require('rimraf');
const config = require('config');
const mandrill = require('mandrill-api/mandrill');

const { binanceParser } = require('./app/services/parser.service');

const queue = kue.createQueue({
    redis: {
        host: 'redis',
        port: 6379
    }
});

queue.process('binance', ({ data }, done) => {
    const { email, symbol, intervals = [], startDate, endDate } = data;

    const folderName = `${moment().format('YYYY-MM-DD')}_${symbol}`;
    if (fs.existsSync(`./static/${folderName}`)) {
        rimraf.sync(`./static/${folderName}`)
    }
    if (fs.existsSync(`./static/${folderName}.zip`)) {
        fs.unlinkSync(`./static/${folderName}.zip`);
    }
    Promise.all(
        R.compose(
            R.map(interval => binanceParser({ symbol, interval, startDate, endDate, startDate }))
        )(intervals)
    ).then(() => {
        console.log('Parsing completed');
        zip(`./static/${folderName}`, { saveTo: `./static/${folderName}.zip` }, err => {
            if (fs.existsSync(`./static/${folderName}`)) {
                rimraf.sync(`./static/${folderName}`)
            }
            queue.create('sendEmail', { email, link: `${config.get('hostingUrl')}/${folderName}.zip`).save();
            done();
        });
    })
        .catch(e => {
            throw new Error(e);
            done();
        });
});

queue.process('sendEmail', ({ data }, done) => {
    const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
    const message = {
        "subject": "Parsing completed",
        "from_email": "contact@finkee.org",
        "from_name": "CryptoParsing service",
        "to": [{
            "email": data.email,
            "name": "Recipient Name",
            "type": "to"
        }],
        "message": {
            "global_merge_vars": [
                {
                    "name": "LINK_TO_CRYPTO_DATA",
                    "content": data.link
                }
            ],
        },
        "headers": {
            "Reply-To": "vladb951@gmail.com"
        },
        "important": false
    };
    var template_name = "crypto-data-ready";
    var template_content = [{
        "name": "example name",
        "content": "example content"
    }];
    mandrillClient.messages.sendTemplate({ template_name, template_content, message, async: false, ip_pool: "Main Pool" }, function (result) {
        console.log(result);
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
    done();
});

module.exports = queue;