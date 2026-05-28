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

// Skapar alla canvases nedanför

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
const sideTab = document.getElementById("sideTab")
const upgradeTab = document.getElementById("upgradeTab")
const towersList = document.querySelectorAll(".tower")
const pauseBtn = document.getElementById("pauseBtn")
const changeLog = document.getElementById("changeLogBtn")

let aspectRatio = 0
let widthX = 0
let widthY = 0
let towerCurrentId = 0
let mouseDown = false
let currentMoney = 0
let currentHp = 100
let pause = true
let insideCanvas = false
let towerIdIndex = 1
let towers = null
let currentTowerCost = 0
let lastTime = performance.now()
let fps = 0
let gameActive = true
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
    book11: new Image(),
    tower1: new Image(),
    tower2: new Image(),
    tower3: new Image(),
    tower4: new Image(),
    tower5: new Image(),
    tower6: new Image(),
    tower7: new Image(),
    tower8: new Image(),
    projectile1: new Image(),
    projectile2: new Image(),
    projectile3: new Image(),
    projectile4: new Image(),
    projectile5: new Image(),
    glue: new Image(),
    poison: new Image()
}

// Hämtar sprite sources
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
sprites.book11.src = "sprites/book11.png"
sprites.tower1.src = "sprites/tower1.png"
sprites.tower2.src = "sprites/tower2.png"
sprites.tower3.src = "sprites/tower3.png"
sprites.tower4.src = "sprites/tower4.png"
sprites.tower5.src = "sprites/tower5.png"
sprites.tower6.src = "sprites/tower6.png"
sprites.tower7.src = "sprites/tower7.png"
sprites.tower8.src = "sprites/tower8.png"
sprites.projectile1.src = "sprites/projectile1.jpg"
sprites.projectile2.src = "sprites/projectile2.jpg"
sprites.projectile3.src = "sprites/projectile3.jpg"
sprites.projectile4.src = "sprites/projectile4.jpg"
sprites.projectile5.src = "sprites/projectile5.png"
sprites.glue.src = "sprites/glue.png"
sprites.poison.src = "sprites/poison.png"

class Book {
    constructor(type, enemyDetails, position) {
        this.path = [{x:620.5, y:0}, {x: 620.5, y:230}, {x:90, y:230}, {x:90, y:70}, {x:250, y:70}, {x:250, y:420}, {x:760, y:420}, {x:760, y:220}, {x:918, y:220}] // Pathen som boken följer
        this.x = this.path[0].x
        this.y = this.path[0].y
        this.propertyIndex = type - 1
        this.enemyDetails = enemyDetails
        this.speed = this.enemyDetails[this.propertyIndex].speed
        this.originalSpeed = this.speed
        this.pathindex = 0
        this.length = 20
        this.health = this.enemyDetails[this.propertyIndex].health
        this.frozen = false
        this.frozenTime = 0
        this.glued = false
        this.gluedTime = 0
        this.gluedEffect = 0
        this.poison = false
        this.poisonTime = 0
        this.poisonDamage = 0
        this.poisonDelay = 1
        this.type = type

        // De mesta av variablarna förklarar sig själva i namnet.

        if(position !== undefined) { // Detta används av bossen och spawnar flera vid positionen som bossen "dog" på
            this.x = position.x
            this.y = position.y
            this.pathindex = position.pathindex
        }
    }

