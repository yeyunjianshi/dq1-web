import GameObject from '../gameObject'
import { LayoutFitContent, measureLocalPositionByGravity } from './layout'

export default class HorizontalLayout implements ILayout {
  private _root: GameObject
  private _gravity: VerticalGaravity
  private _padding: Vector4

  constructor(root: GameObject, config: HorizontalLayoutConfig) {
    this._root = root
    this._gravity = config.gravity
    this._padding = config.padding ?? [0, 0, 0, 0]
  }

  layout(): [number, number] {
    let maxWidth = 0
    let maxHeight = 0

    this._root.children.forEach((child) => {
      child.localX = this._padding[3] + maxWidth

      const [measureWidth, measureHeight] = child.layout()

      maxWidth += measureWidth
      maxHeight = Math.max(maxHeight, measureHeight)
    })

    const containerHeight =
      this._root.configHeight === LayoutFitContent
        ? maxHeight + this._padding[0] + this._padding[2]
        : this._root.measureHeight

    this._root.children.forEach((child) => {
      child.localY = measureLocalPositionByGravity(
        this._gravity,
        containerHeight,
        child.measureHeight,
        [this._padding[0], this._padding[2]]
      )
    })

    return [
      maxWidth + this._padding[1] + this._padding[3],
      maxHeight + this._padding[0] + this._padding[2],
    ]
  }
}
