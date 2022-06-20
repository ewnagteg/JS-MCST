import { countPeices } from './func_lib.mjs';

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

const xor = new XorGen(12314);

// force inline functions, marginally faster than dev_getm
export function getMoves(p1, p1k, p2, p2k, player, arr, stack) {
    arr[0] = 1;
    arr[1] = 0;
    let c = 0;
    if (player == 1)
        c = p1 | p1k;
    else
        c = p2 | p2k;

    let p1p = p1|p1k;
    let p2p = p2|p2k;
    // let board = p1p|p2p;
    while (c != 0) {
        // let i = bsf(c);
        let i = 32;
        let v = c;
        v &= -v;
        if (v) i--;
        if (v & 0x0000FFFF) i -= 16;
        if (v & 0x00FF00FF) i -= 8;
        if (v & 0x0F0F0F0F) i -= 4;
        if (v & 0x33333333) i -= 2;
        if (v & 0x55555555) i -= 1;

        c &= (~(1 << i));
        let x = i >> 2;
        let y =  ((i & 3) << 1) + 1 - ((i >> 2) & 1);;
        let n = 1 << i;
        // if (p1 & p1k) == 0, no peices
        let king = ((p1k|p2k)&n)==n;

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



        let canmove = 0;
        let mask = 0;
        // let visted_from;
        let p = i;
        let board = (p1p|p2p)&shift;
        // init stack
        stack[0] = p;
        stack[1] = 0;
        let j = 1;
        while (j != 0) {
            // pop of stack
            p = stack[2*(j - 1 ) + 0];
            mask = stack[2*(j - 1) + 1];
            j--;

            x = (p >> 2);
            y =  ((p & 3) << 1) + 1 - ((p >> 2) & 1);
            canmove = 0;
            // visted |= (1 << p);
            let current = (1 << p);
            if (x > 1) { // jump left
                if ((player == 1 || king) && y < 6) { // down
                    let target = (8*(x-2) + (y+2)) >>> 1;
                    let jn = 1 << ((8*(x-1) + (y+1)) >>> 1);
                    let tn = 1 << target;
                    if (player==1) {
                        if (0 == (board & tn) && ((jn & p2p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target;
                            stack[2*j + 1] = mask;
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    } else {
                        if (0 == (board & tn) && ((jn & p1p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target; 
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    }
                }
                if ((player == -1 || king) && y > 1) { // up
                    // canmove |= ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, -1, -1);
                    let target = (8*(x-2) + (y-2)) >>> 1;
                    let jn = 1 << ((8*(x-1) + (y-1)) >>> 1);
                    let tn = 1 << target;
                    if (player==1) {
                        if (0 == (board & tn) && ((jn & p2p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target;
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    } else {
                        if (0 == (board & tn) && ((jn & p1p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target;
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    }
                }
            }
            if (x < 6) { // right
                if ((player == 1 || king) && y < 6) { // down
                    let target = (8*(x+2) + (y+2)) >>> 1;
                    let jn = 1 << ((8*(x+1) + (y+1)) >>> 1);
                    let tn = 1 << target;
                    if (player==1) {
                        if (0 == (board & tn) && ((jn & p2p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target; 
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    } else {
                        if (0 == (board & tn) && ((jn & p1p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target; 
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    }
                }
                if ((player != 1 || king) && y > 1) { // up
                    let jn = 1 << ((8*(x+1) + (y-1)) >>> 1);
                    let target = (8*(x+2) + (y-2)) >>> 1;
                    let tn = 1 << target;
                    if (player==1) {
                        if (0 == (board & tn) && ((jn & p2p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target; 
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    } else {
                        if (0 == (board & tn) && ((jn & p1p)&~mask) == jn) {
                            mask |= jn;
                            stack[2*j + 0] = target;
                            stack[2*j + 1] = mask; 
                            j++;
                            canmove = 1;
                            mask ^= jn;
                        }
                    }
                }
            }
            
            if (!canmove && p != i) {
                if (arr[1]==0) {
                    arr[1] = 1;
                    arr[0] = 1;
                }
                if (player==1) {
                    if (king || y==7) {
                        arr[4*arr[0] + 0] = np1;
                        arr[4*arr[0] + 1] = np1k|current;
                        arr[4*arr[0] + 2] = np2&~mask;
                        arr[4*arr[0] + 3] = np2k&~mask;
                        arr[0]++;
                    } else {
                        arr[4*arr[0] + 0] = np1|current;
                        arr[4*arr[0] + 1] = np1k;
                        arr[4*arr[0] + 2] = np2&~mask;
                        arr[4*arr[0] + 3] = np2k&~mask;
                        arr[0]++;
                    }
                } else {
                    if (king || y==0) {
                        arr[4*arr[0] + 0] = np1&~mask;
                        arr[4*arr[0] + 1] = np1k&~mask;
                        arr[4*arr[0] + 2] = np2;
                        arr[4*arr[0] + 3] = np2k|current;
                        arr[0]++;
                    } else {
                        arr[4*arr[0] + 0] = np1&~mask;
                        arr[4*arr[0] + 1] = np1k&~mask;
                        arr[4*arr[0] + 2] = np2|current;
                        arr[4*arr[0] + 3] = np2k;
                        arr[0]++;
                    }
                }
            }
        }

        x = i >> 2;
        y =  ((i & 3) << 1) + 1 - ((i >> 2) & 1);;

    
        if (arr[1] == 0) {
            if (x > 0) { // left
                if ((player == 1 || king) && y < 7) {  // down
                    let target = (8*(x-1) + (y+1)) >>> 1;
                    let tn = 1 << target;
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
                } if ((player != 1 || king) && y > 0) {  // up
                    let target = (8*(x-1) + (y-1)) >>> 1;
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  {// p1
                            if (king || (y-1)==7) {
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
                            if (king || (y-1)==0) {
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
            }
            if (x < 7) {  // jump right
                if ((player == 1 || king) && y < 7) {  // down
                    let target = (8*(x+1) + (y+1)) >>> 1;
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  { // p1
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
                if ((player != 1 || king) && y > 0) {  // up
                    let target = (8*(x+1) + (y-1)) >>> 1;
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1) { // p1
                            if (king || (y-1)==7) {
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
                            if (king || (y-1)==0) {
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
            }
        }
    }
}

export function gen_start() {
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
    // or  [825307441, 0, -1936946036, 0]
    return [p1_, 0, p2_, 0];
}

export function playout(p1, p1k, p2, p2k, player, arr, stack) {
    let cnt = 0;
    while (cnt < 60) {
        if (player==1)
            if ((p2|p2k)==0)
                return 1;
        else
            if ((p1|p1k)==0)
                return -1;
        getMoves(p1, p1k, p2, p2k, player, arr, stack);
        if (arr[0] == 1)
            return player * -1;
        let r = (xor.next() >>> 0) & (arr[0]-2)
        r++;
        p1 = arr[4*r + 0];
        p1k = arr[4*r + 1];
        p2 = arr[4*r + 2];
        p2k = arr[4*r + 3];
        player *= -1;
        cnt++;
    }
    return (countPeices(p1|p1k)-countPeices(p2|p2k)) % 2;
}

export  function multiplePlayout(p1, p1k, p2, p2k, player, playouts, arr, stack) {
    let result = 0;
    for (let i=0; i<playouts; i++)
        result += playout(p1, p1k, p2, p2k, player, arr, stack);
    return result;
}

export class TypedArrays {
    constructor() {
        this.buffer = new ArrayBuffer(4*32*4);
        this.arr = new Int32Array(this.buffer);
        this.sbuffer = new ArrayBuffer(4*32);
        this.stack = new Int32Array(this.sbuffer);
    }
}