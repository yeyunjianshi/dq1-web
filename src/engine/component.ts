import GameObject from './gameObject'
import { AssetLoader } from './resource'

abstract class Component implements LifeCycle {
  active = true

  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  getComponentsInChildren<T extends typeof Component>(
    componentConstructor: T
  ): Component[] {
    const ret: Component[] = []

    const queue: GameObject[] = [this.root]
    while (queue.length > 0) {
      const node = queue.shift() as GameObject
      const components = node.components.filter(
        (child) => child instanceof componentConstructor
      )
      ret.push(...components)
      queue.push(...node.children)
    }

    return ret
  }

  getComponentInChildren<T extends typeof Component>(
    componentConstructor: T
  ): Component | undefined {
    const queue: GameObject[] = [this.root]
    while (queue.length > 0) {
      const node = queue.shift() as GameObject
      const component = node.components.find(
        (child) => child instanceof componentConstructor
      )
      if (component) return component
      queue.push(...node.children)
    }
    return undefined
  }

  getComponent<T extends typeof Component>(
    componentConstructor: T
  ): Component | undefined {
    return this.root.components.find(
      (component) => component instanceof componentConstructor
    )
  }

  get root() {
    return this._root
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

  start() {}
  tick() {}
  update() {}
  render() {}
}

export default Component
