import { getMoves, multiplePlayout } from './dev_inline_getm.mjs';

function XorGen(seed) {
    var me = this;

    // Set up generator function.
    me.next = function() {
        var t = me.x ^ (me.x << 11);
        me.x = me.y;
        me.y = me.z;
        me.z = me.w;
        return me.w ^= (me.w >> 19) ^ t ^ (t >> 8);
    };

    function init(me, seed) {
        me.x = seed;
        me.y = 0;
        me.z = 0;
        me.w = 0;
        // Discard an initial batch of 64 values.
        for (var k = 64; k > 0; --k) {
        me.next();
        }
    }

    init(me, seed);
}

var ncount = 0;

class MCTSNode {
    constructor(p1, p1k, p2, p2k, player, parent) {
        this.children = null;
        this.visted = 0;
        this.score = 0;
        this.p1 = p1;
        this.p1k = p1k;
        this.p2 = p2;
        this.p2k = p2k;

        this.player = player;
        this.parent = parent;
        this.depth = 0;
        if (parent)
            this.depth = parent.depth + 1;
        ncount++;
    }

    uct(total_visit, node_win_score, node_visit) {
        if (node_visit == 0)
            return Infinity; // big num;
        return (node_win_score / node_visit) + 1.41 * ( Math.log(total_visit)  / node_visit )**0.5;
    }

    bestChild() {
        const max = this.children.reduce((prev, current) => 
            ((this.uct(this.visted, prev.score, prev.visted) > this.uct(this.visted, current.score, current.visted)) ? prev : current)
        ); 
        return max;
    }

    bestChildState() {
        let best = this.mostVistedChild();
        return [best.p1, best.p1k, best.p2, best.p2k];
    }

    expand(arr, stack) {
        getMoves(this.p1, this.p1k, this.p2, this.p2k, this.player, arr, stack);
        this.children = [];
        if (arr[0] > 1) {
            for (let i=1; i<arr[0]; i++) {
                this.children.push(new MCTSNode(arr[4*i+0], arr[4*i+1], arr[4*i+2], arr[4*i+3], this.player*-1, this));
            }
        }
    }

    getRandomChild() {
        let r = Math.floor(Math.random() * this.children.length);
        return this.children[r];
    }

    mostVistedChild() {
        const max = this.children.reduce((prev, current) => 
            (prev.visted > current.visted) ? prev : current
        ); 
        return max;
    }
}


function selectNode(root) {
    let node = root;
    while (node.children) {
        if (node.children.length == 0)
            return node;
        node = node.bestChild();
    }
    return node;
}

function backPropogate(node, result, player, mp) {
    let temp = node;
    while (temp) {
        temp.visted += mp;
        if (temp.player == -1) {
            temp.score += result;
        } else if (temp.player == 1) {
            temp.score -= result;
        }
        temp = temp.parent;
    }
}

export function MCTS(state, player, time, arrays, info=false) {
    let arr = arrays.arr;
    let stack = arrays.stack;
    let mp = 200;
    getMoves(...state, player, arr, stack);
    if (arr[0]==1)
        return null;
    if (arr[0]==2) {
        return [arr[4], arr[5], arr[6], arr[7]];
    }
        
    let root = new MCTSNode(...state, player, null);
    let node = root;
    let s = Date.now();
    let e = s + time*1000;
    let cnt = 0;
    ncount = 0;
    let depth = 0;
    while (Date.now() < e) {
        node = selectNode(root);
        node.expand(arr, stack);
        if (node.depth > depth)
            depth = node.depth;
        if (node.children.length > 0)
            node = node.getRandomChild();
        let result = multiplePlayout(node.p1, node.p1k, node.p2, node.p2k, node.player, mp, arr, stack);
        backPropogate(node, result, player, mp);
        cnt += mp;
    }
    let end = Date.now();
    let dt = (end-s)/1000;
    console.log(`Did max ${depth}, nodes created ${ncount}`);
    depth = 0;
    console.log(`Did ${cnt/ dt} playouts/second`);
    console.log(`Root node score: ${root.score/root.visted}`);
    console.log(`Root node score: ${root.score/root.visted}`);
    if (info)
        return root;
    return root.bestChildState();
}