import CanvasRenderer from './canvasRenderer'
import Resources from './resource'
import Time from './time'

class Engine {
  renderer: IRenderer
  resource: IResource
  time: Time

  constructor(renderer: IRenderer, resources: IResource, time: Time) {
    this.renderer = renderer
    this.resource = resources
    this.time = time
  }

  init() {
    this.time.init()
  }

  run() {
    this.init()
    requestAnimationFrame(() => this.tick())
  }

  tick() {
    this.time.tick()
    requestAnimationFrame(() => this.tick())
  }
}

export const createDefaultEngine = (
  renderer: IRenderer = new CanvasRenderer('core'),
  resources: IResource = new Resources(),
  time: Time = new Time()
) => {
  return new Engine(renderer, resources, time)
}

export default Engine
