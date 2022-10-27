import GameObject from '../gameObject'
import { LayoutUnLimit } from './layout'

export default class VerticalLayout implements ILayout {
  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  layout(
    measureParentWidth: number,
    measureParentHeight: number
  ): [number, number] {
    let y = 0
    let maxWidth = measureParentWidth
    let maxHeight = measureParentHeight

    if (measureParentHeight === LayoutUnLimit) {
      this._root.children.forEach((child) => {
        child.localX = 0
        child.localY = y

        const [measureWidth, measureHeight] = child.layout(
          measureParentWidth,
          measureParentHeight
        )
        y += measureHeight
        maxWidth = Math.max(maxWidth, measureWidth)
        maxHeight = y
      })
    } else {
      this._root.children.forEach((child) => {
        if (y >= measureParentHeight) {
          child.localX = 0
          child.localY = 0
          child.active = false
          return
        }

        child.localX = 0
        child.localY = y

        const [measureWidth, measureHeight] = child.layout(
          measureParentWidth,
          measureParentHeight - y
        )

        y += measureHeight
        maxWidth = Math.max(maxWidth, measureWidth)
      })
    }

    return [maxWidth, maxHeight]
  }
}
