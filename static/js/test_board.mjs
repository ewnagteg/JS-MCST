import {Game} from "./game.mjs";


const canvas = document.getElementById('canvas');
const text = document.getElementById('text');
const button = document.getElementById('button');
const pop = document.getElementById('pop');
const aiselection = document.getElementById('aiselection');
const topaiselection = document.getElementById('topaiselection');
let g = new Game(canvas, text, aiselection, topaiselection);

const mouseEvent = (event) => {
    g.mouseClick(event);
};

button.addEventListener('click', (event) => {
    g.reset();
});

pop.addEventListener('click', (event) => {
    g.pop();
});

document.addEventListener("click", mouseEvent);

setInterval(() => {
    g.render(g.state);
}, 1/30*1000);

aiselection.onchange =  () => {
    g.selectAI();
};

topaiselection.onchange = () => {
    g.selectAI();
}