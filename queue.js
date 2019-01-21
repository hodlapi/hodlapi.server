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

            done();
        });
    })
        .catch(e => {
            throw new Error(e);
            done();
        });
});

queue.process('sendEmail', ({ email, message }, done) => {
    const mandrillClient = new mandrill.Mandrill(config.get('mandrill.apiKey'));
    var message = {
        "html": "<p>Example HTML content</p>",
        "text": "Example text content",
        "subject": "example subject",
        "from_email": "contact@finkee.org",
        "from_name": "Example Name",
        "to": [{
            "email": "vladb951@gmail.com",
            "name": "Recipient Name",
            "type": "to"
        }],
        "headers": {
            "Reply-To": "vladb951@gmail.com"
        },
        "important": false
    };
    mandrillClient.messages.send({ message, async: false, ip_pool: "Main Pool" }, function (result) {
        console.log(result);
    }, function (e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
    done();
});

// queue.create('sendEmail', 'test').save();

module.exports = queue;