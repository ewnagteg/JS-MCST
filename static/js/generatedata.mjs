import { MCTS } from "./mcts.mjs";
import { getMoves, TypedArrays, gen_start } from './dev_inline_getm.mjs';

class GamePlayer {
    constructor() {
        this.state = gen_start();
        this.player = 1;
        this.cuurentgame = [];
        this.games = [];
        this.arrays = new TypedArrays();
    }

    playRandom() {
        this.state = MCTS(this.state, this.player, 0.0, this.arrays);
        this.player *= -1;
    }

    recordGame(time) {
        // TODO: finish this
        for (let j=0; j<6; j++) {
            this.playRandom();
        }
        for (let i=0; i<60; i++) {
            let root = MCTS(this.state, this.player, time, this.arrays, true);
            this.player *= -1;
        }
    }

    demoGame(time) {
        // TODO: finish this
        for (let i=0; i<60; i++) {
            
        }
    }
}

let g = new GamePlayer();
// g.recordGame(3);
// will add command parseing stuff later