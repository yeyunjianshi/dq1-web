import GameObject from '../gameObject'
import { LayoutFitContent, measureLocalPositionByGravity } from './layout'

export default class VerticalLayout implements ILayout {
  private _root: GameObject
  private _gravity: HorizontalGravity
  private _padding: Vector4

  constructor(root: GameObject, config: VerticalLayoutConfig) {
    this._root = root
    this._gravity = config.gravity
    this._padding = config.padding ?? [0, 0, 0, 0]
  }

  layout(): [number, number] {
    let maxWidth = 0
    let maxHeight = 0

    this._root.children.forEach((child) => {
      child.localY = this._padding[3] + maxHeight

      const [measureWidth, measureHeight] = child.layout()

      maxHeight += measureHeight
      maxWidth = Math.max(maxWidth, measureWidth)
    })

    const containerWidth =
      this._root.configWidth === LayoutFitContent
        ? maxWidth + this._padding[1] + this._padding[3]
        : this._root.measureWidth

    this._root.children.forEach((child) => {
      child.localX = measureLocalPositionByGravity(
        this._gravity,
        containerWidth,
        child.measureWidth,
        [this._padding[1], this._padding[3]]
      )
    })

    return [
      maxWidth + this._padding[1] + this._padding[3],
      maxHeight + this._padding[0] + this._padding[2],
    ]
  }
}
