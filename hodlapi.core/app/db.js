const mongoose = require('mongoose');
const config = require('config');

const connect = () => mongoose.connect(
  `mongodb://${config.get('mongodb.host')}:${config.get('mongodb.port')}/${config.get('mongodb.dbName')}`, {
    useNewUrlParser: true,
  },
).then((data) => {
  mongoose.set('useCreateIndex', true);
  return data;
});

module.exports = {
  connect,
};
