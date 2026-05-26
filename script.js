/* 
=====================================================
=                VIKTIG INFORMATION!                =
=                                                   =
=                                                   =
=     Eftersom att spelet använder sig av JSON-     =
=      filer så kan man inte använda RAW-HTML       =
=      för att loada in, därför har jag skapat      =
=         en hemsida som har spelet på sig.         =
=                                                   =
=        Länk: https://tower-defense.page.gd/       =
=                                                   =
=         (Tar lite längre tid att uppdatera)       =
=                                                   =
=====================================================
*/



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
const projectileCanvas = document.getElementById("projectileCanvas")
/** @type {CanvasRenderingContext2D} */
const Pctx = projectileCanvas.getContext("2d")
Pctx.imageSmoothingEnabled = false 

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
let pause = false
let insideCanvas = false
let towerIdIndex = 1
let towers = null
let currentTowerCost = 0
let lastTime = performance.now()
let fps = 0
const placedTowers = []
const projectiles = []

// SPRITES
const sprites = {
    heart: new Image(),
    book1: new Image(),
    book2: new Image(),
    book3: new Image(),
    book4: new Image(),
    book5: new Image(),
    book6: new Image(),
    book7: new Image(),
    book8: new Image(),
    book9: new Image(),
    book10: new Image(),
    tower1: new Image(),
    tower2: new Image(),
    tower3: new Image(),
    tower4: new Image(),
    tower5: new Image(),
    tower6: new Image(),
    tower10: new Image(),
    projectile1: new Image()
}

sprites.heart.src = "sprites/heart.png"
sprites.book1.src = "sprites/book1.jpg"
sprites.book2.src = "sprites/book2.jpg"
sprites.book3.src = "sprites/book3.jpg"
sprites.book4.src = "sprites/book4.jpg"
sprites.book5.src = "sprites/book5.jpg"
sprites.book6.src = "sprites/book6.jpg"
sprites.book7.src = "sprites/book7.jpg"
sprites.book8.src = "sprites/book8.jpg"
sprites.book9.src = "sprites/book9.jpg"
sprites.book10.src = "sprites/book10.jpg"
sprites.tower1.src = "sprites/tower1.png"
sprites.tower2.src = "sprites/tower2.png"
sprites.tower3.src = "sprites/tower3.png"
sprites.tower4.src = "sprites/tower4.png"
sprites.tower5.src = "sprites/tower5.png"
sprites.tower6.src = "sprites/tower6.png"
sprites.tower10.src = "sprites/tower10.png"
sprites.projectile1.src = "sprites/projectile1.jpg"

class Book {
    constructor(type, enemyDetails) {
        this.path = [{x:620.5, y:0}, {x: 620.5, y:230}, {x:90, y:230}, {x:90, y:70}, {x:250, y:70}, {x:250, y:420}, {x:760, y:420}, {x:760, y:220}, {x:918, y:220}]
        this.x = this.path[0].x
        this.y = this.path[0].y
        this.propertyIndex = type - 1
        this.enemyDetails = enemyDetails
        this.speed = this.enemyDetails[this.propertyIndex].speed
        this.pathindex = 0
        this.length = 20
        this.health = this.enemyDetails[this.propertyIndex].health
        this.frozen = false
        this.frozenTime = 0
        this.glued = false
        this.gluedTime = 0
        this.gluedEffect = 0
        this.type = type
    }

    movement(deltaTime) {

        if(this.frozen) {
            if (this.frozenTime >= 0) {
                this.frozenTime -= deltaTime
                return
            } else {
                this.frozen = false
            }
        } else if(this.glued) {
            if (this.gluedTime >= 0) {
                this.gluedTime -= deltaTime
                this.speed -= this.gluedEffect
            } else {
                this.glued = false
                this.gluedEffect = 0
            }
        }

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
        this.speed += this.gluedEffect
    }

    currentPosition() {
        return ([this.x + 10, this.y + 18])
    }

    damage(attackDamage, tower) {
        const projectile = new Projectile(tower, this, attackDamage)
        projectiles.push(projectile)
    }

