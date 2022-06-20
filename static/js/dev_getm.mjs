function encode(x, y)  {
    return (8*x + y) >>> 1;
}
const getX = (index) => index >> 2;
const getY = (index) => ((index & 3) << 1) + 1 - ((index >> 2) & 1);


function ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, left, down) {
    let canmove = 0;
    let jumped = encode((x + left*1), (y + down*1));
    let target = encode((x + left*2), (y + down*2));
    let jn = 1 << jumped;
    let tn = 1 << target;
    if (((p1 | p2 | p2k | p1k) & jn) == jn && ((p1 | p2 | p2k | p1k) & tn) == 0) {
        let shift = (~(1 << jumped));
        if (player == 1) {
            if (((p2k | p2) & jn) == jn) {
                canmove = 1;
                p2 &= shift;
                p2k &= shift;
                capture(target, initial, p1, p1k, p2, p2k, king, player, captures);
            }
        } else {
            if (((p1k | p1) & jn) == jn) {
                canmove = 1;
                p1 &= shift;
                p1k &= shift;
                capture(target, initial, p1, p1k, p2, p2k, king, player, captures);
            }
        }
    }
    return canmove;
}

function capture(peice, initial, p1, p1k, p2, p2k, king, player, captures) {
    let x = getX(peice);
    let y = getY(peice);
    let canmove = 0;
    if (x > 1) {  // jump left
        if ((player == 1 || king) && y < 6) // down
            canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, -1, 1);
        if ((player != 1 || king) && y > 1)  // up
            canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, -1, -1);
    }
    if (x < 6) {  // jump right
        if ((player == 1 || king) && y < 6)  // down
            canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, 1, 1);
        if ((player != 1 || king) && y > 1)  // up
            canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, 1, -1);
    }
    if (!canmove && initial != peice) {
        let tn = 1 << peice;
        if (captures[1] = 0) {
            captures[0] = 0;
            captures[1] = 1;
        }
        if (player == 1) { // p1
            if (king || y==7) {
                // captures.push([p1 , p1k | tn, p2, p2k]);
                captures[captures[0]*4 + 0] = p1;
                captures[captures[0]*4 + 1] = p1k | tn;
                captures[captures[0]*4 + 2] = p2;
                captures[captures[0]*4 + 3] = p2k;
                captures[0]++;
            } else {
                // captures.push([p1 | tn, p1k, p2, p2k]);
                captures[captures[0]*4 + 0] = p1 | tn;
                captures[captures[0]*4 + 1] = p1k;
                captures[captures[0]*4 + 2] = p2;
                captures[captures[0]*4 + 3] = p2k;
                captures[0]++;
            }    
        } else {
            if (king || y==0) {
                // captures.push([p1 , p1k, p2, p2k | tn]);
                captures[captures[0]*4 + 0] = p1;
                captures[captures[0]*4 + 1] = p1k;
                captures[captures[0]*4 + 2] = p2 | tn;
                captures[captures[0]*4 + 3] = p2k;
                captures[0]++;
            }
            else {
                captures[captures[0]*4 + 0] = p1;
                captures[captures[0]*4 + 1] = p1k;
                captures[captures[0]*4 + 2] = p2;
                captures[captures[0]*4 + 3] = p2k | tn;
                captures[0]++;
            }
        }
    }
    return captures;
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

function helper(p1p, p2p, tn, player, king, arr, np1, np1k, np2, np2k, x, y) {
    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
        if (player == 1)  {// p1
            if (king || (y+1)==7) {
                // moves.push([np1 , np1k | tn, np2, np2k]);
                arr[4*arr[0] + 0] = np1;
                arr[4*arr[0] + 1] = np1k | tn;
                arr[4*arr[0] + 2] = np2;
                arr[4*arr[0] + 3] = np2k;
                arr[0]++;
            } else {
                arr[4*arr[0] + 0] = np1 | tn;
                arr[4*arr[0] + 1] = np1k;
                arr[4*arr[0] + 2] = np2;
                arr[4*arr[0] + 3] = np2k;
                arr[0]++;
            }
        } else {
            if (king || (y+1)==0) {
                // moves.push([np1 , np1k, np2, np2k | tn]);
                arr[4*arr[0] + 0] = np1;
                arr[4*arr[0] + 1] = np1k;
                arr[4*arr[0] + 2] = np2;
                arr[4*arr[0] + 3] = np2k | tn;
                arr[0]++;
            } else {
                arr[4*arr[0] + 0] = np1;
                arr[4*arr[0] + 1] = np1k;
                arr[4*arr[0] + 2] = np2 | tn;
                arr[4*arr[0] + 3] = np2k;
                arr[0]++;
            }
        }
    }
}

