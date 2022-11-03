import GameObject from '../gameObject'
import { vector2Add, vector2Minus, vector2Multiply } from '../math'
import { LayoutFitContent } from './layout'

export default class AbsoluteLayout implements ILayout {
  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  layout(): [number, number] {
    if (
      this._root.configWidth === LayoutFitContent ||
      this._root.configHeight === LayoutFitContent
    ) {
      throw new Error('AbsoluteLayout的宽高必须定长')
    }

    const [maxMeasureWidth, maxMeasureHeight] = this._root.children.reduce(
      ([maxChildWidth, maxChildHeight], child) => {
        const [childWidth, childHeight] = child.layout()

        ;[child.localX, child.localY] = vector2Add(
          vector2Minus(
            vector2Multiply(
              [this._root.measureWidth, this._root.measureHeight],
              child.anchorPoint
            ),
            vector2Multiply([childWidth, childHeight], child.pivot)
          ),
          [child.localX, child.localY]
        )

        return [
          Math.max(child.localX + childWidth, maxChildWidth),
          Math.max(child.localY + childHeight, maxChildHeight),
        ]
      },
      [0, 0]
    )
    return [maxMeasureWidth, maxMeasureHeight]
  }
}
