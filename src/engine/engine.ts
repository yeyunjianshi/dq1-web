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

export function createDefaultEngine(
  renderer: IRenderer = new CanvasRenderer('core'),
  resources: IResource = new Resources(),
  time: Time = new Time(),
  input: Input = new Input(time),
  camera: Camera = new Camera(renderer.width, renderer.height),
  componentContainer: Map<string, ComponentConstruct> = new Map<
    string,
    ComponentConstruct
  >()
) {
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
