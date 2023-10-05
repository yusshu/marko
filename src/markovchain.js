/*!
 * Copyright (c) yusshu (Andre Roldan). All rights reserved.
 * Licensed under the MIT license. See license.txt file in the project root for details.
 */

// Value for the Root node
const _Root = Symbol("root");
// Value for the End node
const _End = Symbol("end");

/**
 * Represents a Markov chain, contains a reference to
 * the root (starting) node and also has the pool of
 * all the nodes that exist in this chain.
 *
 * @property {Map<any, MkNode>} nodes The nodes pool
 * @property {MkNode} root The root (starting) node
 * @property {(any) => MkNode} node To get a node
 */
class MarkovChain {

    constructor() {
        this.nodes = new Map();
        this.root = this.node(_Root);
    }

    /**
     * Gets or creates a node by its value.
     *
     * @param {any} val The node value.
     * @returns {MkNode} The node.
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

/**
 * Represents a node in a Markov chain, has value/state
 * and a set of connections (links) to other nodes.
 *
 * @property {any} val The node value or state.
 * @property {MkLink[]} then The connections.
 */
class MkNode {

    /**
     * @param {MarkovChain} chain The chain
     * @param {any} val The node value
     * @param {MkLink[]} then The next nodes
     */
    constructor(chain, val, then) {
        this._chain = chain;
        this.val = val;
        this.then = then;
    }

    /**
     * Adds a next usage for this node.
     *
     * @param {any} nextVal The next value.
     * @param {number} score The score to add.
     * @returns {MkNode} The modified node.
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
     * Adds a usage of the End node for this node.
     *
     * @param score The score to add.
     * @returns {MkNode} The modified node.
     */
    addEnd(score = 1) {
        return this.addNext(_End, score);
    }

    /**
     * Pick the next node randomly.
     *
     * @returns {MkNode|null} The picked node, or null.
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

    /**
     * "Canonizes" the links so that their score is a number
     * between 0 and 1.
     *
     * @returns {MkLink[]} The canonized links
     */
    canonizeThen() {
        const total = this.then
            .reduce((acc, v) => acc + v.score, 0);
        if (total === 0) {
            return this.then;
        }
        return this.then.map(l => new MkLink(l.score / total, l.node));
    }

    hasNext() {
        return this.then.length > 0;
    }

    isRoot() {
        return this.val === _Root;
    }

    isEnd() {
        return this.val === _End;
    }

}

/**
 * Represents a link from a node to another node. Links have
 * scores and, the greater the score is, the more probable
 * the node is to be selected as next.
 *
 * @property {number} score The link score.
 * @property {MkNode} node The linked node.
 */
class MkLink {

    /**
     * @param {number} score The link score.
     * @param {MkNode} node The linked node.
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

module.exports = { MarkovChain, _Root, _End, MkNode };