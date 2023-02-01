//
// Artificial Stupidity
//
const fs = require('fs');

/** @type {Array} */
let data = decode(require('../data/words.json'));

function encode(data) {
    return data.map(entry => ({
        w: entry.word,
        p: entry.probabilities,
        i: entry.initializer
    }));
}

function decode(data) {
    return data.map(entry => ({
        word: entry.w,
        probabilities: entry.p,
        initializer: entry.i
    }));
}

function train(args, initializer = true) {

    // Message too short
    if (args.length < 2) return;

    const word = args[0];
    const next = args[1];
    const entries = data.filter(entry => entry.word === word);

    if (entries.length > 0) {
        entries.forEach(entry => {
            entry.probabilities[next] = (entry.probabilities[next] || 0) + 1;
            if (initializer) {
                entry.initializer = true;
            }
        });
    } else {
        const entry = { word, probabilities: { [ next ]: 1 } };
        if (initializer) {
            entry.initializer = true;
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

    let last = words[words.length - 1];

    do {
        // find the next word using the last word's next word possibilities
        const entry = data.find(e => e.word === last); // find the entry for the last word

        if (!entry) {
            // no entry for the last word (so no possibilities for next word)
            break;
        }

        // add the next random word
        const next = randomKeyOf(entry.probabilities);
        words.push(next);
        last = next;
    } while (Math.random() < 0.9); // 90% of probability to continue generating words

    return words;
}

async function save() {
    return fs.promises.writeFile('./data/words.json', JSON.stringify(encode(data)));
}

function randomElementOf(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function randomKeyOf(object) {
    const sum = Object.values(object).reduce((acc, v) => acc + v, 0);
    const index = Math.floor(Math.random() * sum);
    let acc = 0;
    for (const [ key, value ] of Object.entries(object)) {
        acc += value;
        if (acc > index) {
            return key;
        }
    }
    throw new Error('Could not find a value');
}

module.exports = { save, generate, train };