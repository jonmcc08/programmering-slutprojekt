/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas")

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")

function gameLogic() {
    
}

function animate() {

}

// Pathtracar som template för senare backgrundsbild som ska göras.
function mapPath() {
    ctx.beginPath();
    ctx.moveTo(630, 0);
    ctx.lineTo(630, 260);
    ctx.lineTo(100, 260);
    ctx.lineTo(100, 100);
    ctx.lineTo(260, 100);
    ctx.lineTo(260, 450);
    ctx.lineTo(770, 450);
    ctx.lineTo(770, 250);
    ctx.lineTo(918, 250);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;

    ctx.stroke();
    
}

mapPath()
