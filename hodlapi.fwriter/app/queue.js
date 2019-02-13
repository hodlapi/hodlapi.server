const kue = require("kue");
const config = require("config");
const R = require("ramda");
const { store } = require("./workers");
const { DataSource } = require("./models");
const { json, csv, constants } = require("./lib");

const formattersMap = {
    json: e => json(e),
    csv: e => csv(constants.binanseCsvFields, e)
};

const queue = kue.createQueue({
    redis: {
        host: config.get("redis.host"),
        port: config.get("redis.port"),
        auth: config.get("redis.auth")
    }
});

kue.prototype.processAsync = (name, concurrency, handler) => {
    return queue.process(name, concurrency, (job, done) => {
        return handler(job)
            .then(() => done(null))
            .catch(done);
    });
};

queue.processAsync("fwriter.write", async({ data }, done) => {
    const { requestId, interval, pair } = data;

    Promise.all(
        R.map(ext =>
            store(requestId, interval, pair, ext, formattersMap[ext])
        )(request.extensions)
    ).then(
        data => {
            done(null, data);
        },
        err => done(err)
    );
});

module.exports = queue;