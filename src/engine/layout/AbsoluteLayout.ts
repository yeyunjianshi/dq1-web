import GameObject from '../gameObject'
import { LayoutUnLimit } from './layout'

export default class AbsoluteLayout implements ILayout {
  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  layout(
    measureParentWidth: number,
    measureParentHeight: number
  ): [number, number] {
    const [maxMeasureWidth, maxMeasureHeight] = this._root.children.reduce(
      ([maxChildWidth, maxChildHeight], child) => {
        const [childWidth, childHeight] = child.layout(
          measureParentWidth,
          measureParentHeight
        )
        return [
          Math.max(child.localX + childWidth, maxChildWidth),
          Math.max(child.localY + childHeight, maxChildHeight),
        ]
      },
      [0, 0]
    )
    const maxWidth =
      measureParentWidth == LayoutUnLimit
        ? maxMeasureWidth
        : Math.min(measureParentWidth, maxMeasureWidth)
    const maxHeight =
      measureParentHeight == LayoutUnLimit
        ? maxMeasureHeight
        : Math.min(measureParentHeight, maxMeasureHeight)

    return [maxWidth, maxHeight]
  }
}