    hit(damage) {
        this.health -= damage
        if(this.health <= 0) {
            const damageOver = Math.abs(this.health)
            this.type -= 1
            this.propertyIndex -= 1
            currentMoney += 10
            uiUpdate()
            if (this.type <= 0) {
                return true
            }
            this.speed = this.enemyDetails[this.propertyIndex].speed
            this.health = this.enemyDetails[this.propertyIndex].health
            if (damageOver > 0) {
                return this.hit(damageOver)
            }
        }
    }

    draw(ctx) {
        if(this.type <= 0) {
            return
        }
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
        this.properties = retrieveData.enemyProperty
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
        if(!pause) {
            
            this.roundTime += deltaTime
            placedTowers.forEach(tower => {
            tower.calcEnemyDistance(this.enemies, deltaTime)
            })

            for(let i = this.enemiesLoadingQueue.length - 1; i >= 0; i--) {
                const enemyDetails = this.enemiesLoadingQueue[i]
                const enemySpawnDelay = enemyDetails.spawnDelay
                if(enemySpawnDelay <= this.roundTime) {
                    const enemy = new Book(enemyDetails.type, this.properties)
                    this.enemiesLoadingQueue.splice(i, 1)
                    this.enemies.push(enemy)
                }
            }
            if(this.enemiesLoadingQueue.length === 0) {
                this.allEnemiesSpawned = true
            }
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const projectile = projectiles[i]
                projectile.movement(deltaTime)

                if (projectile.deletion) {
                    for (let j = this.enemies.length - 1; j >= 0; j--) {
                        const enemy = this.enemies[j]
                        const distance = ((enemy.x + 10 - projectile.x) ** 2 + (enemy.y + 18 - projectile.y) ** 2) ** 0.5

                        if (distance < 16) {
                            const enemyDead = enemy.hit(projectile.attackDamage)
                            if (projectile.frozenTime > 0) {
                                enemy.frozen = true
                                enemy.frozenTime = projectile.frozenTime
                            } else if (projectile.gluedTime > 0) {
                                enemy.glued = true
                                enemy.gluedTime = projectile.gluedTime
                                enemy.gluedEffect = projectile.gluedEffect
                            }
                            if (enemyDead) {
                                this.enemies.splice(j, 1)
                            }
                            break
                        }
                    }
                    projectiles.splice(i, 1)
                }
            }
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.movement(deltaTime);
                if (enemy.pathindex >= enemy.path.length) {
                    currentHp -= enemy.type
                    this.enemies.splice(i, 1);
                    uiUpdate()
                }
            }
        }

        this.enemies.forEach(enemy => {
            enemy.draw(ctx);
        })
        placedTowers.forEach(tower => {
            tower.draw(Tctx)
        })

        projectiles.forEach(projectile => {
            projectile.draw(Pctx)
        })

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

        this.configIndex = towerType - 1
        
        this.towerName = towers[this.configIndex].name
        this.range = towers[this.configIndex].range
        this.attackSpeed = towers[this.configIndex].attackSpeed
        this.attackDamage = towers[this.configIndex].attackDamage
        this.attackTime = 0
        this.rotation = 0
        this.towerId = towerId
        this.towerSlc = false
        this.image = sprites[("tower" + towerType)]
        this.tier = 0
        this.shots = 0
        this.x = x
        this.y = y

        this.frozenTime = 0
        this.gluedTime = 0
        this.gluedEffect = 0

        if (this.configIndex === 3) {
            this.frozenTime = towers[3].frozenTime
        } else if (this.configIndex === 5) {
            this.gluedTime = towers[5].gluedTime
            this.gluedEffect = towers[5].gluedEffect
        }
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.x + 16, this.y + 16)
        ctx.rotate(this.rotation)
        ctx.drawImage(this.image, -16, -16, 32, 32)
        ctx.restore()
        if (this.towerSlc) {
            ctx.beginPath()
            ctx.arc((this.x + 16), (this.y + 16), this.range, 0, 2 * Math.PI)
            ctx.strokeStyle = "rgba(38, 255, 0, 0.55)"
            ctx.fillStyle = "rgba(38, 255, 0, 0.55)"
            ctx.fill()
            ctx.stroke()
        }
    }

    calcEnemyDistance(enemies, deltaTime) {
        this.attackTime -= deltaTime

        let furthestEnemy = 0
        let furthestEnemyIndex = -1

        for (let i = 0; i < enemies.length; i++) {
            const enemy = enemies[i]
            const currentEnemyPosition = enemy.currentPosition()
            const deltaX = currentEnemyPosition[0] - (this.x + 16)
            const deltaY = currentEnemyPosition[1] - (this.y + 16)

            const distance = (deltaX ** 2 + deltaY ** 2)**0.5   

            if (distance <= this.range) {
                const nextPoint = enemy.path[enemy.pathindex]

                const furthestDistance = (enemy.pathindex * 1000) - (nextPoint.x**2 + nextPoint.y**2)**0.5

                if (furthestEnemy < furthestDistance) {
                    furthestEnemy = furthestDistance
                    furthestEnemyIndex = i
                }
            }
        }
        if (furthestEnemyIndex !== -1 && this.attackTime <= 0) {
            const enemy = enemies[furthestEnemyIndex]

            const currentEnemyPosition = enemy.currentPosition()
            const deltaX = currentEnemyPosition[0] - (this.x + 16)
            const deltaY = currentEnemyPosition[1] - (this.y + 16)
  
            this.rotation = Math.atan2(deltaY, deltaX) + (Math.PI / 2)
            enemy.damage(this.attackDamage, this)
            this.shots++
            this.attackTime = this.attackSpeed 
        }
    }

    upgradeTower(currentUpgrade) {
        if (currentMoney >= currentUpgrade.cost) {
            currentMoney -= currentUpgrade.cost
            uiUpdate()
            currentUpgrade.upgrades.forEach(statObj => {
                const statKey = Object.keys(statObj)[0]
                this[statKey] = statObj[statKey]
                console.log(this[statKey])
            })
            this.tier++

            this.upgrade()
        } else {
            return false
        }
    }

    async upgrade() {
        console.log("Upgrade tab open: " + this.towerName)
        const upgradeData = await dataRetreiver("upgrades.json")
        const upgradePath = upgradeData.upgrades[this.configIndex].upgradePath
        const currentUpgrade = upgradePath[this.tier]
        upgradeTab.querySelector(".image").innerHTML = `
        <img src="sprites/tower${this.towerType}.png" style="transform: rotate(180deg)">
        `
        if(this.tier === 4) {
            upgradeTab.querySelector(".upgrade").innerHTML = `
            <h3>${this.towerName}</h3>
            <button id="upgradeBtn" disabled>Maxed</button>
            `
        } else {
            upgradeTab.querySelector(".upgrade").innerHTML = `
            <h3>${this.towerName}</h3>
            <button id="upgradeBtn">${currentUpgrade.name} | ${currentUpgrade.cost}</button>
            `
        }

        upgradeTab.classList.add("showUpgrade")

        const upgradeBtn = document.getElementById("upgradeBtn")

        upgradeBtn.onclick = () => {
            const upgraded = this.upgradeTower(currentUpgrade)
            if (!upgraded) {
                upgradeTab.querySelector(".upgrade").innerHTML = `
                <h3>${this.towerName}</h3>
                <button id="upgradeBtn">Not enough money</button>
                `
                setTimeout(() => {
                    this.upgrade()
                }, 1000)
            }
        }

        this.towerSlc = true
    }

    deselect() {
        this.towerSlc = false
    }
}

