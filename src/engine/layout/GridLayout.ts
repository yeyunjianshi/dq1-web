import GameObject from '../gameObject'
import { parseGameObject } from '../parser'
import { measureLocalPositionByGravity } from './layout'

export default class GridLayout implements ILayout {
  private _root: GameObject
  cell: [number, number]
  row: number
  col: number
  spacing: [number, number]
  gravity: [LayoutGravity, LayoutGravity]
  template: GameObjectData | undefined

  constructor(
    root: GameObject,
    config: GridLayoutConfig,
    template?: GameObjectData
  ) {
    this._root = root
    this.cell = config.cell
    this.row = config.row
    this.col = config.col
    this.spacing = config.spacing ?? [0, 0]
    this.gravity = config.gravity
    this.template = template
  }

  initTemplate(templateData: GameObjectData) {
    this.template = templateData
    this._root.children = []
    for (let i = 0; i < this.row * this.col; i++)
      this._root.children.push(this.parseTemplate(templateData))
  }

  private parseTemplate(templateData: GameObjectData): GameObject {
    const template = parseGameObject(templateData, this._root)
    if (template.configWidth === -2) template.configWidth = this.cell[0]
    if (template.configHeight === -2) template.configHeight = this.cell[1]
    return template
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

        if (index < children.length) {
          const child = children[index]
          const [measureChildWidth, measureChildHeight] = child.layout()
          child.localX =
            x +
            measureLocalPositionByGravity(
              this.gravity[0],
              cellContentWidth,
              measureChildWidth
            )
          child.localY =
            y +
            measureLocalPositionByGravity(
              this.gravity[1],
              cellContentHeight,
              measureChildHeight
            )
          index++
        }
      }
    }

    return [
      this.col * cellWidth - spacingWidth,
      this.row * cellHeight - spacingHeight,
    ]
  }
}
