import GameObject from './gameObject'
import { AssetLoader } from './resource'

abstract class Component implements LifeCycle {
  active = true

  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  get root() {
    return this._root
  }

  get time() {
    return this._root.engine.time
  }

  parseData(assetLoader: AssetLoader, data: ComponentData): void {}

  start() {}
  tick() {}
  update() {}
  render() {}
}

export default Component
