/** @type {HTMLCanvasElement} */
const bookCanvas = document.getElementById("bookCanvas")
/** @type {CanvasRenderingContext2D} */
const Bctx = bookCanvas.getContext("2d")
Bctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const mapCanvas = document.getElementById("mapCanvas")
/** @type {CanvasRenderingContext2D} */
const Mctx = mapCanvas.getContext("2d")
Mctx.imageSmoothingEnabled = false 


/** @type {HTMLCanvasElement} */
const towerCanvas = document.getElementById("towerCanvas")
/** @type {CanvasRenderingContext2D} */
const Tctx = towerCanvas.getContext("2d")
Tctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const towerPlaceCanvas = document.getElementById("towerPlaceCanvas")
/** @type {CanvasRenderingContext2D} */
const Tpctx = towerPlaceCanvas.getContext("2d")
Tpctx.imageSmoothingEnabled = false 

/** @type {HTMLCanvasElement} */
const uiCanvas = document.getElementById("uiCanvas")
/** @type {CanvasRenderingContext2D} */
const uictx = uiCanvas.getContext("2d")
uictx.imageSmoothingEnabled = false 

const windowUi = document.getElementById("gameContainer")
const upgradeTab = document.getElementById("upgradeTab")
const towersList = document.querySelectorAll(".tower")

let aspectRatio = window.innerHeight / 540
let towerCurrentId = 0
let mouseDown = false
let currentMoney = 0
let currentHp = 100
let pause = true
let insideCanvas = false
let placedTowers = []
let towerIdIndex = 1
let towers = null
let currentTowerCost = 0
let lastTime = performance.now()
let fps = 0

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

    movement(deltaTime) {

        const nextPosition = this.path[this.pathindex]

        const disX = nextPosition.x - this.x
        const disY = nextPosition.y - this.y

        const movementLenght = 60 * this.speed * deltaTime

        if (Math.abs(disX) < this.speed && Math.abs(disY) < this.speed) {
            this.pathindex++
        } else {
            if (disX > 0) {
                this.x += movementLenght
            } else if (disX < 0) {
                this.x -= movementLenght
            }
            if (disY > 0) {
                this.y += movementLenght
            } else if (disY < 0) {
                this.y -= movementLenght
            }
        }
    }

    currentPosition() {
        return ([this.x, this.y])
    }

    draw(ctx) {
        const bookSprite = sprites["book" + this.type]
        ctx.drawImage(bookSprite, this.x, this.y)
    }
}

class RoundManager {
    constructor() {
        this.currentRoundIndex = 0
        this.enemies = []
        this.activeRound = false
        this.allEnemiesSpawned = false
        this.enemiesLoadingQueue = []
        this.roundTime = 0
    }

    async loadRoundList() {
        const retrieveData = await dataRetreiver("rounds.json")
        this.rounds = retrieveData.rounds
        this.loadRound()
        animate()
    }

    loadRound() {
        const currentRound = this.rounds[this.currentRoundIndex];
        this.enemies = []; 
        this.roundTime = 0
        this.activeRound = true
        currentMoney += currentRound.cashReward
        uiUpdate()

        currentRound.roundEnemies.forEach((wave, index) => {
            console.log(index)
            const waveDelay = index * 2; 
            console.log(wave)
            for (let i = 0; i < wave.amount; i++) {
                this.enemiesLoadingQueue.push({
                    health: wave.health, 
                    speed: wave.speed, 
                    type: wave.type, 
                    spawnDelay: waveDelay + (i * wave.betweenDuration)
                })
            }
        })
    }

    currentRound(ctx, deltaTime) {

        this.roundTime += deltaTime

        placedTowers.forEach(tower => {
            tower.calcEnemyDistance(this.enemies, deltaTime)
        });
        for(let i = this.enemiesLoadingQueue.length - 1; i >= 0; i--) {
            const enemyDetails = this.enemiesLoadingQueue[i]
            const enemySpawnDelay = enemyDetails.spawnDelay
            if(enemySpawnDelay <= this.roundTime) {
                const enemy = new Book(enemyDetails.health, enemyDetails.speed, enemyDetails.type)
                this.enemiesLoadingQueue.splice(i, 1)
                this.enemies.push(enemy)
            }
        }
        if(this.enemiesLoadingQueue.length === 0) {
            this.allEnemiesSpawned = true
        }
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.movement(deltaTime);
            enemy.draw(ctx);
            if (enemy.pathindex >= enemy.path.length) {
                currentHp -= enemy.health
                this.enemies.splice(i, 1);
                uiUpdate()
            }
        }
        for (let i = 0; i < placedTowers.length; i++) {
            const tower = placedTowers[i]
            tower.draw(Tctx)
        }

        if(this.activeRound && this.allEnemiesSpawned && this.enemies.length == 0) {
            this.currentRoundIndex++
            this.allEnemiesSpawned = false
            this.activeRound = false
            setTimeout(() => this.loadRound(), 5000)
            return
        }
    }
}

class Tower {
    constructor(towerType, towerId, x, y) {
        this.towerType = towerType

        const configIndex = towerId - 1
        
        this.towerName = towers[configIndex].name
        this.range = towers[configIndex].range
        this.attackSpeed = towers[configIndex].attackSpeed
        this.attackTime = 0
        this.rotation = 0
        this.towerId = towerId
        this.image = sprites[("tower" + towerType)]
        this.tier = 0
        this.shots = 0
        this.x = x
        this.y = y
    }

    draw(ctx) {
        console.log(this.rotation)
        ctx.save()
        ctx.rotate(this.rotation)
        ctx.drawImage(this.image, this.x, this.y, 32, 32, )
        ctx.restore()
    }

