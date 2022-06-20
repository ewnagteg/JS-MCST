export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function bsf(v) {
    // unsigned int v;      // 32-bit word input to count zero bits on right
    let c = 32; // c will be the number of zero bits on the right
    v &= -v;
    if (v) c--;
    if (v & 0x0000FFFF) c -= 16;
    if (v & 0x00FF00FF) c -= 8;
    if (v & 0x0F0F0F0F) c -= 4;
    if (v & 0x33333333) c -= 2;
    if (v & 0x55555555) c -= 1;
    return c;
}

export function genMoveList(moveArr) {
    let arr = [];
    for (let i=1; i<moveArr; i++) {
        arr.push(
            [
                moveArr[4*i + 0],
                moveArr[4*i + 1],
                moveArr[4*i + 2],
                moveArr[4*i + 3],
            ]
        );
    }
    return arr;
}

export function prettifyMoves(state, moves, player) {
    // { peice: [{move:target, state:state}]}
    let result = {};
    // let board = state[0]|state[1]|state[2]|state[3];
    let checkers = player == 1 ? state[0] : state[2];
    let kings = player == 1 ? state[1] : state[3];
    let peices = checkers|kings;
    for (let m of moves) {
        let t_board = player == 1 ? m[0]|m[1] : m[2]|m[3];
        let diff = t_board^peices;
        let peice = bsf(diff&peices);
        let target = bsf(diff&t_board);
        if (peice in result) {
            result[peice].push({
                target: target,
                state: m,
            });
        } else {
            result[peice] = [
                {
                    target: target,
                    state: m,
                }
            ];
        }
    }
    return result;
}

export function countPeices(n) {
    let count = 0;
    while(n != 0) {
        n = n & (n-1);
        count++;
    }
    return count;
}

export function bsfCount(n) {
    let cnt = 0;
    while (n!=0) {
        cnt++;
        let i = bsf(n);
        n &=~(1 << i);
    }
    return cnt;
}