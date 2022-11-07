import Engine from './engine'
import GameObject from './gameObject'
import { LayoutFitContent, LayoutMatchParent } from './layout/layout'
import { SceneLoadType } from './sceneManager'

export default class implements LifeCycle {
  name = ''
  rootObject: GameObject
  active = true
  enable = true
  loaded = false
  engine: Engine
  width = -1
  height = -1
  isSetCamera = true
  bgm?: string
  isAsync = false
  priority = 10
  loadType: SceneLoadType = SceneLoadType.Replace

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
      this.engine.camera.refresh()
    }
    this.active = true
  }

  hide() {
    this.active = false
  }

  awake() {
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
    this.rootObject.awake()

    // play bgm
    this.engine.audios.playBGM(this.bgm)
  }

  start() {
    this.rootObject.start()
  }

  tick() {
    if (this.loaded && this.active) {
      if (this.enable) this.update()
      this.render()
    }
  }

  update() {
    if (this.loaded && this.active && this.enable) {
      this.rootObject.update()
    }
  }

  render() {
    if (this.loaded && this.active) this.rootObject.render()
  }
}
