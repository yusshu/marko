const { MarkovChain, _Root, _End } = require('./markovchain');

const MK_ROOT = {
    value: ['$ROOT'],
    is: v => (Array.isArray(v) && v[0] === '$ROOT')
};
const MK_END = {
    value: ['$END'],
    is: v => (Array.isArray(v) && v[0] === '$END')
};

const VAL_KEY = 'w';
const THEN_KEY = 'p';

/**
 * @param {MarkovChain} chain
 * @return {any}
 */
function serialize(chain) {
    const res = [];
    for (const node of chain.nodes.values()) {
        // determine the val property, converts
        // the _Root symbol to json serializable type
        let val = node.val;
        if (val === _Root) {
            val = MK_ROOT.value;
        } else if (val === _End) {
            // do not serialize end, it is unnecessary
            continue;
        }

        // build the "then" part
        let then;
        if (!node.hasNext()) {
            then = undefined;
        } else {
            // it's written as an array of pairs like:
            // [
            //    [ 5, "world" ],
            //    [ 3, "hello" ]
            // ]
            then = [];
            for (const link of node.then) {
                let linkVal = link.node.val;
                if (linkVal === _End) {
                    linkVal = MK_END.value;
                }
                then.push([ link.score, linkVal ]);
            }
        }

        res.push({
            [ VAL_KEY ]: val,
            [ THEN_KEY ]: then
        });
    }
    return res;
}

/**
 * @param {any} obj
 * @return {MarkovChain}
 */
function deserialize(obj) {
    const chain = new MarkovChain();
    for (const serializedNode of obj) {
        // deserialize the val property, also converts from
        // json elements to symbols when required (root, end)
        let val = serializedNode[VAL_KEY];
        if (MK_ROOT.is(val)) {
            val = _Root;
        }

        // get the node from the chain (node pool)
        const node = chain.node(val);

        // parse next nodes
        const then = serializedNode[THEN_KEY];
        if (then === undefined) {
            // pass, leave it empty
        } else if (typeof then === 'object' && !Array.isArray(then)) {
            // legacy format: { "key": score, "key": score }
            for (const [ nextVal, score ] of Object.entries(then)) {
                node.addNext(MK_END.is(nextVal) ? _End : nextVal, score);
            }
        } else {
            // new format: [ [score,key],[score,key] ]
            for (const entry of then) {
                const score = entry[0];
                const nextVal = entry[1];
                node.addNext(MK_END.is(nextVal) ? _End : nextVal, score);
            }
        }

        // legacy "initializer" setting
        if (serializedNode['i']) {
            chain.root.addNext(node.val);
        }
    }
    return chain;
}

module.exports = { serialize, deserialize };