import GameObject from './gameObject'
import { AssetLoader } from './resource'

abstract class Component implements LifeCycle {
  active = true
  enable = true

  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  saveToEngineGlobal() {}

  get root() {
    return this._root
  }

  get engine() {
    return this._root.engine
  }

  get renderer() {
    return this._root.engine.renderer
  }

  get time() {
    return this._root.engine.time
  }

  get resource() {
    return this._root.engine.resource
  }

  get background() {
    return this._root.background
  }

  get input() {
    return this._root.engine.input
  }

  get camera() {
    return this._root.engine.camera
  }

  get sceneManager() {
    return this._root.engine.sceneManager
  }

  get audios() {
    return this._root.engine.audios
  }

  set localPosition(pos: Vector2) {
    this.root.localX = pos[0]
    this.root.localY = pos[1]
  }

  get worldPosition(): Vector2 {
    return [this._root.worldX, this._root.worldY]
  }

  get width() {
    return this.root.measureWidth
  }

  get height() {
    return this.root.measureHeight
  }

  parseData(assetLoader: AssetLoader, data: ComponentData): void {}

  awake() {}
  start() {}
  tick() {}
  update() {}
  render() {}
}

export default Component