function capHelper(target, p1p, p2p, jn, tn, player, board, visted, mask, stack) {
    if (player==1) {
        if (0 == (board & tn) && (jn & p2p) == jn && (visted & tn) == 0) {
            if ((jn & p2p) == jn) {
                mask |= jn;
                stack.push([target, mask]);
                return 1;
            }
        }
    } else {
        if (0 == (board & tn) && (jn & p1p) == jn && (visted & tn) == 0) {
            if ((jn & p1p) == jn) {
                mask |= jn;
                stack.push([target, mask]);
                return 1;
            }
        }
    }
    return 0;
}

function pushMove(arr, p1, p1k, p2, p2k) {
    arr[4*arr[0] + 0] = p1;
    arr[4*arr[0] + 1] = p1k;
    arr[4*arr[0] + 2] = p2;
    arr[4*arr[0] + 3] = p2k;
    arr[0]++;
    arr[1] = 1;
}

function getMoves(p1, p1k, p2, p2k, player, arr) {
    arr[0] = 1;
    arr[1] = 0;
    let c = 0;
    if (player == 1)
        c = p1 | p1k;
    else
        c = p2 | p2k;

    let p1p = p1|p1k;
    let p2p = p2|p2k;
    let board = p1p|p2p;
    while (c != 0) {
        let i = bsf(c);
        c &= (~(1 << i));
        let x = getX(i);
        let y = getY(i);
        let n = 1 << i;
        let checker = player == 1 ? 1 : -1;
        // if (p1 & p1k) == 0, no peices
        let king = ((p1k|p2k)&n)==n;

        if (king)
            checker *= 2;

        let np1 = p1;
        let np1k = p1k;
        let np2 = p2;
        let np2k = p2k;
        // toggle peice to zero
        let shift = (~(1 << i));
        if (king) {
            np1k &= shift;
            np2k &= shift;
        } else {
            np1 &= shift;
            np2 &= shift;
        }

        // capture(i, i, np1, np1k, np2, np2k, king, player, arr);


        // --- new section ---- //

        let stack = [];
        let canmove = 0;
        let mask = 0;
        let visted = 0;
        let p = i;
        stack.push([p, mask]);
        while (stack.length != 0) {
            let s= stack.pop()
            p = s[0];
            mask = s[1];
            x = getX(p);
            y = getY(p);
            canmove = 0;
            visted |= (1 << p);
            let tn = 1 << p;
            if (x > 1) { // jump left
                if ((player == 1 || king) && y < 6) { // down
                    let jn = 1 << encode(x-1, y+1);
                    let target = encode(x-2, y+2);
                    let tn = 1 << target;
                    canmove |= capHelper(target, p1p, p2p, jn, tn, player, board, visted, mask, stack);
                }
                if ((player != 1 || king) && y > 1) { // up
                    // canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, -1, -1);
                    let jn = 1 << encode(x-1, y-1);
                    let target = encode(x-2, y-2);
                    let tn = 1 << target;
                    canmove |= capHelper(target, p1p, p2p, jn, tn, player, board, visted, mask, stack);
                }
            }
            if (x < 6) { // right
                if ((player == 1 || king) && y < 6) { // down
                    let jn = 1 << encode(x+1, y+1);
                    let target = encode(x+2, y+2);
                    let tn = 1 << target;
                    canmove |= capHelper(target, p1p, p2p, jn, tn, player, board, visted, mask, stack);
                }
                if ((player != 1 || king) && y > 1) { // up
                    let jn = 1 << encode(x+1, y-1);
                    let target = encode(x+2, y-2);
                    let tn = 1 << target;
                    canmove |= capHelper(target, p1p, p2p, jn, tn, player, board, visted, mask, stack);
                }
            }

            if (!canmove && p != i) {
                if (player==1) {
                    if (king || y==7) {
                        pushMove(arr, np1, np1k|tn, np2&~mask, np2k&~mask);
                    } else {
                        pushMove(arr, np1|tn, np1k, np2&~mask, np2k&~mask);
                    }
                } else {
                    if (king || y==0) {
                        pushMove(arr, np1&~mask, np1k&~mask, np2, np2k|tn);
                    } else {
                        pushMove(arr, np1&~mask, np1k&~mask, np2|tn, np2k);
                    }
                }
            }

        }
        x = getX(i);
        y = getY(i);
        // --- end new section --- //



        // numba.uint64[:, :]
        // capture(i, np1, np1k, p2, np2k, king, player, caps)
    
        if (arr[1] == 0) {
            if (x > 0) { // left
                if ((player == 1 || king) && y < 7) {  // down
                    let target = encode((x-1), (y+1));
                    let tn = 1 << target;
                    helper(p1p, p2p, tn, player, king, arr, np1, np1k, np2, np2k, x, y);
                } if ((player != 1 || king) && y > 0) {  // up
                    let target = encode((x-1), (y-1));
                    let tn = 1 << target;
                    helper(p1p, p2p, tn, player, king, arr, np1, np1k, np2, np2k, x, y);
                }
            }
            if (x < 7) {  // jump right
                if ((player == 1 || king) && y < 7) {  // down
                    let target = encode((x+1), y+1);
                    let tn = 1 << target;
                    helper(p1p, p2p, tn, player, king, arr, np1, np1k, np2, np2k, x, y);
                }
                if ((player != 1 || king) && y > 0) {  // up
                    let target = encode((x+1), (y-1));
                    let tn = 1 << target;
                    helper(p1p, p2p, tn, player, king, arr, np1, np1k, np2, np2k, x, y);
                }
            }
        }
    }
    return arr;
}

