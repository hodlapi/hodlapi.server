const zip = require("zip-dir");
const R = require("ramda");

const archiveList = (archiveName, files) => {
    return new Promise((res, rej) => {
        try {
            zip(
                `./static`, {
                    saveTo: `./static/${archiveName}.zip`,
                    filter: (path, stat) =>
                        !!R.find(file => path.indexOf(file.url.substring(1)) !== -1, files)
                },
                err => (err ? rej(err) : res(`${archiveName}.zip`))
            );
        } catch (ex) {
            console.log(ex);
        }
    });
};

module.exports = {
    archiveList
};