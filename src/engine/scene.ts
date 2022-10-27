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
