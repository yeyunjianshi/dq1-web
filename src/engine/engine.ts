import CanvasRenderer from './canvasRenderer'
import Resources, { AssetLoader } from './resource'
import Time from './time'
import innerContainer from './components'
import './components/config'
import Input from './input'

class Engine {
  renderer: IRenderer
  resource: IResource
  time: Time
  input: Input
  componentContainer: Map<string, ComponentConstruct>

  constructor(
    renderer: IRenderer,
    resources: IResource,
    time: Time,
    input: Input,
    componentContainer: Map<string, ComponentConstruct>
  ) {
    this.renderer = renderer
    this.resource = resources
    this.time = time
    this.input = input
    this.componentContainer = new Map<string, ComponentConstruct>([
      ...innerContainer,
      ...componentContainer,
    ])
  }

  init() {
    this.time.init()
    this.input.init()
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

export function createDefaultEngine(
  renderer: IRenderer = new CanvasRenderer('core'),
  resources: IResource = new Resources(),
  time: Time = new Time(),
  input: Input = new Input(time),
  componentContainer: Map<string, ComponentConstruct> = new Map<
    string,
    ComponentConstruct
  >()
) {
  return new Engine(renderer, resources, time, input, componentContainer)
}

export default Engine
