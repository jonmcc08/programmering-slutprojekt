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

// SPRITES
const sprites = {
    book1: new Image(),
    book2: new Image(),
    book3: new Image()
}

sprites.book1.src = "sprites/book1.jpg"
sprites.book2.src = "sprites/book2.jpg"
sprites.book3.src = "sprites/book3.jpg"


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
        const bookSprite = sprites["book" + this.type]
        ctx.beginPath()
        ctx.drawImage(bookSprite, this.x, this.y)
        ctx.fill()
    }
}

class RoundManager {
    constructor() {
        this.currentRoundIndex = 0
        this.enemies = []
        this.activeRound = false
        this.allEnemiesSpawned = false
    }

    async loadRoundList() {
        const retrieveData = await dataRetreiver("../rounds.json")
        this.rounds = retrieveData.rounds
        this.loadRound()
        animate()
    }

    loadRound() {
        const currentRound = this.rounds[this.currentRoundIndex];
        this.enemies = []; 
        let roundEnemies = 0
        let amountEnemies = 0
        this.activeRound = true

        currentRound.roundEnemies.forEach(wave => roundEnemies += wave.amount)

        currentRound.roundEnemies.forEach((wave, index) => {
            const waveDelay = index * 2000; 
            console.log(wave)
            for (let i = 0; i < wave.amount; i++) {
                setTimeout(() => {
                    const enemy = new Book(wave.health, wave.speed, wave.type)
                    this.enemies.push(enemy)
                    amountEnemies++
                    console.log(enemy)
                    if(amountEnemies == roundEnemies) {
                        this.allEnemiesSpawned = true
                    }
                }, waveDelay + (i * wave.betweenDuration * 1000))
            }
        })
    }

    currentRound(ctx) {
        if(this.activeRound && this.allEnemiesSpawned && this.enemies.length == 0) {
            this.currentRoundIndex++
            this.allEnemiesSpawned = false
            this.activeRound = false
            setTimeout(() => this.loadRound(), 5000)
            return
        }
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.movement();
            enemy.draw(ctx);
            if (enemy.pathindex >= enemy.path.length) {
                this.enemies.splice(i, 1);
            }
        }
    }
}

async function dataRetreiver(url) {
    const data = await fetch(url)
    const jsonFile = await data.json()
    return jsonFile
}

function animate() {
    Bctx.clearRect(0, 0, bookCanvas.width, bookCanvas.height)
    round.currentRound(Bctx)
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
// Test