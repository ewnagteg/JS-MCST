import { MCTS } from './mcts.mjs';
import { getMoves, TypedArrays, gen_start } from './dev_inline_getm.mjs';
import { prettifyMoves } from './func_lib.mjs';
import { getMiniMaxMove } from './minimax.mjs';
import { getAlphaBetaMove } from './alpha_beta.mjs';

const encode = (x, y) => (8*x + y) >>> 1;
const getX = (index) => index >> 2;
const getY = (index) => ((index & 3) << 1) + 1 - ((index >> 2) & 1);

export class Game {
    constructor(canvas, text, aiselect, topaiselect) {
        this.ctx = canvas.getContext('2d');
        this.size = 48;
        this.state = gen_start();
        this.selected = null;
        this.player = 1;
        this.stack = [];
        this.text = text;
        this.arrays = new TypedArrays();
        this.hlight = true;
        this.buff_count = 0;
        this.buffer = 15; // frames between when player goes and ai goes
        this.aielement = aiselect;
        this.topaiselect = topaiselect;
        this.ai = '';
        this.topai = '';
        this.selectAI();
    }

    render(state) {
        for (let sq=0; sq<32; sq++) {
            let x = getX(sq);
            let y = getY(sq);
            if (this.selected==sq)
                this.ctx.fillStyle = '#FFBF7E';
            else
                this.ctx.fillStyle = '#b3b3b3';
            this.ctx.fillRect(x * this.size, y * this.size, this.size, this.size);
            let tn = 1 << sq;
            let p1 = state[0] | state[1];
            let p2 = state[2] | state[3];
            let king = ((state[1] | state[3]) & tn) == tn;
            if ((p1 & tn) == tn) {
                this.ctx.fillStyle = '#FF7E7E';
                this.ctx.beginPath();
                this.ctx.arc(x * this.size + this.size/2, y * this.size + this.size/2, this.size/2, 0, 2 * Math.PI);
                this.ctx.fill();
            } else if ((p2 & tn) == tn) {
                this.ctx.fillStyle = '#7EFFBF';
                this.ctx.beginPath();
                this.ctx.arc(x * this.size + this.size/2, y * this.size + this.size/2, this.size/2, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            if (king) {
                this.ctx.fillStyle = '#FFFF7E';
                this.ctx.beginPath();
                this.ctx.arc(x * this.size + this.size/2, y * this.size + this.size/2, this.size/4, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
        if (this.player==-1 || this.topai != 'manual')
            this.next();
    }

    setTextMessage(text) {
        this.text.innerHTML = text;
    }
    selectSquare(sq) {
        let moves = this.pretty();
        if (this.player == 1 && sq in moves) {
            this.selected = sq;
        } else if (this.selected in moves) {
            let possible = moves[this.selected];
            let turn = null;
            for (let move of possible) {
                if (move.target == sq) {
                    turn = move.state;
                }
            }
            if (turn) {
                this.state = turn;
                this.selected = sq;
                this.player *= -1;
            }
        }
    }

    isKing(sq) {
        let tn = 1 << sq;
        return tn == ((this.state[1]|this.state[3]) & tn);
    }

    isSquare(sq) {
        return 0 <= sq && sq < 32;
    }

    next() {
        if (this.buff_count < this.buffer) {
            this.buff_count++;
            return;
        }
        this.buff_count=0;
        this.selected = -1;
        let move = null;
        let ai = this.player == -1 ? this.ai : this.topai;
        if (ai == 'mcst')
            move = MCTS(this.state, this.player, 3, this.arrays);
        else if (this.ai == 'minimax')
            move = getMiniMaxMove(...this.state, this.player, 6);
        else if (ai == 'alpha-beta')
            move = getAlphaBetaMove(...this.state, this.player, 15);
        if (move) {
            this.pushState();
            this.state = move;
            this.player *= -1;
        }
    }

    pop() {
        if (this.player == -1) {
            this.newState = this.stack.pop();
            this.player = this.newState.pop();
            this.state = this.newState;
        } else {
            this.newState = this.stack.pop();
            this.newState = this.stack.pop();
            this.player = this.newState.pop();
            this.state = this.newState;
        }
    }

    pushState() {
        this.stack.push([...this.state, this.player]);
    }

    selectAI() {
        this.ai = this.aielement.value;
        this.topai = this.topaiselect.value;
    }

    mouseClick(event) {
        if (this.player == 1 && this.topai == 'manual') {
            let rect = canvas.getBoundingClientRect();
            let x = Math.floor((event.clientX - rect.left)/ this.size);
            let y = Math.floor((event.clientY - rect.top) / this.size);
            if ((x % 2) != (y % 2)) {
                let sq = encode(x, y);
                if (this.player == 1)
                    this.selectSquare(sq);
            }
        }
    }

    balance() {
        let p1 = countPeices(this.state[0]);
        let p1k = countPeices(this.stack[1]);
        let p2 = countPeices(this.state[2]);
        let p2k = countPeices(this.stack[3]);
        console.log('Balennce of game is: ' + (p1 + 2*p1k - p2 - 2*p2k));
        return p1 + 2*p1k - p2 - 2*p2k;
    }

    reset() {
        this.state = gen_start();
        this.player = 1;
        this.stack = [];
        this.text.innerHTML = '';
    }

    getMoves() {
        let arr = [];
        getMoves(...this.state, this.player, this.arrays.arr, this.arrays.stack);
        for (let i=1; i<this.arrays.arr[0]; i++) {
            arr.push(
                [
                    this.arrays.arr[4*i + 0],
                    this.arrays.arr[4*i + 1],
                    this.arrays.arr[4*i + 2],
                    this.arrays.arr[4*i + 3],
                ]
            );
        }
        return arr;
    }

    pretty() {
        return prettifyMoves(this.state, this.getMoves(), this.player);
    }
}

function is_square(x, y) {
    return ((x % 2) == 1) != ((y % 2) == 1);
}

function render(p1, p1k, p2, p2k) {
    let state = {};
    // let squares = [8, 24, 40, 56, 1, 17, 33, 49, 10, 26, 42, 58, 3, 19, 35,
    //        51, 12, 28, 44, 60, 5, 21, 37, 53, 14, 30, 46, 62, 7, 23, 39, 55];

    let squares = [];
    for (let i=0; i<32; i++)
        squares.push(i);

    for (let sq of squares) {
        let n = 1 << sq;
        if ((n & p1) == n)
            state[sq] = 1;
        else if ((n & p1k) == n)
            state[sq] = 2;
        else if ((n & p2) == n)
            state[sq] = -1;
        else if ((n & p2k) == n)
            state[sq] = -2;
    }
    
    let board = '';
    for (let y=0; y<8; y++) {
        let line = ''
        for (let x=0; x<8; x++) {
            let symb = '   '
            if (is_square(x, y)) {
                let i = encode(x, y);
                symb = ' . ';
                if (state[i]) {
                    if (state[i] > 0)
                        symb = '@';
                    else
                        symb = '%';
                    if (Math.abs(state[i]) > 1)
                        symb = '[' + symb + ']';
                    else
                        symb = ' ' + symb + ' ';
                }
            }
            line += symb;
        }
        board += line + '\n';
    }
    console.log(board);
}

function state_render(state) {
    render(state[0], state[1], state[2], state[3])
}