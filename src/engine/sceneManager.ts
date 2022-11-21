import Engine from './engine'
import { parseScene } from './parser'
import Scene from './scene'
import DefaultLoadingSceneData from '../data/loading.json'

export enum SceneLoadType {
  Replace = 0,
  Addon,
  Global,
}

const gameScenes = new Map<string, SceneData>([
  ['loading', DefaultLoadingSceneData as unknown as SceneData],
])

export function AddGameSceneData(sceneDatas: SceneData[]) {
  sceneDatas.forEach((data) => {
    gameScenes.set(data.name, data)
  })
}

export function GetGameSceneData(sceneName: string): SceneData {
  const sceneData = gameScenes.get(sceneName)
  if (!sceneData)
    throw new Error(`Load Scene Data Error: Not Found ${sceneName}`)

  return sceneData
}

export default class SceneManger {
  _currentScene?: Scene

  gameScenes: Map<string, Scene> = new Map<string, Scene>()
  loadingScene?: Scene

  _scenes: Scene[] = []
  _renderScenes: Scene[] = []
  _cacheScenes: Scene[] = []
  _loadingScenes: Scene[] = []

  public get loading() {
    return this._loadingScenes.length > 0
  }

  constructor(public engine: Engine) {}

  init() {
    this.loadingScene = parseScene(GetGameSceneData('loading'), this.engine)
  }

  tick() {
    if (this.loading) {
      this._loadingScenes = this._loadingScenes.filter((s) => !s.loaded)
      if (this.loading && this.loadingScene) this.loadingScene.tick()
    }
    if (!this.loading) {
      this._renderScenes.forEach((s) => s.tick())
    }
  }

  loadScene(sceneName: string, loadType?: SceneLoadType): Scene {
    let scene = this._cacheScenes.find((s) => sceneName === s.name)
    if (!scene) {
      const sceneData = GetGameSceneData(sceneName)
      scene = parseScene(sceneData, this.engine)
      this._loadingScenes.push(scene)
    }

    scene.loadType = loadType ?? scene.loadType

    if (scene.loadType === SceneLoadType.Replace) {
      this._currentScene = scene
      this._scenes = this._scenes.filter(
        (s) => s.loadType === SceneLoadType.Global
      )
    }
    this._scenes.push(scene)
    this._renderScenes = [...this._scenes]
    this._renderScenes.sort((a, b) => a.priority - b.priority)
    return scene
  }

  unloadScene(sceneName: string) {
    this._scenes = this._scenes.filter((s) => s.name !== sceneName)
    this._renderScenes = this._renderScenes.filter((s) => s.name !== sceneName)
  }

  get scenes() {
    return this._scenes
  }

  get currentScene() {
    return this._currentScene!
  }

  // popScene() {
  //   if (!this.currentScene || this._scenes.length)
  //     throw new Error(`Pop Scene Error`)

  //   if (this.currentScene.loadType === SceneLoadType.Addon) {
  //     this.currentScene.active = false
  //     this._cacheScenes.push(this.currentScene)
  //   }
  //   this._scenes.pop()

  //   this._renderScenes = [...this._scenes]
  //   this._renderScenes.sort((a, b) => a.priority - b.priority)
  // }
}
