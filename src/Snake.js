import { Container } from '@pixi/display'
import { createCircle, createRect, createRoundedRect, createRoundedSquareOfSize, createSprite, createText } from './utils'
import { Easing, Tween } from '@tweenjs/tween.js'
import { BLEND_MODES, Sprite, TextStyle, Texture } from 'pixi.js'
import { playSound, stopBgSound, textures, waiter } from '.'
import { GlowFilter } from 'pixi-filters'
import { cellSize, fieldSizeX, fieldSizeY, getPositionByCoords } from './Field'

const DIRECTION = {
    right: 0,
    down: 1,
    left: 2,
    up: 3,
}

class Snake extends Container {
    static EATED = 'eated_apple'
    static LOSE = 'snakeLose'

    constructor(startX, startY) {
        super()

        this.maxLength = fieldSizeX * fieldSizeY

        this.once('added', () => {
            this.init(startX, startY)
        })
    }

    init(startX, startY) {
        this.direction = this.nextDirection = DIRECTION.up

        const head = this.createPart()
        head.coords = [startX, startY]
        head.position.set(...getPositionByCoords(...head.coords))
        
        this.headContainer = head.addChild(new Container)
        this.headContainer.addChild(createSprite('eyes', 1))
        this.tounge = this.headContainer.addChild(createSprite('tounge', 4, 20, -130))
        this.tounge.anchor.set(.5, 1)

        head.zIndex = 10

        const part1 = this.createPart()
        part1.coords = [startX, startY + 1]
        part1.position.set(...getPositionByCoords(...part1.coords))

        const part2 = this.createPart()
        part2.coords = [startX, startY + 2]
        part2.position.set(...getPositionByCoords(...part2.coords))

        this.parts = [head, part1, part2]

        //controls
        window.addEventListener('keydown', e => {
            if (e.key == 'ArrowRight') this.changeDirection(DIRECTION.right)
            if (e.key == 'ArrowDown') this.changeDirection(DIRECTION.down)
            if (e.key == 'ArrowLeft') this.changeDirection(DIRECTION.left)
            if (e.key == 'ArrowUp') this.changeDirection(DIRECTION.up)

            if (e.key == 'l') this.lose = true
        })

        this.startStepTween()
    }

    createPart() {
        return this.parent.addChild(createSprite('part', 0.24))
    }

    async startStepTween() {
        if (this.lose) {
            this.loseSequence(false)
            return
        }

        await waiter(this.getStepTime())

        this.makeStep()
        this.startStepTween()
    }

    async loseSequence() {
        stopBgSound()

        playSound('gameover')
        
        const blinkTime = 300

        for (let i = 0; i < 3; i++) {
            this.parts.forEach(p => p.visible = false)

            await waiter(blinkTime)

            this.parts.forEach(p => p.visible = true)

            await waiter(blinkTime)
        }

        this.emit(Snake.LOSE)
    }


    getStepTime() {
        return 200 - (this.parts.length / this.maxLength) * 150
    }

    makeStep() {
        this.direction = this.nextDirection

        let lastPartCoords = [...this.parts[this.parts.length - 1].coords]

        let lastCoords = []

        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i]
            let coords = [...part.coords]
            part.lastCoords = [...part.coords]

            if (i === 0) {
                switch (this.direction) {
                    case DIRECTION.right:
                        part.coords[0] += 1
                        if (part.coords[0] >= fieldSizeX) part.coords[0] = 0
                        break;
                    case DIRECTION.down:
                        part.coords[1] += 1
                        if (part.coords[1] >= fieldSizeY) part.coords[1] = 0
                        break;
                    case DIRECTION.left:
                        part.coords[0] -= 1
                        if (part.coords[0] < 0) part.coords[0] = fieldSizeX - 1
                        break;
                    case DIRECTION.up:
                        part.coords[1] -= 1
                        if (part.coords[1] < 0) part.coords[1] = fieldSizeY - 1
                        break;
                    default:
                        break;
                }
            } else {
                part.coords = lastCoords
            }

            lastCoords = coords
        }

        let head = this.parts[0]

        //ROTATE HEAD
        this.headContainer.rotation = Math.PI / 2 * this.direction + Math.PI / 2

        //CHECK EAT SELF
        if (this.parts.find(p => p.coords[0] == head.coords[0] && p.coords[1] == head.coords[1] && p !== head)) {
            this.lose = true
            return
        }

        //MOVE PARTS
        for (let i = 0; i < this.parts.length; i++) {
            const part = this.parts[i]
            const halfStepTime = this.getStepTime() / 2
            const newPos = getPositionByCoords(part.coords[0], part.coords[1])
            const tweenObj = { x: newPos[0], y: newPos[1], alpha: 1}

            let midX = part.x + (newPos[0] - part.x) / 2, newX, midY = part.y + (newPos[1] - part.y) / 2, newY
            let changeSide = false
            
            if (part.lastCoords[1] == 0 && part.coords[1] == fieldSizeY - 1) {
                midY = part.y - cellSize / 2
                newY = newPos[1] + cellSize / 2
                changeSide = true
            } else if (part.lastCoords[1] == fieldSizeY - 1 && part.coords[1] == 0) {
                midY = part.y + cellSize / 2
                newY = newPos[1] - cellSize / 2
                changeSide = true
            } else if (part.lastCoords[0] == 0 && part.coords[0] == fieldSizeX - 1) {
                midX = part.x - cellSize / 2
                newX = newPos[0] + cellSize / 2
                changeSide = true
            } else if (part.lastCoords[0] == fieldSizeX - 1 && part.coords[0] == 0) {
                midX = part.x + cellSize / 2
                newX = newPos[0] - cellSize / 2
                changeSide = true
            }

            new Tween(part).to({ x: midX, y: midY, alpha: changeSide ? 0 : 1 }, halfStepTime).start().onComplete(() => {
                part.position.set(newX || midX, newY || midY)
                new Tween(part).to(tweenObj, halfStepTime).start()
            })
        }

        //EAT APPLE
        const apple = this.parent.apple

        if (this.parts[0].coords[0] == apple.coords[0] && this.parts[0].coords[1] == apple.coords[1]) {
            new Tween(this.tounge.scale).to({ y: 0 }, this.getStepTime() / 2).repeat(1).yoyo(true).start()

            const part = this.createPart()
            part.coords = [lastPartCoords[0], lastPartCoords[1]]
            part.position.set(...getPositionByCoords(...part.coords))
            part.zIndex = 10

            this.parts.push(part)

            this.emit(Snake.EATED)
        }
    }

    changeDirection(value) {
        if (Math.abs(value - this.direction) == 2) return

        playSound('whoosh', false, 0.7)
        this.nextDirection = value
    }

    destroy() {
        this.parts.forEach(p => p.destroy())
        super.destroy()
    }
}

export default Snake