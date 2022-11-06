import Engine from './engine'
import GameObject from './gameObject'
import { LayoutFitContent, LayoutMatchParent } from './layout/layout'

export default class implements LifeCycle {
  name = ''
  rootObject: GameObject
  active = true
  loaded = false
  engine: Engine
  width = -1
  height = -1
  isSetCamera = true
  bgm?: string
  isAsync = false

  constructor(name = '', rootObject: GameObject, engine: Engine) {
    this.name = name
    this.rootObject = rootObject
    this.engine = engine
  }

  show() {
    if (this.isSetCamera) {
      this.engine.camera.sceneWidth =
        this.width === -1 ? this.engine.renderer.width : this.width
      this.engine.camera.sceneHeight =
        this.height === -1 ? this.engine.renderer.height : this.height
    }
    this.active = true
  }

  hide() {
    this.active = false
  }

  start() {
    this.rootObject.measureWidth =
      this.rootObject.configWidth === LayoutMatchParent
        ? this.width
        : this.rootObject.configWidth === LayoutFitContent
        ? this.engine.renderer.width
        : this.rootObject.configWidth

    this.rootObject.measureHeight =
      this.rootObject.configHeight === LayoutMatchParent
        ? this.height
        : this.rootObject.configHeight === LayoutFitContent
        ? this.engine.renderer.height
        : this.rootObject.configHeight

    this.rootObject.layout()
    this.rootObject.start()

    // play bgm
    this.engine.audios.playBGM(this.bgm)
  }

  tick() {
    if (this.active) {
      this.update()
      this.render()
    }
  }

  update() {
    this.rootObject.update()
  }

  render() {
    this.rootObject.render()
  }
}