class Projectile {
    constructor(tower, enemy, attackDamage) {
        this.x = tower.x
        this.y = tower.y
        this.attackDamage = attackDamage
        this.target = enemy
        this.deletion = false
        this.frozenTime = tower.frozenTime
        this.gluedTime = tower.gluedTime
        this.gluedEffect = tower.gluedEffect
    }

    homing() {
        this.eX = this.target.x + 10
        this.eY = this.target.y + 18
        const deltaX = this.eX - this.x
        const deltaY = this.eY - this.y

        this.rotation = Math.atan2(deltaY, deltaX) + (Math.PI / 2)

        const distance = Math.max(1, (deltaX ** 2 + deltaY ** 2) ** 0.5)

        this.speedX = (deltaX / distance) * 800
        this.speedY = (deltaY / distance) * 800

    }

    movement(deltaTime) {
        if (this.target) { 
            this.homing()
        }

        const moveX = this.speedX * deltaTime
        const moveY = this.speedY * deltaTime
        const moveDistance = (moveX ** 2 + moveY ** 2) ** 0.5

        const remainingX = this.eX - this.x
        const remainingY = this.eY - this.y
        const distanceRemaining = (remainingX ** 2 + remainingY ** 2) ** 0.5

        if (distanceRemaining <= moveDistance) {
            this.x = this.eX
            this.y = this.eY
            this.deletion = true
        } else {
            this.x += moveX
            this.y += moveY
        }
    }

