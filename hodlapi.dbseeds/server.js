const config = require('config');
const seeder = require('mongoose-seed');
const mongoose = require('mongoose');

const seedsData = [{
    model: 'DataSource',
    documents: require('./seeds/DataSources.json')
}];

seeder.connect(`mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.dbName')}`, {
    useNewUrlParser: true
}, () => {
    seeder.loadModels([
        'models/DataSource.js'
    ]);

    seeder.clearModels([
            'DataSource'
        ],
        () => {
            seeder.populateModels(seedsData, () => {
                seeder.disconnect();
            });
        });
});

if (process.env.NODE_ENV === 'production') {
    process.on('uncaughtException', function (error) {
        process.exit(1);
    });

    process.on('unhandledRejection', function (error) {
        process.exit(1);
    });
}