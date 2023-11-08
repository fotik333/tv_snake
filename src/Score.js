import { BLEND_MODES, Texture, Ticker } from '@pixi/core'
import { Sprite } from '@pixi/sprite'
import { Container } from '@pixi/display'
import { Graphics, TextStyle } from 'pixi.js'
import { Easing, Tween } from '@tweenjs/tween.js'
import { createRoundedRect, createRoundedRectOfSize, createSprite, createText } from './utils'
import { leave, playSound, stopBgSound } from '.'

class Score extends Container {
    static LOSE = 'scorelose'

	constructor() {
		super()

        // this.bg = this.addChild(createRoundedRectOfSize(400, 110, 22, 0x000000, 0.55))

        this.addChild(createText('SCORE:', new TextStyle({ fontWeight: 700, fontFamily: 'FONT', fontSize: 80, fill: 0xffffff, dropShadow: true, dropShadowAngle: Math.PI / 2, dropShadowColor: 0x164016, dropShadowDistance: 8, dropShadowBlur: 10 }), -25, 0))

        this.score = 0

        this.scoreText = this.addChild(createText(this.score, new TextStyle({ fontWeight: 700, fontFamily: 'FONT', fontSize: 80, fill: 0xffffff, dropShadow: true, dropShadowAngle: Math.PI / 2, dropShadowColor: 0x164016, dropShadowDistance: 8, dropShadowBlur: 10 }), 125, 0))
        this.scoreText.anchor.set(0, .5)
	}

    addScore() {
        this.score++
        this.updateText()
    }

    clear() {
        this.score = 0
        this.updateText()
    }

    updateText() {
        this.scoreText.text = this.score
    }
}

export default Score;