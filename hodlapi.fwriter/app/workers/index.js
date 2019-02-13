const { store } = require("./store.worker");
const { archiveList } = require("./archive.worker");

module.exports = {
    store,
    archiveList
};