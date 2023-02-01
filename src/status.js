const fs = require('fs');
let data = require('../data/status.json');
const status = {
    collect: false,
    talk: false
};

function configureProperty(property) {
    Object.defineProperty(status, property, {
        get() {
            return data[property];
        },
        set(value) {
            data[property] = value;
            // mutate on json file too
            fs.promises.writeFile('./data/status.json', JSON.stringify(data, null, 2))
                .catch(console.error);
        },
        enumerable: true
    });
}

configureProperty('collect');
configureProperty('talk');

module.exports = status;