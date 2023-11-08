import { Container, DisplayObject } from '@pixi/display'
import { Easing, Tween } from '@tweenjs/tween.js';
import { leave, playBgSound, playSound, stopBgSound, textures, waiter } from '.';
import { createRect, createSprite, createText } from './utils';
import Field from './Field';
import { BLEND_MODES, Sprite, TextStyle, Texture } from 'pixi.js';
import Score from './Score';

const SIZEY = 1080

class Game extends Container {
	constructor() {
		super()

		this.finished = false
		this.interactive = true
		
		this.bg = this.addChild(new Sprite(textures[`bg.jpg`]))
		this.bg.anchor.set(.5)

		this.createField()

		this.score = this.addChild(new Score)

		window.addEventListener('keydown', e => {})

		this.resize()
	}

	createField() {
		this.field = this.addChild(new Field)
		this.field.on(Field.WIN, () => this.finish(true))
		this.field.on(Field.EATED, () => this.onEated())
		this.field.on(Field.LOSE, () => this.onFieldLose())
	}

	onEated() {
		playSound('chrum')
		this.score.addScore()
	}

	onFieldLose() {
		this.score.clear()
		this.restart()
	}

	restart() {
		playBgSound()

		this.field.init()
	}

	resize() {
		let width = window.getSize().width;
		let height = window.getSize().height;
		let ratio = Math.min(width / SIZEY, height / SIZEY);

		window.ratio = ratio;
		window.width = width;
		window.height = height;
		window.horizontal = width > height

		let prop = width / height

		this.position.set(width / 2, height / 2)
		this.scale.set(ratio)

		this.bg.y = 0
		this.bg.x = 0

		this.field.resizeCenter(0, 35)
		this.score.resizeTop(70, 1)
	}
}

DisplayObject.prototype.resizeTopLeft = function (x, y, scale) {
    this.position.set(-(window.width / 2) / ratio + x, -(window.height / 2) / window.ratio + y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeTop = function (y, scale) {
    this.position.set(0, -(window.height / 2) / window.ratio + y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeTopRight = function (x, y, scale) {
    this.position.set((window.width / 2) / ratio - x, -(window.height / 2) / window.ratio + y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeLeft = function (x, scale) {
    this.position.set(-(window.width / 2) / ratio + x, 0)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeCenter = function (x, y, scale) {
    this.position.set(x || 0, y || 0)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeRight = function (x, scale) {
    this.position.set((window.width / 2) / ratio - x, 0)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeBottomLeft = function (x, y, scale) {
    this.position.set(-(window.width / 2) / ratio + x, (window.height / 2) / window.ratio - y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeBottom = function (y, scale) {
    this.position.set(0, (window.height / 2) / window.ratio - y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

DisplayObject.prototype.resizeBottomRight = function (x, y, scale) {
    this.position.set((window.width / 2) / ratio - x, (window.height / 2) / window.ratio - y)
	scale && this.scale.set(scale)
	this.resize && this.resize()
}

export default Game;