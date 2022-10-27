import GameObject from '../gameObject'
import { LayoutFitContent } from './layout'

export default class VerticalLayout implements ILayout {
  private _root: GameObject
  private _gravity: LayoutGravity

  constructor(root: GameObject, config: VerticalLayoutConfig) {
    this._root = root
    this._gravity = config.gravity
  }

  layout(): [number, number] {
    let y = 0
    let maxWidth = 0
    let maxHeight = 0

    this._root.children.forEach((child) => {
      child.localX = 0
      child.localY = y

      const [measureWidth, measureHeight] = child.layout()
      y += measureHeight
      maxWidth = Math.max(maxWidth, measureWidth)
      maxHeight = y
    })

    const parentWidth =
      this._root.parent.configWidth === LayoutFitContent
        ? maxWidth
        : this._root.parent.measureWidth

    this._root.children.forEach((child) => {
      if (this._gravity === 'center')
        child.localX = (parentWidth - child.measureWidth) / 2
      else if (this._gravity === 'right')
        child.localX = parentWidth - child.measureWidth
    })

    return [maxWidth, maxHeight]
  }
}
