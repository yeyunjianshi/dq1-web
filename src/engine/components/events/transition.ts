import { InnerGameComponent } from '..'
import { globalGameData } from '../../../gameplay/asset/gameData'
import Component from '../../component'
import Engine, { GlobalTeamControllerMarker } from '../../engine'
import { Direction } from '../../input'
import { AssetLoader } from '../../resource'
import { SceneLoadType } from '../../sceneManager'
import { nextFrame } from '../../time'
import TeamControllerComponent from '../TeamControllerComponent'

type SceneTransitionData = {
  type: string
  tag: string
  nextScene: string
}

async function transitionToScene(
  engine: Engine,
  nextSceneName: string,
  tag: string
) {
  const sceneManager = engine.sceneManager
  let nextScene = sceneManager.currentScene
  let isSameScene = true

  if (sceneManager.currentScene.name ?? '__$$$$__' !== nextSceneName) {
    nextScene = sceneManager.loadScene(nextSceneName, SceneLoadType.Replace)
    isSameScene = false
    while (engine.sceneManager.loading) {
      await nextFrame()
    }
  }
  const destination = nextScene!.rootObject
    .getComponentsInChildren(SceneTransitionDestination)
    .find((com) => {
      return (com as SceneTransitionDestination).tag === tag
    })
  if (!destination)
    throw new Error(
      `Transition to next scene error: not find ${nextSceneName}-${tag}`
    )

  globalGameData.reinitWhenChangeScene(!isSameScene)

  const moveDestination = destination as SceneTransitionDestination
  const teamController = engine.getVariable<TeamControllerComponent>(
    GlobalTeamControllerMarker
  )
  teamController.moveTo(
    moveDestination.worldPosition,
    moveDestination.direciton,
    moveDestination.isPremutation
  )
}

@InnerGameComponent
export class SceneTransition extends Component {
  tag = 'A'
  nextScene = 'A'

  transitionTo() {
    transitionToScene(this.root.engine, this.nextScene, this.tag)
  }

  parseData(_: AssetLoader, data: SceneTransitionData): void {
    this.tag = data.tag
    this.nextScene = data.nextScene
  }
}

type SceneTransitionDestinationData = {
  type: string
  tag: string
  direction?: Direction
  isPremutation?: boolean
}

@InnerGameComponent
export class SceneTransitionDestination extends Component {
  tag = 'A'
  direciton: Direction = Direction.down
  isPremutation = false

  parseData(_: AssetLoader, data: SceneTransitionDestinationData) {
    this.tag = data.tag
    this.direciton =
      data.direction === undefined ? this.direciton : data.direction
    this.isPremutation =
      typeof data.isPremutation === 'boolean'
        ? data.isPremutation
        : this.isPremutation
  }
}