    movement(deltaTime) {

        if(this.frozen) { // Kollar om boken är fryst, då använder den tiden och är stilla
            if(this.type == 11) { // Gör så att bossen inte kan bli fryst
                this.frozen = false
            }
            if (this.frozenTime >= 0) {
                this.frozenTime -= deltaTime
                return // Är stilla på grund av att det returneras och det senare körs ej.
            } else {
                this.frozen = false
            }
        } else if(this.glued) { // Samma sak som fryst men för lim.
            if (this.gluedTime >= 0) {
                this.gluedTime -= deltaTime
                this.speed = this.originalSpeed / this.gluedEffect
            } else {
                this.glued = false
                this.speed = this.originalSpeed
                this.gluedEffect = 0
            }
        } 
        if(this.poison) { // Samma sak som de andra men finns en till delay för att få boken att ta mer skada
            
            this.poisonTime -= deltaTime
            this.poisonDelay -= deltaTime
            if (this.poisonDelay <= 0) {
                this.hit(this.poisonDamage) // Tar damagen som poisonen har
                this.poisonDelay += 1
            }
            if(this.poisionTime <= 0) {
                this.poison = false
            }
        }

        const nextPosition = this.path[this.pathindex] // Kollar vart boken ska

        const disX = nextPosition.x - this.x // Distansen mellan
        const disY = nextPosition.y - this.y // Distansen mellan

        const distance = (disX ** 2 + disY ** 2) ** 0.5 // Kollar distansen till nästa punkt

        const movementLenght = 60 * this.speed * deltaTime // Använder delta tid för att få hastigheten som ska köras i för att det ska fungera för alla HZ, om det är 60 så är delta tiden 1/60, alltså per frame som sedan tas ut av requestFrameAnimation som går på HZ;en.

        if (distance < 60 * this.speed * deltaTime) {
            this.x = this.path[this.pathindex].x
            this.y = this.path[this.pathindex].y
            this.pathindex++ // Om distansen är mindre än vad längden rör sig så sätts den på nästa path index och lockar sig på nästa x och y värde
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
            // Rör sig i det hållet beroende på distansen av y och x.
        }
    }

    currentPosition() {
        return ([this.x + 10, this.y + 18])
    }

    damage(attackDamage, tower) {
        const projectile = new Projectile(tower, this, attackDamage) // Skapar en projectil.
        projectiles.push(projectile)
    }

    hit(damage) {
        this.health -= damage 
        if(this.health <= 0) {
            const damageOver = Math.abs(this.health)
            if(this.type === 11) {
                round.bossDefeated(this)
            }
            this.type -= 1
            this.propertyIndex -= 1
            currentMoney += 10
            uiUpdate()
            if (this.type <= 0) {
                return true // Returnerar true för att ta bort boken.
            }
            this.speed = this.enemyDetails[this.propertyIndex].speed
            this.health = this.enemyDetails[this.propertyIndex].health
            if (damageOver > 0) {
                return this.hit(damageOver) // Om det finns negativt med HP tas det över till nästa typ, och gör den mängd damage över
            }
        }
    }

    draw(ctx) {

        if(this.type <= 0) {
            return // Om typen är 0 ritas den ej
        }
        if (this.type < 11) { // Använder sig av detta om det inte är bossen
            const bookSprite = sprites["book" + this.type]
            ctx.drawImage(bookSprite, this.x, this.y)
        } else {
            const bookSprite = sprites["book11"] 
            let xCut = 0
        
            if (this.health > 70000) { // xCuten är längden från x = 0 för att sedan rita utifrån sprite-sheeten
                xCut = 0
            } else if (this.health > 40000) {
                xCut = 60
            } else if (this.health > 20000) {
                xCut = 60 * 2
            } else {
                xCut = 60 * 3
            }

            ctx.drawImage(bookSprite, xCut, 0, 40, 72, (this.x - 8), (this.y - 20), 40, 72)
        }
        if(this.frozen) { // Om fryst ritar den en effekt och alla andra
            ctx.fillStyle = "rgba(0, 132, 255, 0.33)"
            ctx.fillRect(this.x, this.y, 20, 36)
        } else if(this.glued) {
            ctx.drawImage(sprites.glue, this.x, this.y)
        }
        if(this.poison) {
            ctx.drawImage(sprites.poison, this.x, this.y)
        }
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
        const retrieveData = await dataRetreiver("rounds.json") // Hämtar information från json-filen.
        this.rounds = retrieveData.rounds
        this.properties = retrieveData.enemyProperty
        this.loadRound()
        animate() // Startar gameloopen
    }

    loadRound() {

        if(this.currentRoundIndex == 30) { // Om man rundan är 31 (index är ett steg under) så klarar man spelet och så throwas ett Error för att stoppa loopen.
            uiUpdate(true)
            gameActive = false
            throw new Error("You have won!")
        }

        const currentRound = this.rounds[this.currentRoundIndex];
        this.enemies = []; 
        this.roundTime = 0
        this.activeRound = true
        currentMoney += currentRound.cashReward // Hämtar pengarna från json-filen
        uiUpdate()

        currentRound.roundEnemies.forEach((wave, index) => {
            const waveDelay = index * 2; 
            for (let i = 0; i < wave.amount; i++) {
                this.enemiesLoadingQueue.push({
                    health: wave.health, 
                    speed: wave.speed, 
                    type: wave.type, 
                    spawnDelay: waveDelay + (i * wave.betweenDuration)
                }) // Skapar en lista med bokens egenskaper
            }
        })
    }

