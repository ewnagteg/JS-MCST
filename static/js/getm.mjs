const encode = (x, y) => (8*x + y) >>> 1;
const getX = (index) => index >> 2;
const getY = (index) => ((index & 3) << 1) + 1 - ((index >> 2) & 1);

function ch(peice, initial, p1, p1k, p2, p2k, king, player, captures, x, y, left, down) {
    let canmove = 0;
    let jumped = encode((x 
        + left*1), (y + down*1));
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
                capture(target, initial, p1, p1k, p2, p2k, king, player, captures)
            }
        }
    }
    return canmove;
}

function capture(peice, initial, p1, p1k, p2, p2k, king, player, captures) {
    let x = getX(peice);
    let y = getY(peice);
    let canmove = 0
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
        let tn = 1 << peice
        if (player == 1) { // p1
            if (king || y==7)
                captures.push([p1 , p1k | tn, p2, p2k]);
            else
                captures.push([p1 | tn, p1k, p2, p2k]);
        } else {
            if (king || y==0)
                captures.push([p1 , p1k, p2, p2k | tn]);
            else
                captures.push([p1, p1k, p2 | tn, p2k]);
        }
    }
    return captures;
}

function bsf(v) {
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

export function getMoves(p1, p1k, p2, p2k, player, moves=[], captures=[]) {
    let c = 0;
    if (player == 1)
        c = p1 | p1k;
    else
        c = p2 | p2k;

    let p1p = p1|p1k;
    let p2p = p2|p2k;
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

        capture(i, i, np1, np1k, np2, np2k, king, player, captures);
    
        if (captures.length == 0) {
            if (x > 0) { // left
                if ((player == 1 || king) && y < 7) {  // down
                    let target = encode((x-1), (y+1));
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  {// p1
                            if (king || (y+1)==7)
                                moves.push([np1 , np1k | tn, np2, np2k]);
                            else
                                moves.push([np1 | tn, np1k, np2, np2k]);
                        } else {
                            if (king || (y+1)==0)
                                moves.push([np1 , np1k, np2, np2k | tn]);
                            else
                                moves.push([np1, np1k, np2 | tn, np2k]);
                        }
                    }
                }
                if ((player != 1 || king) && y > 0) {  // up
                    let target = encode((x-1), (y-1));
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  {// p1
                            if (king || (y-1)==7)
                                moves.push([np1 , np1k | tn, np2, np2k]);
                            else
                                moves.push([np1 | tn, np1k, np2, np2k]);
                        } else {
                            if (king || (y-1)==0)
                                moves.push([np1 , np1k, np2, np2k | tn]);
                            else
                                moves.push([np1, np1k, np2 | tn, np2k]);
                        }
                    }
                }
            }
            if (x < 7) {  // jump right
                if ((player == 1 || king) && y < 7) {  // down
                    let target = encode((x+1), y+1);
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  {// p1
                            if (king || (y+1)==7)
                                moves.push([np1 , np1k | tn, np2, np2k]);
                            else
                                moves.push([np1 | tn, np1k, np2, np2k]);
                        } else {
                            if (king || (y+1)==0)
                                moves.push([np1 , np1k, np2, np2k | tn]);
                            else
                                moves.push([np1, np1k, np2 | tn, np2k]);
                        }
                    }
                }
                if ((player != 1 || king) && y > 0) {  // up
                    let target = encode((x+1), (y-1));
                    let tn = 1 << target;
                    if (((p1p & tn) == 0) && ((p2p & tn) == 0)) {
                        if (player == 1)  {// p1
                            if (king || (y-1)==7)
                                moves.push([np1 , np1k | tn, np2, np2k]);
                            else
                                moves.push([np1 | tn, np1k, np2, np2k]);
                        } else {
                            if (king || (y-1)==0)
                                moves.push([np1 , np1k, np2, np2k | tn]);
                            else
                                moves.push([np1, np1k, np2 | tn, np2k]);
                        }
                    }
                }
            }
        }
    }
    return captures.length == 0 ? moves : captures;
}


function gen_start() {
    let p1_ = 0;
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