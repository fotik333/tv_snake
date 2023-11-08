import { Graphics, Sprite, Text } from "pixi.js"

export const createSprite = (name, scale, x, y) => {
    const sprite = Sprite.from(name)
    sprite.anchor.set(.5)
    if (scale !== undefined) sprite.scale.set(scale)
    if (x !== undefined) sprite.x = x
    if (y !== undefined) sprite.y = y

    return sprite
}

export const createText = (string, style, x, y) => {
    let text = new Text(string, style)
    text.anchor.set(.5)
    x !== undefined && y !== undefined && text.position.set(x, y)
    return text
}

export const createRoundedSquareOfSize = (size, radius, color = 0xff0000, alpha = 1) => {
    const graphics = new Graphics()
        .beginFill(color, alpha)
        .drawRoundedRect(-size / 2, -size / 2, size, size, radius)
        .endFill()

    return graphics
}

export const createRoundedRectOfSize = (sizeX, sizeY, radius, color = 0xff0000, alpha = 1) => {
    const graphics = new Graphics()
        .beginFill(color, alpha)
        .drawRoundedRect(-sizeX / 2, -sizeY / 2, sizeX, sizeY, radius)
        .endFill()

    return graphics
}

export const createRoundedRect = (x, y, width, height, radius, color = 0xff0000, alpha = 1) => {
    const graphics = new Graphics()
        .beginFill(color, alpha)
        .drawRoundedRect(x, y, width, height, radius)
        .endFill()

    return graphics
}

export const createRect = (x, y, width, height, color = 0xff0000, alpha = 1) => {
    const graphics = new Graphics()
        .beginFill(color, alpha)
        .drawRect(x, y, width, height)
        .endFill()

    return graphics
}

export const createCircle = (x, y, radius, color = 0xff0000, alpha = 1) => {
    const graphics = new Graphics()
        .beginFill(color, alpha)
        .drawCircle(x, y, radius)
        .endFill()

    return graphics
}