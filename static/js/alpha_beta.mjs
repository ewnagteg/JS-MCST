import { getMoves } from './getm.mjs';
import { countPeices } from './func_lib.mjs';


function alphabeta(p1, p1k, p2, p2k, player, alpha, beta, max_depth) {
    if (max_depth > 0) {
        let moves = getMoves(p1, p1k, p2, p2k, player);
        if (moves.length == 0)
            return player * -1000;
        let best = player == 1 ? -10000000 : 100000000;
        for (let move of moves) {
            let test = alphabeta(...move, player*-1, alpha, beta, max_depth-1);
            best = player == 1 ? (test > best ? test : best) : (test < best ? test : best);
            if (player == 1)
                // max player
                alpha = alpha < best ? best : alpha;
            else
                beta = beta > best ? best : beta;
            if (alpha >= beta) {
                return player == 1 ? alpha : beta;
            }
        }
        return best;
    }
    return eval_board(p1, p1k, p2, p2k, player);
}

// a bit ugly but it works
export function getAlphaBetaMove(p1, p1k, p2, p2k, player, max_depth) {
    let moves = getMoves(p1, p1k, p2, p2k, player);
    if (moves.length == 0)
        return null;
    console.log(eval_board(p1, p1k, p2, p2k, player));
    let current = moves[0];
    let best = player == 1 ? -1000 : 1000;
    let alpha = -100000000;
    let beta = 1000000000;
    for (let move of moves) {
        let test = alphabeta(...move, player*-1, alpha, beta, max_depth-1);
        current = player == 1 ? (test > best ? move : current) : (test < best ? move : current);
        best = player == 1 ? (test > best ? test : best) : (test < best ? test : best);
        if (player == 1)
            // max player
            alpha = alpha < test ? test : alpha;
        else
            beta = beta > test ? test : beta;
        }
    console.log(`A-B best score is ${best}`);
    console.log(`A-B alpha score is ${alpha}`);
    console.log(`A-B beta score is ${beta}`);
    return current;
}

// heuristic for a-b
function eval_board(p1, p1k, p2, p2k, player) {
    if (player==1)
        if ((p2|p2k)==0)
            return Infinity;
    else
        if ((p1|p1k)==0)
            return -Infinity;
    let p1s = countPeices(p1) + 2.1 * countPeices(p1k);
    let p2s = (countPeices(p2) + 2.1 * countPeices(p2k));
    let king_adv =  ((p2k==0 && p1k!=0) ? 1 : ((p1k==0 && p2k!=0) ? -1 : 0));
    return p1s - p2s + king_adv;
}