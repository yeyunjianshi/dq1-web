import CanvasRenderer from './canvasRenderer'
import Resources from './resource'
import Time from './time'
import innerContainer from './components'
import './components/config'
import Input from './input'
import Camera from './camera'
import AudioManager from './audio'
import SceneManger from './sceneManager'

export const GlobalTeamControllerMarker = '$TeamController'
export const GlobalSceneComponentMarker = '$GlobalSceneComponent'
export const GlobalWindowMarker = '$GlobalWindow'

class Engine {
  renderer: IRenderer
  resource: IResource
  time: Time
  input: Input
  camera: Camera
  audios: AudioManager
  sceneManager: SceneManger
  componentContainer: Map<string, ComponentConstruct>
  private _globalVariables: Map<string, any> = new Map<string, any>()

  constructor(
    renderer: IRenderer,
    resources: IResource,
    audios: AudioManager,
    time: Time,
    input: Input,
    camera: Camera,
    componentContainer: Map<string, ComponentConstruct>
  ) {
    this.renderer = renderer
    this.resource = resources
    this.audios = audios
    this.time = time
    this.input = input
    this.camera = camera
    this.sceneManager = new SceneManger(this)
    this.componentContainer = new Map<string, ComponentConstruct>([
      ...innerContainer,
      ...componentContainer,
    ])
  }

  init() {
    this.time.init()
    this.input.init()
    this.sceneManager.init()
  }

  run() {
    this.init()
    requestAnimationFrame(() => this.tick())
  }

  tick() {
    this.time.tick()
    this.input.tick()
    this.renderer.render(() => {
      this.sceneManager.tick()
    })
    requestAnimationFrame(() => this.tick())
  }

  getVariable<T>(key: string): T {
    const value = this._globalVariables.get(key)
    if (!value) throw new Error(`Engine get variable error: not find ${key}`)
    return value as T
  }

  setVariable(key: string, value: any) {
    this._globalVariables.set(key, value)
  }
}

type EngineConfig = {
  renderer?: IRenderer
  resources?: IResource
  time?: Time
  input?: Input
  camera?: Camera
  componentContainer?: Map<string, ComponentConstruct>
  sceneManager?: SceneManger
  audios?: AudioManager
}

export function createEngine(config: EngineConfig | undefined = {}) {
  const renderer = config.renderer ?? new CanvasRenderer('core')
  const resources = config.resources ?? new Resources()
  const audios = new AudioManager(resources)
  const time = config.time ?? new Time()
  const input = config.input ?? new Input(time)
  const camera = config.camera ?? new Camera(renderer.width, renderer.height)
  const componentContainer =
    config.componentContainer ?? new Map<string, ComponentConstruct>()

  return new Engine(
    renderer,
    resources,
    audios,
    time,
    input,
    camera,
    componentContainer
  )
}

export default Engine
