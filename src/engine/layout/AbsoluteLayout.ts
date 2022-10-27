import GameObject from '../gameObject'

export default class AbsoluteLayout implements ILayout {
  private _root: GameObject

  constructor(root: GameObject) {
    this._root = root
  }

  layout(): [number, number] {
    const [maxMeasureWidth, maxMeasureHeight] = this._root.children.reduce(
      ([maxChildWidth, maxChildHeight], child) => {
        const [childWidth, childHeight] = child.layout()
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
