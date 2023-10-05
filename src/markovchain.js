const _Root = Symbol("root");
const _End = Symbol("end");

/**
 * @property {Map<any, MkNode>} nodes
 * @property {MkNode} root
 * @property {(any) => MkNode} node
 */
class MarkovChain {

    constructor() {
        this.nodes = new Map();
        this.root = this.node(_Root);
        this.end = this.node(_End);
    }

    /**
     * @param val
     * @returns {MkNode}
     */
    node(val) {
        let node = this.nodes.get(val);
        if (node) {
            return node;
        } else {
            node = new MkNode(this, val, []);
            this.nodes.set(val, node);
            return node;
        }
    }

}

class MkNode {

    /**
     * @param {MarkovChain} chain
     * @param {any} val
     * @param {MkLink[]} then
     */
    constructor(chain, val, then) {
        this._chain = chain;
        this.val = val;
        this.then = then;
    }

    /**
     * Adds a next usage for this node.
     *
     * @param {any} nextVal
     * @param {number} score
     */
    addNext(nextVal, score = 1) {
        const savedLink = this.then.find(link => link.node.val === nextVal);
        if (savedLink) {
            // if there is a saved link with that value, just increase its score
            savedLink.score += score;
            return savedLink.node;
        } else {
            // if there isn't a saved link with that value, create a new one
            // and set it to one
            const node = this._chain.node(nextVal);
            this.then.push(new MkLink(score, node));
            return node;
        }
    }

    /**
     * Pick the next node randomly.
     *
     * @returns {MkNode|null}
     */
    next() {
        if (this.hasNext()) {
            // sum all scores of the next nodes
            const total = this.then
                .reduce((acc, v) => acc + v.score, 0);

            // pick a random number between 0 and the total score
            const at = Math.floor(Math.random() * total);

            // find the value, this makes nodes with more score
            // to be more probable to be selected as next nodes
            let acc = 0;
            const found = this.then
                .find(value => (acc = (acc + value.score)) > at);

            if (found && found.node.val !== _End) {
                return found.node;
            } else {
                // return null for ending nodes too
                return null;
            }
        } else {
            return null;
        }
    }

    hasNext() {
        return this.then.length > 0;
    }

}

class MkLink {

    /**
     * @param {number} score
     * @param {MkNode} node
     */
    constructor(score, node) {
        // note that in our implementation of markov chains,
        // the "score" is an integer, and to obtain the actual
        // probability we have to divide it by the sum of all
        // the scores (but we do something faster that
        // indirectly does that)
        this.score = score;
        this.node = node;
    }

}

module.exports = { MarkovChain, _Root, _End, MkNode, MkLink };