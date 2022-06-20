function is_square(x, y) {
    return ((x % 2) == 1) != ((y % 2) == 1);
}
const encode = (x, y) => (8*x + y) >>> 1;
const getX = (index) => index >> 2;
const getY = (index) => ((index & 3) << 1) + 1 - ((index >> 2) & 1);

export function render(p1, p1k, p2, p2k) {
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

export function state_render(state) {
    render(state[0], state[1], state[2], state[3])
}