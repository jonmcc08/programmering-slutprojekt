/** @type {HTMLCanvasElement} */
const bookCanvas = document.getElementById("bookCanvas")
/** @type {CanvasRenderingContext2D} */
const Bctx = bookCanvas.getContext("2d")
Bctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const mapCanvas = document.getElementById("mapCanvas")
/** @type {CanvasRenderingContext2D} */
const Mctx = mapCanvas.getContext("2d")

/** @type {HTMLCanvasElement} */
const towerCanvas = document.getElementById("towerCanvas")
/** @type {CanvasRenderingContext2D} */
const Tctx = towerCanvas.getContext("2d")
Tctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const towerPlaceCanvas = document.getElementById("towerPlaceCanvas")
/** @type {CanvasRenderingContext2D} */
const Tpctx = towerCanvas.getContext("2d")
Tpctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const uiCanvas = document.getElementById("uiCanvas")
/** @type {CanvasRenderingContext2D} */
const uictx = uiCanvas.getContext("2d")
uictx.imageSmoothingEnabled = false 


const windowUi = document.getElementById("gameContainer")

const towers = document.querySelectorAll(".tower")

let aspectRatio = window.innerHeight / 540
let towerCurrentId = 0
let mouseDown = false
let currentMoney = 0
let currentHp = 100
let pause = true
let insideCanvas = false
let placedTowers = []
let towerIdIndex = 1

// SPRITES
const sprites = {
    heart: new Image(),
    book1: new Image(),
    book2: new Image(),
    book3: new Image(),
    tower1: new Image(),
    tower10: new Image()
}

sprites.heart.src = "sprites/heart.png"
sprites.book1.src = "sprites/book1.jpg"
sprites.book2.src = "sprites/book2.jpg"
sprites.book3.src = "sprites/book3.jpg"
sprites.tower1.src = "sprites/tower1.png"
sprites.tower10.src = "sprites/tower10.png" 

for (let sprite in sprites) {
    sprites[sprite].style.imageRendering = "pixelated"
}

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
        currentMoney += currentRound.cashReward
        uiUpdate()

        currentRound.roundEnemies.forEach(wave => roundEnemies += wave.amount)

        currentRound.roundEnemies.forEach((wave, index) => {
            console.log(index)
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
                currentHp -= enemy.health
                this.enemies.splice(i, 1);
                uiUpdate()
            }
        }
    }
}

class Tower {
    constructor(towerType, towerId, ctx, x, y) {
        this.towerType = towerType
        this.towerId = towerId
        this.tier = 0

        const towerImage = sprites[("tower" + towerCurrentId)]
        ctx.drawImage(towerImage, x, y, 30, 30)
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

function uiUpdate() {
    const heartSprite = sprites["heart"]
    console.log("Updating UI")
    uictx.clearRect(0, 0, uiCanvas.width, uiCanvas.height)
    uictx.font = "48px serif"
    uictx.drawImage(heartSprite, 10, 20)
    uictx.fillText(currentHp, 40, 50)
    uictx.fillText(currentMoney, 160, 50)
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

towers.forEach(button => {
    button.addEventListener("mousedown", function(e) {
        mouseDown = true
        towerCurrentId = button.id
    })
})

window.addEventListener("mouseup", function(e) {
    if (insideCanvas && mouseDown) {
        Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
        const tower = new Tower(towerCurrentId, towerIdIndex, Tctx, (e.x / aspectRatio), (e.y / aspectRatio))
    }
    mouseDown = false
    windowUi.style.cursor = "default"
})

window.addEventListener("mousemove", function(e) {
    if(mouseDown) {
        const towerImage = sprites[("tower" + towerCurrentId)]
        windowUi.style.cursor = "drag"
        console.log(aspectRatio * 918)
        if(e.x < aspectRatio * 918) {
            insideCanvas = true
            Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
            Tpctx.drawImage(towerImage, (e.x / aspectRatio), (e.y / aspectRatio), 30, 30)
        } else {
            insideCanvas = false
        }
    }
})

window.addEventListener("keydown", function (e) {
    const key = e.key
    if(key === " ") {
        pause = !pause
        animate()
    }
})

window.addEventListener("resize", function(e) {
    aspectRatio = window.innerHeight / 540
})

let round = new RoundManager()

let spritesLeft = 4

// Loading
for (let sprite in sprites) {
    sprites[sprite].onload = () => {
        console.log("Sprite loaded: " + sprite)
        spritesLeft--
        if (spritesLeft === 0) {
            mapPath()
            uiUpdate()
            round.loadRoundList()
        }
    }
}