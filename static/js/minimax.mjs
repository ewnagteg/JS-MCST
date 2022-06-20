import { getMoves } from './getm.mjs';
import { countPeices } from './func_lib.mjs';

export function minimax(p1, p1k, p2, p2k, player, max_depth) {
    if (max_depth > 0) {
        let moves = getMoves(p1, p1k, p2, p2k, player);
        if (moves.length == 0)
            return player * -1;
        let best = player == 1 ? -1000 : 1000;
        for (let move of moves) {
            let test = minimax(...move, player*-1, max_depth-1);
            best = player == 1 ? (test > best ? test : best) : (test < best ? test : best);
        }
        return best;
    }
    return eval_board(p1, p1k, p2, p2k, player);
}

export function getMiniMaxMove(p1, p1k, p2, p2k, player, max_depth) {
    let moves = getMoves(p1, p1k, p2, p2k, player);
    if (moves.length == 0)
        return null;
    let current = moves[0];
    let best = player == 1 ? -1000 : 1000; 
    for (let move of moves) {
        let test = minimax(...move, player*-1, max_depth-1); 
        current = player == 1 ? (test > best ? move : current) : (test < best ? move : current);
        best = player == 1 ? (test > best ? test : best) : (test < best ? test : best);
    }
    console.log(`best score is ${best}`); 
    return current;
}

export function eval_board(p1, p1k, p2, p2k, player) {
    if (player==1)
        if ((p2|p2k)==0)
            return Infinity;
    else
        if ((p1|p1k)==0)
            return -Infinity;
    let p1s = countPeices(p1) + (player==1 ? 2.1 : 3) * countPeices(p1k);
    let p2s = (countPeices(p2) + (player==-1 ? 2.1 : 3) * countPeices(p2k));
    let king_adv =  ((p2k==0 && p1k!=0) ? 5 : ((p1k==0 && p2k!=0) ? -5 : 0));
    return p1s - p2s + king_adv;
}

