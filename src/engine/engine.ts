import CanvasRenderer from './canvasRenderer'
import Resources, { AssetLoader } from './resource'
import Time from './time'
import innerContainer from './components'
import './components/config'
import Input from './input'
import Camera from './camera'

class Engine {
  renderer: IRenderer
  resource: IResource
  time: Time
  input: Input
  camera: Camera
  componentContainer: Map<string, ComponentConstruct>

  constructor(
    renderer: IRenderer,
    resources: IResource,
    time: Time,
    input: Input,
    camera: Camera,
    componentContainer: Map<string, ComponentConstruct>
  ) {
    this.renderer = renderer
    this.resource = resources
    this.time = time
    this.input = input
    this.camera = camera
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

type EngineConfig = {
  renderer?: IRenderer
  resources?: IResource
  time?: Time
  input?: Input
  camera?: Camera
  componentContainer?: Map<string, ComponentConstruct>
}

export function createEngine(config: EngineConfig | undefined = {}) {
  const renderer = config.renderer ?? new CanvasRenderer('core')
  const resources = config.resources ?? new Resources()
  const time = config.time ?? new Time()
  const input = config.input ?? new Input(time)
  const camera = config.camera ?? new Camera(renderer.width, renderer.height)
  const componentContainer =
    config.componentContainer ?? new Map<string, ComponentConstruct>()

  return new Engine(
    renderer,
    resources,
    time,
    input,
    camera,
    componentContainer
  )
}

export default Engine
