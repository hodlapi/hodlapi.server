const { MongoClient, Server } = require('mongodb');
const config = require('config');

const client = new MongoClient(new Server(config.get('mongodb.host'), config.get('mongodb.port')), { native_parser: true });

module.exports = client;