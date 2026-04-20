/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("gameCanvas")

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d")

// Testar movement
class Book {
    constructor() {
        this.path = [{x:630, y:0}, {x: 630, y:260}, {x:100, y:260}, {x:100, y:100}, {x:260, y:100}, {x:260, y:450}, {x:770, y:450}, {x:770, y:250}, {x:918, y:250}]
        this.x = this.path[0].x
        this.y = this.path[0].y
        this.speed = 5
        this.pathindex = 0
    }

    movement() {

        const nextPosition = this.path[this.pathindex]

        const disX = nextPosition.x - this.x
        const disY = nextPosition.y - this.y
        
        console.log(disX)
        console.log(disY)
        console.log(this.path[this.pathindex])

        if (Math.abs(disX) < this.speed && Math.abs(disY) < this.speed) {
            this.pathindex++
        } else {
            if (disX > 0) {
                this.x += this.speed
            } else if (disX < 0) {
                this.x -= this.speed
            }
            if (disY > 0) {
                this.y += this.speed;
            } else if (disY < 0) {
                this.y -= this.speed
            }
    }
    }
}

let book = new Book()
// Test
for(let i = 0; i < 1000; i++) {
    book.movement()
    console.log(`{${book.x}: ${book.y}} Index: ${book.pathindex}`)
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