function gen_start() {
    let p1_ = 0;
    // p1 is on top if (0, 0) is in top left
    let p1 = [
        4, 12, 20, 28,
        0, 8, 16, 24, 
        5, 13, 21, 29
    ];
    
    for (let i of p1)
        p1_ |= 1 << i;

    let p2 = [
        3, 11, 19, 27,
        7, 15, 23, 31,
        2, 10, 18, 26
    ];

    let p2_ = 0;
    for (let i of p2)
        p2_ |= 1 << i;

    return [p1_, 0, p2_, 0];
}

function playout(p1, p1k, p2, p2k, player, arr) {
    let cnt = 0;
    while (cnt < 60) {
        if (player==1)
            if ((p2|p2k)==0)
                return 1;
        else
            if ((p1|p1k)==0)
                return -1;
        getMoves(p1, p1k, p2, p2k, player, arr);
        if (arr[0] == 0)
            return player * -1;
        let r = Math.floor(Math.random() * arr[0]);
        r++;
        // let r = (xor.next() >>> 0) & (moves.length-1)
        p1 = arr[4*r + 0];
        p1k = arr[4*r + 1];
        p2 = arr[4*r + 2];
        p2k = arr[4*r + 3];
        player *= -1;
        cnt++;
    }
    return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function main() {
    //    .     .     @     . 
    // @     .     @     .    
    //    .     .     @     . 
    // .     %     .     .    
    //    .     .     .     . 
    // .     .     .     %    
    //    %     @     .     % 
    // %     .     .     .    
    // let state = [3244033, 0, -2080374136, 0];


    //    .     .     @     . 
    // .     .     @     .    
    //    @     .     @     . 
    // .     %     .     .    
    //    .     .     .     . 
    // .     .     .     %    
    //    %     @     .     % 
    // %     .     .     .    
    let state = [3244064, 0, 2214593160, 0];
    let player = -1;
    let buffer = new ArrayBuffer(4096);
    let uint32view = new Uint32Array(buffer);
    // uint32view[4*uint32view[0]+0];
    // uint32view[0]++;
    getMoves(...state, player, uint32view);
    console.log(uint32view);
    // let state = gen_start();
    // let s = Date.now();
    // let n = 10**5;
    // for (let i=0; i<n; i++) {
    //     playout(...state, player, uint32view);
    // }
    // let e = Date.now();
    // let dt = (e-s)/1000;
    // let num = (n/dt) >>> 0;
    // console.log(`Average speed: ${numberWithCommas(num)} per second`);

    // console.log(uint32view);

}

main();