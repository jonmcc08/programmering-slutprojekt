/** @type {HTMLCanvasElement} */
const bookCanvas = document.getElementById("bookCanvas")
/** @type {CanvasRenderingContext2D} */
const Bctx = bookCanvas.getContext("2d")

/** @type {HTMLCanvasElement} */
const mapCanvas = document.getElementById("mapCanvas")
/** @type {CanvasRenderingContext2D} */
const Mctx = mapCanvas.getContext("2d")

/** @type {HTMLCanvasElement} */
const towerCanvas = document.getElementById("towerCanvas")
/** @type {CanvasRenderingContext2D} */
const Tctx = towerCanvas.getContext("2d")

// Testar movement
class Book {
    constructor(health, speed, type) {
        this.path = [{x:630, y:0}, {x: 630, y:260}, {x:100, y:260}, {x:100, y:100}, {x:260, y:100}, {x:260, y:450}, {x:770, y:450}, {x:770, y:250}, {x:918, y:250}]
        this.x = this.path[0].x
        this.y = this.path[0].y
        this.speed = speed
        this.pathindex = 0
        this.length = 20
        this.health = health
        this.type = type
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

    draw(ctx) {
        ctx.beginPath()
        ctx.fillRect(this.x, this.y, this.length, this.length)
        ctx.fillStyle = "black"
        ctx.fill()
    }

    erase(ctx) {
        ctx.clearRect(this.x, this.y, this.length, this.length)
    }
}

class RoundManager {
    constructor() {
        this.currentRoundIndex = 0
        this.enemies = []
    }

    async loadRoundList() {
        const retrieveData = await dataRetreiver("../rounds.json")
        this.rounds = retrieveData.rounds
        this.loadRound()
    }

    loadRound() {
        const currentRound = this.rounds[this.currentRoundIndex]
        console.log(currentRound)
        currentRound.roundEnemies.forEach(wave => {
            for(let i = 0; i < wave.amount; i++) {
                const enemy = new Book(wave.health, wave.speed, wave.type)
            }
        })
    }
}

async function dataRetreiver(url) {
    const data = await fetch(url)
    const jsonFile = await data.json()
    return jsonFile
}

function animate() {

    book.erase(Bctx)
    book.movement()
    book.draw(Bctx)

    requestAnimationFrame(animate)
}



// Pathtracar som template för senare backgrundsbild som ska göras.
function mapPath() {
    Mctx.beginPath();
    Mctx.moveTo(630, 0);
    Mctx.lineTo(630, 260);
    Mctx.lineTo(100, 260);
    Mctx.lineTo(100, 100);
    Mctx.lineTo(260, 100);
    Mctx.lineTo(260, 450);
    Mctx.lineTo(770, 450);
    Mctx.lineTo(770, 250);
    Mctx.lineTo(918, 250);
    Mctx.strokeStyle = "black";
    Mctx.lineWidth = 3;

    Mctx.stroke();
}

let round = new RoundManager()

mapPath()
round.loadRoundList()
animate()
// Test