    draw(ctx) {
        ctx.save()
        ctx.translate(this.x + 3, this.y + 3)
        ctx.rotate(this.rotation)
        ctx.drawImage(sprites.projectile1, -3, -3, 2, 6)
        ctx.restore()
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
        deltaTime = 0.1; // Om man tabbar ut blir tiden för lång, vilket kommer glitcha hela spelet
    }

    fps = Math.round(1 / deltaTime)

    Bctx.clearRect(0, 0, bookCanvas.width, bookCanvas.height)
    Tctx.clearRect(0, 0, towerCanvas.width, towerCanvas.height)
    Pctx.clearRect(0, 0, projectileCanvas.width, projectileCanvas.height)
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
    uictx.fillText("$" + currentMoney, 160, 50)
    uictx.font = "30px serif"
    uictx.fillText("Round " + (round.currentRoundIndex + 1) + "/30", 750, 30)
    console.log("Updated UI")
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
    return (
        (x > 590 && x < 640 && y > 0 && y < 270) || 
        (x > 60 && x < 640 && y > 220 && y < 270) || 
        (x > 60 && x < 110 && y > 60 && y < 270) || 
        (x > 60 && x < 270 && y > 60 && y < 110) || 
        (x > 220 && x < 270 && y > 60 && y < 460) || 
        (x > 210 && x < 780 && y > 410 && y < 460) || 
        (x > 730 && x < 780 && y > 210 && y < 460) || 
        (x > 730 && x < 918 && y > 210 && y < 260) || 
        (x < 0) || (x > 888) || (y < 0) || (y > 510)
)
}

function onTower(x, y) {
    condition = false
    placedTowers.forEach(tower => {
        towerX = tower.x
        towerY = tower.y

        if (x >= (towerX - 40) && x <= (towerX + 40) && y >= (towerY - 40) && y <= (towerY + 40)) {
            condition = true
        }
    })
    return condition
}

function towerPlacement (ctx,) {

    placedTowers.forEach(tower => {
        towerX = tower.x
        towerY = tower.y

        ctx.beginPath()
        ctx.arc((towerX + 16), (towerY + 16), 20, 0, 2 * Math.PI)
        ctx.fillStyle = "rgba(255, 0, 0, 0.4)"
        ctx.fill()
    })
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
        placedTowers.forEach(tower => {
            tower.deselect()
        })
        clickedTower.upgrade()
    } else {
        if(!upgradeTab.contains(e.target)) {
            upgradeTab.classList.remove("showUpgrade")
            placedTowers.forEach(tower => {
                tower.deselect()
            })
        }
    }
})

window.addEventListener("mouseup", function(e) {
    Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
    if (insideCanvas && mouseDown && (currentTowerCost <= currentMoney) && !onMap((e.x / aspectRatio), (e.y / aspectRatio)) && !onTower((e.x / aspectRatio), (e.y / aspectRatio))) {
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
            if((currentTowerCost >= currentMoney) || onMap(x, y) || onTower(x, y)) {
                Tpctx.fillStyle = "rgba(255, 0, 0, 0.4)"
                Tpctx.fillRect(x, y, 32, 32)
            }
            mapPath(Tpctx, "rgba(255, 0, 0, 0.4)", 20)
            towerPlacement(Tpctx, x, y)
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
    }

    // DEV TOOL

    if(key === "'") {
        currentMoney += 10000
        uiUpdate()
    }
})

window.addEventListener("resize", function(e) {
    aspectRatio = window.innerHeight / 540
})

let round = new RoundManager()
loadTowers()

let spritesLeft = Object.keys(sprites).length
console.log(spritesLeft)

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