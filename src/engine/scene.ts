import Engine from './engine'
import GameObject from './gameObject'

export default class implements LifeCycle {
  name = ''
  rootObject: GameObject
  active = true
  loaded = false
  engine: Engine

  constructor(name = '', rootObject: GameObject, engine: Engine) {
    this.name = name
    this.rootObject = rootObject
    this.engine = engine
  }

  start() {
    if (this.rootObject.width < 0)
      this.rootObject.width = this.engine.renderer.width
    if (this.rootObject.height < 0)
      this.rootObject.height = this.engine.renderer.height

    this.rootObject.layout()
    this.rootObject.start()
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
