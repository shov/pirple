import * as PIXI from 'pixi.js'
import {Sprite} from 'pixi.js'


declare type TKeyState = {
    [code:
        string | 'KeyA' | 'KeyS' | 'KeyD' | 'KeyW' | 'Space'
        ]: boolean | undefined,
}
const keyState: TKeyState = {}

class Player extends Sprite {
    public readonly SPEED: number = 4

    constructor(texture: PIXI.Texture) {
        super(texture)

        this.anchor.set(0.5)
        this.x = app.view.width / 2
        this.y = app.view.height / 2
        app.stage.addChild(this)
    }
}

class StaticLoader {
    public readonly ASSET_MAP = {
        'player': 'assets/orange.png',
    }

    constructor(protected _app: PIXI.Application) {
    }

    protected _onError(e: any) {
        alert(e.message)
    }

    protected _onProgress(e: any, graphics: PIXI.Graphics) {
        graphics.beginFill(0xFFFF00)

        graphics.drawRect(
            0,
            this._app.view.height - 20,
            this._app.view.width / 100 * e.progress,
            this._app.view.height
        )
    }

    protected _onComplete(e: any, graphics: PIXI.Graphics) {
        graphics.destroy()
    }

    public async load(): Promise<any> {
        return await new Promise((resolve, reject) => {
            const loader = this._app.loader

            for (let [name, path] of Object.entries(this.ASSET_MAP)) {
                loader.add(name, path)
            }

            loader.onError.add((e: any) => {
                this._onError(e)
                reject(e)
            })

            const graphics = new PIXI.Graphics()
            this._app.stage.addChild(graphics)

            loader.onProgress.add((e: any) => {
                this._onProgress(e, graphics)
            })

            loader.onComplete.add((e: any) => {
                this._onComplete(e, graphics)
                resolve(loader.resources)
            })
            loader.load()
        })
    }
}

let player: Player
let app: PIXI.Application
window.onload = async function () {
    app = new PIXI.Application({
        width: 640,
        height: 480,
        backgroundColor: 0xAAAAAA
    })

    document.body.appendChild(app.view)

    const resources = await (new StaticLoader(app)).load()
    player = new Player(resources.player.texture)

    app.stage.interactive = true
    app.stage.on('pointermove', movePlayer)

    // Keyboard
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    // Game loop attach
    app.ticker.add(gameLoop)
}


function movePlayer(e: any): void {
    const {x, y} = e.data.global
    player.x = x
    player.y = y
}

function onKeyDown(e: KeyboardEvent): void {
    keyState[e.code] = true
}

function onKeyUp(e: KeyboardEvent): void {
    keyState[e.code] = false
}

function gameLoop(dt: number) {
    if (keyState.KeyW) {
        player.y -= (player.SPEED * dt)
    }

    if (keyState.KeyS) {
        player.y += (player.SPEED * dt)
    }

    if (keyState.KeyA) {
        player.x -= (player.SPEED * dt)
    }

    if (keyState.KeyD) {
        player.x += (player.SPEED * dt)
    }
}


