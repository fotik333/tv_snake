import { Container } from '@pixi/display'
import { createCircle, createRect, createRoundedRect, createRoundedRectOfSize, createRoundedSquareOfSize, createSprite, createText } from './utils'
import { Easing, Tween } from '@tweenjs/tween.js'
import { BLEND_MODES, Sprite, TextStyle, Texture } from 'pixi.js'
import { playSound, textures, waiter } from '.'
import { GlowFilter } from 'pixi-filters'
import Snake from './Snake'

export const cellSize = 80

export const fieldSizeX = 15
export const fieldSizeY = 11

export const getPositionByCoords = (x, y) => {
    return [(x - fieldSizeX / 2 + 0.5) * cellSize, (y - fieldSizeY / 2 + 0.5) * cellSize]
}

class Field extends Container {
    static WIN = 'fieldWin'
    static LOSE = 'fieldLose'
    static EATED = 'appleEated'

    constructor() {
        super()

        this.sortableChildren = true

        const rectSizeX = fieldSizeX * cellSize + 5
        const rectSizeY = fieldSizeY * cellSize + 5

        this.addChild(createRoundedRectOfSize(rectSizeX + 20, rectSizeY + 20, rectSizeX * 0.015, 0xcccccc))
        this.addChild(createRoundedRectOfSize(rectSizeX, rectSizeY, rectSizeX * 0.01, 0x248052))

        const fieldCellSize = cellSize - 4

        for (let i = 0; i < fieldSizeX; i++) {
            for (let j = 0; j < fieldSizeY; j++) {
                const cell = this.addChild(createRoundedSquareOfSize(fieldCellSize, fieldCellSize * 0.1, i % 2 == j % 2 ? 0x1a5c3b : 0x134d30))
                cell.position.set(...getPositionByCoords(i, j))
            }
        }

        this.init()
    }

    init() {
        if (this.snake) {
            this.snake.off(Snake.EATED, this.onAppleEated.bind(this))
            this.snake.off(Snake.LOSE, this.onSnakeLose.bind(this))

            this.snake.destroy()
        }

        this.snake = this.addChild(new Snake(Math.floor(fieldSizeX / 2), Math.floor(fieldSizeY / 2)))
        this.snake.zIndex = 10

        this.snake.on(Snake.EATED, this.onAppleEated.bind(this))
        this.snake.on(Snake.LOSE, this.onSnakeLose.bind(this))

        this.spawnApple()
    }

    onSnakeLose() {
        this.emit(Field.LOSE)
    }

    onAppleEated() {
        this.spawnApple()
        this.emit(Field.EATED)
    }

    spawnApple() {
        if (this.appleTween) this.appleTween.stop()

        if (this.apple) {
            const apple = this.apple

            new Tween(this.apple.scale).to({ x: 0, y: 0 }, 200).start().onComplete(() => {
                apple.destroy()
            })
        }

        const apple = this.addChild(new Container)

        const light = apple.addChild(createSprite('small_light', 0.7))
        light.alpha = 0.5
        light.blendMode = BLEND_MODES.ADD
        new Tween(light).to({ rotation: Math.PI * 2 }, 5000).repeat(Infinity).start()

        const appleSprite = apple.addChild(createSprite('apple', 0.18))
        this.appleTween = new Tween(appleSprite.scale).to({ x: 0.21, y: 0.21 }, 500).repeat(Infinity).yoyo(true).start()

        let x, y

        do {
            x = Math.floor(Math.random() * fieldSizeX)
            y = Math.floor(Math.random() * fieldSizeY)
        } while (this.snake.parts.find(part => part.coords[0] == x && part.coords[1] == y))

        apple.position.set(...getPositionByCoords(x, y))
        apple.zIndex = 1
        apple.coords = [x, y]

        this.apple = apple
    }
}

export default Field