    currentRound(deltaTime) {

        if(!pause) { // Om spelet inte är pausad körs rundan.
            
            this.roundTime += deltaTime
            placedTowers.forEach(tower => {
                tower.calcEnemyDistance(this.enemies, deltaTime) // Kalkulerar distansen för varje torn
            }) 

            for(let i = this.enemiesLoadingQueue.length - 1; i >= 0; i--) {
                const enemyDetails = this.enemiesLoadingQueue[i]
                const enemySpawnDelay = enemyDetails.spawnDelay
                if(enemySpawnDelay <= this.roundTime) { // Om tiden av rundan överstiger vad bokens spawn är spawnar den och tar bort från queuen
                    const enemy = new Book(enemyDetails.type, this.properties)
                    this.enemiesLoadingQueue.splice(i, 1)
                    this.enemies.push(enemy) 
                }
            }
            if(this.enemiesLoadingQueue.length === 0) { // Om alla har spawnat sätts en variabel som true för att hjälpa att ta reda på om rundan är slut
                this.allEnemiesSpawned = true
            }
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                enemy.movement(deltaTime); // Flyttar varje bok.

                if(enemy.type <= 0) {
                    this.enemies.splice(i, 1) // Om typen är 0 tas den bort
                    continue
                }
                if (enemy.pathindex >= enemy.path.length) { // Om den åker utanför tas HP bort
                    if(enemy.type !== 11) { // Om det inte är bossen tar den bort HP från typen, annars vid bossen tar det bort allt.
                        currentHp -= enemy.type // Tar bort mängden HP beroende på boken
                    } else {
                        currentHp = 0
                    }
                    this.enemies.splice(i, 1);
                    uiUpdate()
                }
            }
        }

        if(this.activeRound && this.allEnemiesSpawned && this.enemies.length == 0) { // Om rundan är aktiv, alla har spawnat och antal fiender är 0 stoppas rundan och loadar nästa.
            this.currentRoundIndex++
            this.allEnemiesSpawned = false
            this.activeRound = false
            setTimeout(() => this.loadRound(), 5000)
            return
        }
    }

    bossDefeated(position) {
        for(let i = 0; i < 10; i++) {
            const enemy = new Book(10, this.properties, position) // Skapar 10 böcker utöver bossen för att göra det lite svårare
            this.enemies.push(enemy)
        }
    }

    render(ctx, deltaTime) {
        if(!pause) { // Kollar om det är pausad
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const projectile = projectiles[i]
                projectile.movement(deltaTime)

                if (projectile.deletion) { // Om variabeln på projectilen säger att den har kommit fram och ska deletas tar den bort boken HP på boken som träffades
                    for (let j = this.enemies.length - 1; j >= 0; j--) {
                        const enemy = this.enemies[j]
                        const distance = ((enemy.x + 10 - projectile.x) ** 2 + (enemy.y + 18 - projectile.y) ** 2) ** 0.5 // Räknar ut distansen

                        if (distance < 16) { // Om den är tillräckligt nära och inte missar tar den bort HP från boken.
                            const enemyDead = enemy.hit(projectile.attackDamage, j)
                            if (projectile.frozenTime > 0) { // Om det finns frystid ger den information till enemy klassen osv med dem andra.
                                enemy.frozen = true
                                enemy.frozenTime = projectile.frozenTime
                            } else if (projectile.gluedTime > 0) {
                                enemy.glued = true
                                enemy.gluedTime = projectile.gluedTime
                                enemy.gluedEffect = projectile.gluedEffect
                            } else if (projectile.poisonTime > 0) {
                                enemy.poison = true
                                enemy.poisonTime = projectile.poisonTime
                                enemy.poisonDamage = projectile.poisonDamage
                            }
                            if (enemyDead) {
                                this.enemies.splice(j, 1)
                            }
                            break
                        }
                    }
                    projectiles.splice(i, 1) // Tar bort projektilen
                }
            }
        }
        // Ritar varje lager.
        this.enemies.forEach(enemy => {
            enemy.draw(ctx);
        })
        placedTowers.forEach(tower => {
            tower.draw(Tctx)
        })

        projectiles.forEach(projectile => {
            projectile.draw(Pctx)
        })
    }

}

