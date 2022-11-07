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
  enable = true
  name = ''
  children: GameObject[] = []
  components: Component[] = []
  background: Background
  alpha = 1
  animtations: Animation[] = []
  parent: GameObject
  engine: Engine
  static = false
  pivot: Vector2 = [0, 0]
  layoutGravity: [HorizontalGravity, VerticalGaravity] = ['left', 'top']

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
      spriteWidth: -1,
      spriteHeight: -1,
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
        ? this.parent.measureWidth
        : Math.max(0, this.configWidth)

    this.measureHeight =
      this.configHeight === LayoutMatchParent
        ? this.parent.measureHeight
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

  awake() {
    this.components?.forEach((com) => com.awake && com.awake())
    this.children?.forEach((child) => child.awake && child.awake())
  }

  start() {
    this.components?.forEach((com) => com.start && com.start())
    this.children?.forEach((child) => child.start && child.start())
  }

  update() {
    if (this.active && this.enable) {
      this.updateWorldPosition()
      this.updateComponents()
      this.updateChildrens()
    }
  }

  updateWorldPosition() {
    this.worldX =
      this == this.parent ? this._localX : this.parent.worldX + this.localX
    this.worldY =
      this == this.parent ? this._localY : this.parent.worldY + this.localY
  }

  updateChildrens() {
    this.children.forEach((child) => {
      if (child.active && child.enable && child.update) child.update()
    })
  }

  updateComponents() {
    this.components.forEach((com) => {
      if (com.active && com.enable && com.update) {
        com.update()
      }
    })
  }

  render() {
    if (this.active) {
      this.renderBackground()
      this.renderComponents()
      this.renderChildrens()
    }
  }

  renderBackground() {
    this.engine.renderer.drawRect(
      this.worldX,
      this.worldY,
      this.measureWidth,
      this.measureHeight,
      this.background.color,
      this.background.border?.radius ?? 0,
      this.background.alpha
    )
    if (!this.background.sprite) {
      if (supportSpriteExt(this.background.name)) {
        this.background.sprite = this.engine.resource.getSprite(
          this.background.name
        )
      }
    }
    if (this.background.sprite) {
      const sourceWidth =
        this.background.spriteWidth > 0
          ? this.background.spriteWidth
          : this.background.scaleType === 'fit'
          ? this.background.sprite.naturalWidth
          : this.measureWidth

      const sourceHeight =
        this.background.spriteHeight > 0
          ? this.background.spriteHeight
          : this.background.scaleType === 'fit'
          ? this.background.sprite.naturalHeight
          : this.measureHeight

      const destWidth =
        this.background.scaleType === 'fit'
          ? this.measureWidth
          : this.background.spriteWidth > 0 &&
            this.background.spriteWidth < this.measureWidth
          ? this.background.spriteWidth
          : this.measureWidth

      const destHeight =
        this.background.scaleType === 'fit'
          ? this.measureHeight
          : this.background.spriteHeight > 0 &&
            this.background.spriteHeight < this.measureHeight
          ? this.background.spriteHeight
          : this.measureHeight

      this.engine.renderer.drawSprite(
        this.background.sprite,
        this.background.alpha,
        this.background.pivotOffset[0],
        this.background.pivotOffset[1],
        sourceWidth,
        sourceHeight,
        this.worldX - this.engine.camera.x,
        this.worldY - this.engine.camera.y,
        destWidth,
        destHeight
      )
    }

    this.engine.renderer.drawBorder(
      this.worldX,
      this.worldY,
      this.measureWidth,
      this.measureHeight,
      this.background.border,
      this.background.alpha
    )
  }

  get anchorPoint(): Vector2 {
    return [
      this.layoutGravity[0] === 'right'
        ? 1
        : this.layoutGravity[0] === 'center'
        ? 0.5
        : 0,
      this.layoutGravity[1] === 'bottom'
        ? 1
        : this.layoutGravity[1] === 'center'
        ? 0.5
        : 0,
    ]
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

  getComponentsInChildren<T extends typeof Component>(
    componentConstructor: T
  ): Component[] {
    const ret: Component[] = []

    const queue: GameObject[] = [this]
    while (queue.length > 0) {
      const node = queue.shift() as GameObject
      const components = node.components.filter(
        (child) => child instanceof componentConstructor
      )
      ret.push(...components)
      queue.push(...node.children)
    }

    return ret
  }

  getComponentInChildren<T extends typeof Component>(
    componentConstructor: T
  ): Component | undefined {
    const queue: GameObject[] = [this]
    while (queue.length > 0) {
      const node = queue.shift() as GameObject
      const component = node.components.find(
        (child) => child instanceof componentConstructor
      )
      if (component) return component
      queue.push(...node.children)
    }
    return undefined
  }

  getComponent<T extends typeof Component>(
    componentConstructor: T
  ): Component | undefined {
    return this.components.find(
      (component) => component instanceof componentConstructor
    )
  }

  getComponentInChildByName<T extends typeof Comment>(
    name: string,
    componentConstructor: T
  ) {
    const queue: GameObject[] = [this]
    while (queue.length > 0) {
      const node = queue.shift() as GameObject
      if (node.name === name) {
        const component = node.components.find(
          (child) => child instanceof componentConstructor
        )
        if (component) return component
      }
      queue.push(...node.children)
    }
    return undefined
  }

  set localX(val: number) {
    this._localX = val
    this.updateWorldPosition()
  }

  get localX(): number {
    return this._localX
  }

  set localY(val: number) {
    this._localY = val
    this.updateWorldPosition()
  }

  get localY(): number {
    return this._localY
  }
}

export default GameObject
