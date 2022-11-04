import Scene from './scene'

export enum SceneLoadType {
  Replace,
  Addon,
}

export default class SceneManger {
  currentScene?: Scene

  gameScenes: Map<string, Scene> = new Map<string, Scene>()

  loadScene() {}
}
