import { Application, Assets, Spritesheet } from 'pixi.js';
import * as PIXI from 'pixi.js'
import Game from './Game.js';
import { Howl, Howler } from 'howler';
import { imagesConfig, soundsConfig } from './resouces';

window.PIXI = PIXI;

const TWEEN = require('@tweenjs/tween.js')
global.TWEEN = TWEEN;

function animate(time) {
	requestAnimationFrame(animate);
	TWEEN.update(time)
}

requestAnimationFrame(animate);

export const getTextures = (animName, length) => [...Array(length)].map((_, i) => PIXI.Texture.from(`${animName}/${i}`))
export const waiter = async time => new Promise(res => new TWEEN.Tween({}).to({}, time).start().onComplete(res))

export let textures = {}

export let gameVersion

Array.prototype.random = function () {
	return this[Math.floor((Math.random()*this.length))];
}

Array.prototype.last = function (index) {
	return this[this.length - 1 - (index || 0)];
}

export const leave = () => {
	if (window.trackClick) {
		window.trackClick()
	}
}

Array.prototype.findSame = (element) => this.find(el => el === element)

export let playSound, stopSound, stopBgSound, setSoundParams, playBgSound;

window.createGame = async _ => {
	gameVersion = 0

	let sounds = [];
	let bgSound = soundsConfig[0]

	WITH_SOUND && soundsConfig.forEach(soundConfig => {
		let snd = soundConfig.name
		let tmp = require(`../build/assets/${snd}.mp3`);

		let sound = new Howl({
			src: tmp.default,
			loop: snd === bgSound.name,
			autoplay: snd === bgSound.name,
		});

		sound.volume((params.disableSounds ? 0 : (snd === bgSound.name) ? params.musicVolume : params.soundVolume) * (soundConfig.volume || 1));
		soundConfig.rate && snd.rate(soundConfig.rate);

		sound.load();
		sound.name = snd;
		sounds.push(sound);
	});

	playSound = function(name, loop = false, volume = undefined, rate = undefined) {
		if (params.disableSounds) return;

		let snd = sounds.filter(sound => sound.name === name)[0];
		// if (!snd || snd.playing()) return;

		snd.play();

		loop && snd.loop(true);
		rate && snd.rate(rate);
		volume && snd.volume(volume * params.soundVolume);
	};

	stopSound = function(name) {
		if (params.disableSounds) return;

		let snd = sounds.filter(sound => sound.name === name)[0];
		if (!snd || !snd.playing()) return;

		snd.stop();
	};

	setSoundParams = function(name, loop = false, volume = undefined, rate = undefined) {
		let snd = sounds.filter(sound => sound.name === name)[0];
		if (!snd) return;

		loop && snd.loop(true);
		rate && snd.rate(rate);
		volume && snd.volume(volume * params.soundVolume);
	};

	playBgSound = function() {
		if (params.disableSounds) return;

		let snd = sounds.find(snd => snd.name === bgSound.name);
		snd && snd.play();
	};

	stopBgSound = function() {
		let snd = sounds.find(snd => snd.name === bgSound.name);
		snd && snd.stop();
	};

	const app = new Application({
		view: document.getElementById('canvas-game-pixi'),
		width: 1920,
		height: 1080,
		resolution: window.devicePixelRatio,
		resizeTo: window
	})
	
	const images = imagesConfig

	async function setup(textures) {
		for (let i = 0; i < textures.length; i++) {
			let texture = textures[i]
			let config = images.find(config => config.path === texture.name)

			if (config.atlas) {
				let spritesheet = new Spritesheet(texture, require(`../build/assets/${config.atlas}`))
				await spritesheet.parse()
			}
		}

		document.body.appendChild(app.view);
		app.stage.addChild(new Game);
		resize();
	}

	window.onresize = resize;
	setTimeout(_ => resize(), 50);

	function resize() {
		let w = window.getSize().width;
		let h = window.getSize().height;

		app.renderer.view.style.width = w + "px";
		app.renderer.view.style.height = h + "px";
	
		app.renderer.resize(w, h);
	
		if (app.background) {
			app.background.width = w;
			app.background.height = h;
		}

		app.stage && app.stage.children[0] && app.stage.children[0].resize();
	}

	let setupTextures = []
	
	for (let i = 0; i < images.length; i++) {
		let asset = images[i];
		const texture = await Assets.load(require(`../build/assets/${asset.path}`).default)
		texture.name = asset.path
		textures[asset.path] = texture
		setupTextures.push(texture)
	}
	globalThis.__PIXI_APP__ = app;
	window.game = app;
	window.game.sizeChanged = _ => resize();
	window.game.soundMute = value => Howler.mute(value);

	visibilityChange()

	setup(setupTextures)
};

window.addEventListener('pointerdown', onPointerDown);

const onPointerDown = _ => {
	window.removeEventListener('pointerdown', onPointerDown);

	window.playSound('background');
};

function visibilityChange() {
	let hidden = 'hidden'

	if (hidden in document)
		document.addEventListener('visibilitychange', onchange)
	else if ((hidden = 'mozHidden') in document)
		document.addEventListener('mozvisibilitychange', onchange)
	else if ((hidden = 'webkitHidden') in document)
		document.addEventListener('webkitvisibilitychange', onchange)
	else if ((hidden = 'msHidden') in document)
		document.addEventListener('msvisibilitychange', onchange)
	else if ('onfocusin' in document)
		document.onfocusin = document.onfocusout = onchange
	else
		window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange

	function onchange(evt) {
		let v = false,
			h = true,
			evtMap = {
				focus: v,
				focusin: v,
				pageshow: v,
				blur: h,
				focusout: h,
				pagehide: h
			};

		evt = evt || window.event

		let windowHidden = false;

		if (evt.type in evtMap) {
			windowHidden = evtMap[evt.type];
		} else {
			windowHidden = this[hidden];
		}

		if (Howler) {
			if (windowHidden) {
				Howler.mute(true);
			} else {
				Howler.mute(false);
			}
		}
	}

	if (document[hidden] !== undefined) {
		onchange({ type: document[hidden] ? 'blur' : 'focus' });
	}

	if (params.disableSounds) Howler.mute(true);
}