class Tower {
    constructor(towerType, towerId, x, y) {
        this.towerType = towerType

        this.configIndex = towerType - 1 // Använder en configIndex för att lättare hämta informationen från JSON-filen
        
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
        this.poisonDamage = 0
        this.poisonTime = 0


        if (this.configIndex === 3) { // Kollar om indexen stämmer överrens med "power"-funktionerna och sätter det om det är sant.
            this.frozenTime = towers[3].frozenTime
        } else if (this.configIndex === 5) {
            this.gluedTime = towers[5].gluedTime
            this.gluedEffect = towers[5].gluedEffect
        } else if (this.configIndex === 6) {
            this.poisonDamage = towers[6].poisonDamage
            this.poisonTime = towers[6].poisonTime
        }
    }

    draw(ctx) { // Ritar tornen
        ctx.save()
        ctx.translate(this.x + 16, this.y + 16)
        ctx.rotate(this.rotation)
        ctx.drawImage(this.image, -16, -16, 32, 32)
        ctx.restore()
        if (this.towerSlc) { // Om man är selectad på upgrade-sektionen ritas en ring runtom tornet som visar rangen.
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

        // Skapar och kollar vilken bok är närmast slutet
        let furthestEnemy = 0
        let furthestEnemyIndex = -1

        for (let i = 0; i < enemies.length; i++) {

            const enemy = enemies[i]
            if(this.towerType != 8) {
                if (this.gluedTime > 0) {
                    if(enemy.glued) {continue}
                    if(enemy.frozen) {continue}
                } else if(this.frozenTime > 0) {
                    if(enemy.frozen) {continue}
                } else if(this.poisonTime > 0) {
                    if(enemy.poison) {continue}
                }
            }
            // Om typerna har redan gjort något på tornet ska de inte kunna skicka något på dem igen, förutom Howarts då.

            const currentEnemyPosition = enemy.currentPosition() // Hämtar vart boken är.
            const deltaX = currentEnemyPosition[0] - (this.x + 16) // Distansen från tornet till boken.
            const deltaY = currentEnemyPosition[1] - (this.y + 16)

            const distance = (deltaX ** 2 + deltaY ** 2)**0.5 // Pythagoras sats för att få hypotenusan från tornet till boken 

            if (distance <= this.range) { // Om distansen från boken och tornet är lika med eller mindre än rangen läggs det till i kandidaterna
                const nextPoint = enemy.path[enemy.pathindex]

                const furthestDistance = (enemy.pathindex * 10000) - (nextPoint.x**2 + nextPoint.y**2)**0.5 // Har ett högt värde på indexen för få distansen att bli högre

                if (furthestEnemy < furthestDistance) { // Kollar om den är närmare slutet än den förgående, lägger den som närmare slutet senare.
                    furthestEnemy = furthestDistance 
                    furthestEnemyIndex = i
                }
            }
        }
        if (furthestEnemyIndex !== -1 && this.attackTime <= 0) { // Efter förgående kollar den om den kan attackera och om det finns en enemy i rangen.
            const enemy = enemies[furthestEnemyIndex]

            const currentEnemyPosition = enemy.currentPosition()
            const deltaX = currentEnemyPosition[0] - (this.x + 16)
            const deltaY = currentEnemyPosition[1] - (this.y + 16)
  
            this.rotation = Math.atan2(deltaY, deltaX) + (Math.PI / 2) // Tar reda på lutningen med hjälp av atan2 och får vinkeln.
            enemy.damage(this.attackDamage, this) // Attackerar boken.
            this.shots++
            this.upgrade()
            this.attackTime = this.attackSpeed 
        }
    }

    upgradeTower(currentUpgrade) {
        if (currentMoney >= currentUpgrade.cost) {
            currentMoney -= currentUpgrade.cost
            uiUpdate()
            currentUpgrade.upgrades.forEach(statObj => { // Kollar för varje upgrade inom upgrades.json och sätter då nya värdet
                const statKey = Object.keys(statObj)[0] // Hämtar namnet av objektet och senare sätter nuvarande staten till den nya under.
                this[statKey] = statObj[statKey]
            })
            this.tier++

            this.upgrade()
        } else {
            return false // Returnerar falskt om det inte finns tillräckligt med pengar
        }
    }

    async upgrade() {

        if(!this.towerSlc) {
            return // Om den inte är selectad returneras och inget händer.
        }

        const upgradeData = await dataRetreiver("upgrades.json")
        const upgradePath = upgradeData.upgrades[this.configIndex].upgradePath
        const currentUpgrade = upgradePath[this.tier]

        // Text för upgrade sidan.
        let rangeUpgrade = ""
        let damageUpgrade = ""
        let speedUpgrade = ""
        let frozenTimeUpgrade = ""
        let gluedTimeUpgrade = ""
        let gluedEffectUpgrade = ""
        let poisonDamageUpgrade = ""
        let poisionTimeUpgrade = ""

        upgradeTab.querySelector(".image").innerHTML = `
        <img src="sprites/tower${this.towerType}.png" style="transform: rotate(180deg)">
        <div class="shots">
            <p>Shots: ${this.shots}</p>
        </div>
        `
        upgradeTab.querySelector(".towerName").innerHTML = `
        <h3>${this.towerName}</h3>
        `

        if(this.tier === 4) {
            upgradeTab.querySelector(".upgrade").innerHTML = `
            <button id="upgradeBtn" disabled>Maxed</button>
            `
            const btn = document.getElementById("upgradeBtn") 
            btn.style.cursor = "not-allowed"
        } else {
            upgradeTab.querySelector(".upgrade").innerHTML = `
            <button id="upgradeBtn">${currentUpgrade.name} | $${currentUpgrade.cost}</button>
            `
            currentUpgrade.upgrades.forEach(statObj => { // Om upgraderingen har staten visar den nya staten.
                const statKey = Object.keys(statObj)[0]
                if(statKey == "attackDamage") {damageUpgrade = `=> ${statObj[statKey]}`}
                if(statKey == "attackSpeed") {speedUpgrade = `=> ${statObj[statKey]}`}
                if(statKey == "range") {rangeUpgrade = `=> ${statObj[statKey]}`}
                if(statKey == "gluedTime") {gluedTimeUpgrade = `=> + ${statObj[statKey]}`}
                if(statKey == "gluedEffect") {gluedEffectUpgrade = `=> / ${statObj[statKey]}`}
                if(statKey == "frozenTime") {frozenTimeUpgrade = `=> ${statObj[statKey]}`}
                if(statKey == "poisonDamage") {poisonDamageUpgrade = `=> ${statObj[statKey]}`}
                if(statKey == "poisonTime") {poisionTimeUpgrade = `=> ${statObj[statKey]}`}
            })
        }

        upgradeTab.querySelector(".descriptionUpgrade").innerHTML = `
        <p class="statUpgrade">Damage : ${this.attackDamage} ${damageUpgrade}</p>
        <p class="statUpgrade">Speed : ${this.attackSpeed} ${speedUpgrade}</p>
        <p class="statUpgrade">Range : ${this.range} ${rangeUpgrade}</p>
        <p class="statUpgrade">Frozen Time : ${this.frozenTime} ${frozenTimeUpgrade}</p>
        <p class="statUpgrade">Glued Time : ${this.gluedTime} ${gluedTimeUpgrade}</p>
        <p class="statUpgrade">Glued Effect : / ${this.gluedEffect} ${gluedEffectUpgrade}</p>
        <p class="statUpgrade">Poison Damage : ${this.poisonDamage} ${poisonDamageUpgrade}</p>
        <p class="statUpgrade">Poison Time : ${this.poisonTime} ${poisionTimeUpgrade}</p>
        `

        upgradeTab.classList.add("showUpgrade")

        const upgradeBtn = document.getElementById("upgradeBtn")

        upgradeBtn.onclick = () => {
            const upgraded = this.upgradeTower(currentUpgrade)
            if (!upgraded) { // Om upgraded returnerar falskt ändrar den knappen för att säga att man inte har tillräckligt med pengar
                upgradeTab.querySelector(".upgrade").innerHTML = `
                <button id="upgradeBtn">Not enough money</button>
                `
                setTimeout(() => {
                    this.upgrade()
                }, 1000)
            }
        }
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
        // Hämtar "power"-funktionerna från tornet för 
        this.frozenTime = tower.frozenTime
        this.gluedTime = tower.gluedTime
        this.gluedEffect = tower.gluedEffect
        this.poisonDamage = tower.poisonDamage
        this.poisonTime = tower.poisonTime

        this.projectileSize = [4, 12] // Sizen för normala projektilerna
        this.projectile = sprites.projectile1

        if(tower.towerType == 8) { // Om det är howarts kastas en annan projektil
            this.projectile = sprites.projectile5
            this.projectileSize = [20, 40] 
        } else if(this.frozenTime > 0) { // Andra projektiler beroende på powerup
            this.projectile = sprites.projectile2
        } else if(this.gluedTime > 0) {
            this.projectile = sprites.projectile3
        } else if(this.poisionTime > 0) {
            this.projectile = sprites.projectile4
        }
    }

    homing() {
        this.eX = this.target.x + 10 // Hämtar vart boken är
        this.eY = this.target.y + 18
        const deltaX = this.eX - this.x // Kollar distansen mellan boken och projektiler
        const deltaY = this.eY - this.y

        this.rotation = Math.atan2(deltaY, deltaX) + (Math.PI / 2) // Använder atan2 igen för att få vinkeln.

        const distance = Math.max(1, (deltaX ** 2 + deltaY ** 2) ** 0.5) // Hämtar distansen mellan deltorna x och y med pythagoras men om det är mindre än 1 sätts det som 1 för att undvika att dela på för mycket och ge för snabb hastighet

        this.speedX = (deltaX / distance) * 800 // Ger hastigheten
        this.speedY = (deltaY / distance) * 800

    }

    movement(deltaTime) {
        if (this.target) { // Om det finns en bok hoamar den.
            this.homing()
        }

        const moveX = this.speedX * deltaTime // Ser till att boken rör sig lika snabbt oberoende på hz
        const moveY = this.speedY * deltaTime
        const moveDistance = (moveX ** 2 + moveY ** 2) ** 0.5 // Hur mycket den ska röra sig totalt

        const remainingX = this.eX - this.x
        const remainingY = this.eY - this.y
        const distanceRemaining = (remainingX ** 2 + remainingY ** 2) ** 0.5 // Pythagoras igen för att få distansen som är kvar från projektilen till boken.

        if (distanceRemaining <= moveDistance) { // Om hastigheten är större eller lika med distansen kvar lockar den på boken och ändrar till att projektilen ska tas bort, annars flyttar den då projektilen
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
        ctx.drawImage(this.projectile, -3, -3, this.projectileSize[0], this.projectileSize[1])
        ctx.restore()
    }
}


async function dataRetreiver(url) { // Fetchar från json-filerna
    const data = await fetch(url)
    const jsonFile = await data.json()
    return jsonFile
}

async function loadTowers() { // Loadar tornen
    const retrieveData = await dataRetreiver("towers.json")
    towers = retrieveData.towers
}

function animate(currentTime = performance.now()) { // Får vad tiden är sedan programmet startades
    let deltaTime = (currentTime - lastTime) / 1000 // Tiden det tar för saken att "repeata" i sekunder

    lastTime = currentTime // Sätter tiden som last time

    if (deltaTime > 0.1) {
        deltaTime = 0.1; // Om man tabbar ut blir tiden för lång, vilket kommer glitcha hela spelet
    }

    if (currentHp <= 0) { // Om man har 0 HP förlorar man och spelet skickar en crash för att stoppa det.
        currentHp = 0
        gameActive = false
        uiUpdate()
        throw new Error("You have died!") 
    }

    fps = Math.round(1 / deltaTime) // Får fram vad fps;en är för console loopen (som ett sätt att se sin prestanda)
    // Clearar projektil-, bok- och torncanvasen.
    Pctx.clearRect(0, 0, projectileCanvas.width, projectileCanvas.height)
    Bctx.clearRect(0, 0, bookCanvas.width, bookCanvas.height)
    Tctx.clearRect(0, 0, towerCanvas.width, towerCanvas.height)
    if (round.activeRound) {
        round.currentRound(deltaTime) // Om rundan är aktiv loadar den nuvarande rundan.
    }
    round.render(Bctx, deltaTime) // Ritar in alla relevanta lager och kalkylerar projektilen.
    requestAnimationFrame(animate) // Loopar.
}

function uiUpdate(won) {

    // Ui för HP, pengar, förlust/vinst
    const heartSprite = sprites["heart"]

    uictx.clearRect(0, 0, uiCanvas.width, uiCanvas.height)
    uictx.font = "48px serif"
    uictx.drawImage(heartSprite, 10, 20)
    uictx.fillText(currentHp, 40, 50)
    uictx.fillText("$" + currentMoney, 160, 50)
    uictx.font = "30px serif"
    uictx.fillText("Round " + (round.currentRoundIndex + 1) + "/30", 750, 30)

    if(currentHp === 0) {
        uictx.fillStyle = "rgba(0, 0, 0, 0.5)"
        uictx.fillRect(0, 0, 918, 540)
        uictx.font = "100px serif"
        uictx.fillStyle = "red"
        uictx.fillText("You have died!", 160, 250)
        uictx.font = "40px serif"
        uictx.fillText("Please refresh the page to restart", 200, 300)
    } else if (won) {
        uictx.fillStyle = "rgba(0, 0, 0, 0.5)"
        uictx.fillRect(0, 0, 918, 540)
        uictx.font = "100px serif"
        uictx.fillStyle = "rgb(213, 241, 0)"
        uictx.fillText("You have won!", 165, 250)
        uictx.font = "40px serif"
        uictx.fillText("Please refresh the page to restart", 200, 300)
    }
}

// Pathtracar för att visa vart man inte kan lägga tornet.
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
} // Kollar om tornet ligger på mappen

function onTower(x, y) {
    condition = false
    placedTowers.forEach(tower => {
        towerX = tower.x
        towerY = tower.y

        if (x >= (towerX - 40) && x <= (towerX + 40) && y >= (towerY - 40) && y <= (towerY + 40)) { // Kollar om tornet ligger nära nog ett annat torn
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
    }) // Ritar rött runt alla andra torn för att visa att man inte kan placera där med cirklar (passar inte exakt men ger en bild)
}

function fpsLogger() {
    setTimeout(() => {
        console.log("Current fps: " + fps)
        fpsLogger()
    }, 3000)
} // Skriver FPS i konsolen varje 3 sekunder.

function aspectRatioUpdater() { // Får fram aspectration då spelet måste vara en viss aspect ratio för att musen ska fungera, använder sig av musens x och y-koordinat för att sätta ner tornet.
    const windowAspectRatio = window.innerWidth / window.innerHeight // Tar reda på aspect ration
    const purposedAspectRatio = 2560 / 1300 // Den ration spelet egentligen ska ligga vid, men det är fine.
    if (windowAspectRatio > purposedAspectRatio) { // Om widthen är större på ration får den fram aspect ration från höjden då den fyller hela y-axeln
        aspectRatio = window.innerHeight / 540
        windowUi.style.height = "100vh"
        windowUi.style.width = ""
    } else {
        aspectRatio = (window.innerWidth - sideTab.offsetWidth) / 918 // Annars hämtar den från x-axeln och tar bort sidebarens width.
        windowUi.style.height = ""
        windowUi.style.width = "100vw"
    }
    const rect = windowUi.getBoundingClientRect() // Hämtar vad x och y koordinaterna är vid den svarta delen som är bakgrunden för att räkna rätt senare.
    widthX = rect.left
    widthY = rect.top
}

function paused() {
    if(pause) {
        pauseBtn.innerHTML = `<img src="svg/pause-solid-full.svg" class="svg">`
        pauseBtn.title = "Resume Game"
    } else {
        pauseBtn.innerHTML = `<img src="svg/play-solid-full.svg" class="svg">`
        pauseBtn.title = "Pause Game"
    } // Ändrar SVG'n beroende på om man har den pausad eller inte
    pause = !pause
}

towersList.forEach(button => {
    button.addEventListener("mousedown", function(e) { // Om man klickar på ett av tornen på sidebaren så hämtar den information från den.
        if(!gameActive) {return} 
        mouseDown = true
        towerCurrentId = button.id // Får IDn
        currentTowerCost = towers[(towerCurrentId - 1)].cost // Hämtar kostnaden
    })
})

window.addEventListener("mousedown", function (e) {
    if(!gameActive) {return}
    const mouseX = (e.x - widthX) / aspectRatio // Translatar med aspectration vad musens-x är på canvasen.
    const mouseY = (e.y - widthY) / aspectRatio
    let clickedTower = null

    placedTowers.forEach(tower => {
        const x = tower.x
        const y = tower.y
        if(x <= mouseX && mouseX <= x + 32 && y <= mouseY && mouseY <= y + 32) { // Kollar för varje torn om man klickar på den
            clickedTower = tower
        }
    })
    if(clickedTower) {
        placedTowers.forEach(tower => {
            tower.deselect() // Deselectar upgraden från alla andra torn förutom den man tryckte på
        })
        clickedTower.towerSlc = true // Sätter den som select och öppnar upgrade tabben
        clickedTower.upgrade()
    } else {
        if(!upgradeTab.contains(e.target)) { // Om man inte klickar på något som inte är på upgradetabben då den är öppet och inte klickade på något annat torn tas upgradetabben bort.
            upgradeTab.classList.remove("showUpgrade")
            placedTowers.forEach(tower => {
                tower.deselect()
            })
        }
    }
})

window.addEventListener("mouseup", function(e) {
    if(!gameActive) {return}
    const x = (e.x - widthX) / aspectRatio // Samma sak som förut, för canvas-x-koordinaten
    const y = (e.y - widthY) / aspectRatio
    Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height)
    if (insideCanvas && mouseDown && (currentTowerCost <= currentMoney) && !onMap(x, y) && !onTower(x, y)) { // Kollar om den är innanför canvasen, musen är nere innan på ett av tornen och att man har tillräckligt med pengar och inte är på mappen eller ett annat torn
        currentMoney -= currentTowerCost
        uiUpdate()
        const tower = new Tower(towerCurrentId, towerIdIndex, x, y) // Skapar tornet
        towerIdIndex++
        placedTowers.push(tower)
    }
    mouseDown = false
    windowUi.style.cursor = "default"
})

window.addEventListener("mousemove", function(e) {
    if(!gameActive) {return}
    const x = (e.x - widthX) / aspectRatio // Samma sak igen
    const y = (e.y - widthY) / aspectRatio 
    if(mouseDown) {
        aspectRatioUpdater()
        const towerImage = sprites[("tower" + towerCurrentId)] // Sätter spriten som tornet man har valt
        windowUi.style.cursor = "drag"
        if(e.x < aspectRatio * 918) { // Kollar om den är i canvasen.
            insideCanvas = true
            Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height) // Ritar rangen och tornet och visar rött under om man inte kan placera
            Tpctx.beginPath()
            Tpctx.arc((x + 16), (y + 16), towers[towerCurrentId - 1].range, 0, 2 * Math.PI)
            Tpctx.strokeStyle = "rgba(38, 255, 0, 0.55)"
            Tpctx.fillStyle = "rgba(38, 255, 0, 0.55)"
            Tpctx.fill()
            Tpctx.stroke()
            Tpctx.drawImage(towerImage, x, y, 32, 32)
            if((currentTowerCost > currentMoney) || onMap(x, y) || onTower(x, y)) { // Om inte har tillräckligt med pengar eller den är på mappen eller på ett annat torn så visar den att man inte kan placera
                Tpctx.fillStyle = "rgba(255, 0, 0, 0.4)"
                Tpctx.fillRect(x, y, 32, 32)
            }
            mapPath(Tpctx, "rgba(255, 0, 0, 0.4)", 20)
            towerPlacement(Tpctx, x, y)
        } else {
            Tpctx.clearRect(0, 0, towerPlaceCanvas.width, towerPlaceCanvas.height) // Clearar canvasen om den inte är i canvasen.
            insideCanvas = false
        }
    }
})

window.addEventListener("keydown", function (e) {
    if(!gameActive) {return}
    const key = e.key
    if(key === " ") {
        paused()
    }
})

window.addEventListener("resize", function(e) {
    if(!gameActive) {return}
    aspectRatioUpdater() // Varje gång man resizar uppdatteras aspect-ration.
})


pauseBtn.addEventListener("click", paused)

changeLog.addEventListener("click", function(e) {
    window.open("changelog.html", "_blank") // Öppnar en ny flik med changelogen om man trycker på den
})

let round = new RoundManager() // Skapar rund systemet och loadar tornen
loadTowers()

let spritesLeft = Object.keys(sprites).length // Längden av alla sprites

// Loadar alla tornen innan man ritar något
for (let sprite in sprites) {
    sprites[sprite].onload = () => { // Varje gång en sprite loadas tar den bort från mängden som måste loadas
        console.log("Sprite loaded: " + sprite)
        spritesLeft--
        if (spritesLeft === 0) { // När alla loadas startas spelet.
            console.log("Successfully loaded all sprites!")
            uiUpdate()
            round.loadRoundList()
            fpsLogger()
        }
    }
}
aspectRatioUpdater() // Fixar aspectration.