    calcEnemyDistance(enemies, deltaTime) {
        this.attackTime -= deltaTime
        enemies.forEach(enemy => {
            const currentEnemyPosition = enemy.currentPosition()
            const deltaX = currentEnemyPosition[0] - this.x + 16
            const deltaY = currentEnemyPosition[1] - this.y + 16

            const distance = (deltaX ** 2 + deltaY ** 2)**0.5   

            if (distance <= this.range) {
                if(this.attackTime <= 0) {
                    this.rotation = Math.atan2(deltaY, deltaX)
                    console.log("Shot fired") // Test för att calculera senare projektilerna
                    this.attackTime = this.attackSpeed
                    return
                }
            }
        });
    }

    upgrade() {
        console.log("Upgrade tab open: " + this.towerName)
        upgradeTab.querySelector(".image").innerHTML = `
        <img src="sprites/tower${this.towerType}.png" style="transform: rotate(180deg)">
        `
        upgradeTab.querySelector(".upgrade").innerHTML = `
        <h3>${this.towerName}</h3>
        <button>PLACEHOLDER UPGRADE \n$200</button>
        `
        upgradeTab.classList.add("showUpgrade")
    }
}

async function dataRetreiver(url) {
    const data = await fetch(url)
    const jsonFile = await data.json()
    return jsonFile
}

async function loadTowers() {
    const retrieveData = await dataRetreiver("towers.json")
    towers = retrieveData.towers
}

function animate(currentTime = performance.now()) {
    let deltaTime = (currentTime - lastTime) / 1000 // Tiden det tar för saken att "repeata" i sekunder

    lastTime = currentTime

    if (deltaTime > 0.1) {
        deltaTime = 0.1;
    }

    fps = Math.round(1 / deltaTime)
    Bctx.clearRect(0, 0, bookCanvas.width, bookCanvas.height)
    round.currentRound(Bctx, deltaTime)
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
function mapPath(ctx, colour, width) {
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
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;

    ctx.stroke();
}

function onMap(x, y) {
    console.log(`(${x}, ${y})`)
    return ((x > 590 && x < 640 && y > 0 && y < 270) || (x > 60 && x < 640 && y > 220 && y < 270) || (x > 60 && x < 110 && y > 60 && y < 270) || (x > 60 && x < 270 && y > 60 && y < 110) || (x > 210 && x < 270 && y > 60 && y < 460) || (x > 210 && x < 780 && y > 410 && y < 460) || (x > 730 && x < 780 && y > 210 && y < 460) || (x > 730 && x < 918 && y > 210 && y < 260) || (x < 0) || (x > 888) || (y < 0) || (y > 510))
}

function fpsLogger() {
    setTimeout(() => {
        console.log("Current fps: " + fps)
        fpsLogger()
    }, 3000)
}

towersList.forEach(button => {
    button.addEventListener("mousedown", function(e) {
        mouseDown = true
        towerCurrentId = button.id
        currentTowerCost = towers[(towerCurrentId - 1)].cost
        console.log(currentTowerCost)
    })
})

window.addEventListener("mousedown", function (e) {
    const mouseX = e.x / aspectRatio
    const mouseY = e.y / aspectRatio
    let clickedTower = null

    placedTowers.forEach(tower => {
        const x = tower.x
        const y = tower.y
        if(x <= mouseX && mouseX <= x + 32 && y <= mouseY && mouseY <= y + 32) {
            clickedTower = tower
        }
    })
    if(clickedTower) {
        clickedTower.upgrade()
    } else {
        if(!upgradeTab.contains(e.target)) {
            upgradeTab.classList.remove("showUpgrade")
        }
    }
})

window.addEventListener("mouseup", function(e) {
    Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
    if (insideCanvas && mouseDown && (currentTowerCost <= currentMoney) && !onMap((e.x / aspectRatio), (e.y / aspectRatio))) {
        currentMoney -= currentTowerCost
        uiUpdate()
        const tower = new Tower(towerCurrentId, towerIdIndex, (e.x / aspectRatio), (e.y / aspectRatio))
        towerIdIndex++
        placedTowers.push(tower)
    }
    mouseDown = false
    windowUi.style.cursor = "default"
})

window.addEventListener("mousemove", function(e) {
    const x = e.x / aspectRatio
    const y = e.y / aspectRatio
    if(mouseDown) {
        const towerImage = sprites[("tower" + towerCurrentId)]
        windowUi.style.cursor = "drag"
        if(e.x < aspectRatio * 918) {
            insideCanvas = true
            Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
            Tpctx.beginPath()
            Tpctx.arc((x + 16), (y + 16), towers[towerCurrentId - 1].range, 0, 2 * Math.PI)
            Tpctx.strokeStyle = "rgba(38, 255, 0, 0.55)"
            Tpctx.fillStyle = "rgba(38, 255, 0, 0.55)"
            Tpctx.fill()
            Tpctx.stroke()
            Tpctx.drawImage(towerImage, x, y, 32, 32)
            if((currentTowerCost >= currentMoney) || onMap(x, y)) {
                Tpctx.fillStyle = "rgba(255, 0, 0, 0.4)"
                Tpctx.fillRect(x, y, 32, 32)
            }
            mapPath(Tpctx, "rgba(255, 0, 0, 0.4)", 20)
            console.log(onMap(x, y))
        } else {
            Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
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
loadTowers()

let spritesLeft = 4

// Loading
for (let sprite in sprites) {
    sprites[sprite].onload = () => {
        console.log("Sprite loaded: " + sprite)
        spritesLeft--
        if (spritesLeft === 0) {
            mapPath(Mctx, "black", 3)
            uiUpdate()
            round.loadRoundList()
            fpsLogger()
        }
    }
}