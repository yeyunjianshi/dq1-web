import Component from './component'
import Engine from './engine'
import AbsoluteLayout from './layout/AbsoluteLayout'
import { LayoutMatchParent, LayoutFitContent } from './layout/layout'
import { supportSpriteExt } from './resource'

class GameObject implements LifeCycle {
  private _localX = 0
  private _localY = 0
  worldX = 0
  worldY = 0
  measureWidth = 0
  measureHeight = 0
  width = 0
  height = 0
  /**
   * 渲染的宽高
   * -1 代表与子元素的宽高相同
   * -2 代表与父元素的宽高相同
   * -3 无限大，内部使用
   **/
  configWidth = -1
  configHeight = -1
  configLayout: ILayout
  active = true
  name = ''
  children: GameObject[] = []
  components: Component[] = []
  background: Background
  alpha = 1
  animtations: Animation[] = []
  parent: GameObject
  engine: Engine
  static = false

  constructor(
    parent: GameObject | null,
    name = 'component',
    layout: ILayout | null = null,
    engine: Engine | null = null
  ) {
    this.name = name

    if (!parent) {
      if (!engine) throw new Error(`${name}中的engine字段不能为空`)
      this.parent = this
      this.engine = engine
    } else {
      this.parent = parent
      this.engine = this.parent.engine
    }

    this.background = {
      name: '',
      sprite: undefined,
      scaleType: 'original',
      color: 'transparent',
      border: {
        width: 0,
        color: 'white',
        radius: 4,
      },
      pivotOffset: [0, 0],
      alpha: 1,
    }
    this.configLayout = layout ?? new AbsoluteLayout(this)
  }

  layout(): [number, number] {
    this.measureWidth =
      this.configWidth === LayoutMatchParent
        ? this.parent.width
        : Math.max(0, this.configWidth)

    this.measureHeight =
      this.configHeight === LayoutMatchParent
        ? this.parent.height
        : Math.max(0, this.configHeight)

    const [measureChildWidth, measureChildHeight] = this.layoutChildren()
    if (this.configWidth === LayoutFitContent)
      this.measureWidth = measureChildWidth
    if (this.configHeight === LayoutFitContent)
      this.measureHeight = measureChildHeight

    return [this.measureWidth, this.measureHeight]
  }

  layoutChildren(): [number, number] {
    if (this.children.length === 0) return [0, 0]
    return this.configLayout.layout()
  }

  start() {
    this.components?.forEach((com) => com.start && com.start())
    this.children?.forEach((child) => child.start && child.start())
  }

  updateChildrens() {
    this.children.forEach((child) => {
      child.worldX = this.worldX + child.localX
      child.worldY = this.worldY + child.localY

      if (child.update) child.update()
    })
  }

  updateComponents() {
    this.components.forEach((com) => {
      if (com.active && com.update) {
        com.update()
      }
    })
  }

  renderBackground() {
    if (!this.background.sprite) {
      if (supportSpriteExt(this.background.name)) {
        this.background.sprite = this.engine.resource.getSprite(
          this.background.name
        )
      }
    }
    if (this.background.sprite) {
      const sourceWidth =
        this.background.scaleType === 'fit'
          ? this.background.sprite.naturalWidth
          : this.measureWidth

      const sourceHeight =
        this.background.scaleType === 'fit'
          ? this.background.sprite.naturalHeight
          : this.measureHeight

      this.engine.renderer.drawSprite(
        this.background.sprite,
        this.background.alpha,
        this.background.pivotOffset[0],
        this.background.pivotOffset[1],
        sourceWidth,
        sourceHeight,
        this.worldX,
        this.worldY,
        this.measureWidth,
        this.measureHeight
      )
    }

    this.engine.renderer.drawRectColorAndBorder(
      this.worldX,
      this.worldY,
      this.measureWidth,
      this.measureHeight,
      this.background.color,
      this.background.border,
      this.background.alpha
    )
  }

  renderComponents() {
    this.components.forEach((com) => {
      if (com.active && com.render) {
        com.render()
      }
    })
  }

  renderChildrens() {
    this.children.forEach((child) => {
      if (child.render) child.render()
    })
  }

  update() {
    if (this.active) {
      this.updateComponents()
      this.updateChildrens()
    }
  }

  render() {
    if (this.active) {
      this.renderBackground()
      this.renderComponents()
      this.renderChildrens()
    }
  }

  set localX(val: number) {
    this._localX = val
    if (this.parent === this) this.worldX = val
  }

  get localX(): number {
    return this._localX
  }

  set localY(val: number) {
    this._localY = val
    if (this.parent === this) this.worldY = val
  }

  get localY(): number {
    return this._localY
  }
}

export default GameObject
