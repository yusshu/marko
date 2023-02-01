//
// Artificial Stupidity
//
const fs = require('fs');

/** @type {Array} */
let data = require('../data/words.json');

function train(args, initializer = true) {

    // Message too short
    if (args.length < 2) return;

    const word = args[0];
    const next = args[1];
    const entries = data.filter(entry => entry.word === word);

    if (entries.length > 0) {
        entries.forEach(entry => entry.probabilities.push(next));
    } else {
        const entry = { word, probabilities: [ next ] };
        if (initializer) {
            entry.initializer = initializer;
        }
        data.push(entry);
    }

    // continue training
    train(args.slice(1), false);
}

function generate(words = []) {

    // find the first word if word array is empty
    if (words.length === 0) {
        const initializers = data.filter(entry => entry.initializer);
        if (initializers.length > 0) {
            // initializers found, use a random one
            words.push(randomElementOf(initializers).word);
        } else {
            // no initializers found, use a random word
            words.push(randomElementOf(data).word);
        }
    }

    // find the next word using the last word's next word possibilities
    const last = words[words.length - 1];
    const entry = data.find(e => e.word === last); // find the entry for the last word

    if (!entry) {
        // no entry for the last word (so no possibilities for next word)
        return words;
    }

    // add the next random word
    words.push(randomElementOf(entry.probabilities));

    // 90% of probability to continue generating words
    if (Math.random() < 0.9) {
        words = generate(words);
    }

    return words;
}

async function save() {
    return fs.promises.writeFile('./data/words.json', JSON.stringify(data));
}

function randomElementOf(array) {
    return array[Math.floor(Math.random() * array.length)];
}

module.exports = { save, generate, train };