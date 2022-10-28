import GameObject from '../gameObject'
import { measureLocalPositionByGravity } from './layout'

export default class GridLayout implements ILayout {
  private _root: GameObject
  cell: [number, number]
  row: number
  col: number
  spacing: [number, number]
  gravities: [LayoutGravity, LayoutGravity]
  template: GameObject | undefined

  constructor(
    root: GameObject,
    config: GridLayoutConfig,
    template?: GameObject
  ) {
    this._root = root
    this.cell = config.cell
    this.row = config.row
    this.col = config.col
    this.spacing = config.spacing ?? [0, 0]
    this.gravities = config.gravities
  }

  layout(): [number, number] {
    const cellContentWidth = this.cell[0]
    const cellContentHeight = this.cell[1]
    const spacingWidth = this.spacing[0]
    const spacingHeight = this.spacing[1]
    const cellWidth = cellContentWidth + spacingWidth
    const cellHeight = cellContentHeight + spacingHeight

    const children = this._root.children
    let index = 0
    for (let row = 0; row < this.row; row++) {
      for (let col = 0; col < this.col; col++) {
        const x = col * cellWidth
        const y = row * cellHeight
        if (children.length > index) {
          const child = children[index]
          const [measureChildWidth, measureChildHeight] = child.layout()
          child.localX =
            x +
            measureLocalPositionByGravity(
              this.gravities[0],
              cellContentWidth,
              measureChildWidth
            )
          child.localY =
            y +
            measureLocalPositionByGravity(
              this.gravities[1],
              cellContentHeight,
              measureChildHeight
            )
        } else if (this.template != null) {
          // todo
        }
        index++
      }
    }

    return [
      this.col * cellWidth - spacingWidth,
      this.row * cellHeight - spacingHeight,
    ]
  }
}
