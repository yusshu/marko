//
// Artificial Stupidity
//
const fs= require('fs');
const { serialize, deserialize } = require('./mkpersist');

const chain = deserialize(require('../data/words.json'));

function train(args) {
    if (args.length < 1) return;
    let node = chain.root;
    for (let i = 0; i < args.length; i++) {
        node = node.addNext(args[i]);
    }
    node.addEnd();
}

function generate() {

    const words = [];
    let node = chain.root;

    while ((node = node.next()) != null) {
        words.push(node.val);
        if (Math.random() < 0.1) {
            // 10% of probability of the bot being lazy and
            // it doesn't to type anymore
            break;
        }
    }

    return words;
}

async function save() {
    return fs.promises.writeFile('./data/words.json', JSON.stringify(serialize(chain)));
}

module.exports = { save, generate, train };