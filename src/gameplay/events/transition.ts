import { Audios } from '../audio/AudioConfig'
import Component from '../../engine/component'
import { GameplayComponent } from '../../engine/components'
import Engine, { GlobalTeamControllerMarker } from '../../engine/engine'
import { Direction, parseDirection } from '../../engine/input'
import { AssetLoader } from '../../engine/resource'
import { SceneLoadType } from '../../engine/sceneManager'
import { nextFrame } from '../../engine/time'
import { globalGameData, InputType } from '../asset/gameData'
import TeamControllerComponent from '../core/TeamControllerComponent'
import { EventTriggerWhen, QuestEvent } from './QuestEvent'
import {
  fading,
  refreshAndTriggerAutoEvent,
  setInputType,
} from './EventExector'

export const DefaultTransitionTime = 1000

export async function transitionToSceneByTransition(
  transition: SceneTransition
) {
  // 触发出口事件
  const exitEvent = (
    transition.root.getComponents(QuestEvent) as QuestEvent[]
  ).find((event) => event.canTrigger(EventTriggerWhen.InteractiveExit))
  if (exitEvent) await exitEvent.interactive()

  transitionToScene(
    transition.root.engine,
    transition.nextScene,
    transition.tag
  )
}

export async function transitionToScene(
  engine: Engine,
  nextSceneName: string,
  tag?:
    | string
    | {
        worldPosition: Vector2
        direction: Direction
        isPremutation: boolean
      }
) {
  const sceneManager = engine.sceneManager
  let nextScene = sceneManager.currentScene
  let isSameScene = true

  const previousInputType = setInputType(InputType.Transition)
  if (sceneManager.currentScene.name ?? '__$$$$__' !== nextSceneName) {
    await fading({ duration: DefaultTransitionTime, type: 'in' })
    nextScene = sceneManager.loadScene(nextSceneName, SceneLoadType.Replace)
    isSameScene = false
    while (engine.sceneManager.loading) {
      await nextFrame()
    }
  }

  globalGameData.reinitWhenChangeScene(!isSameScene)

  const teamController = engine.getVariable<TeamControllerComponent>(
    GlobalTeamControllerMarker
  )
  if (!tag) {
    await fading({ duration: DefaultTransitionTime, type: 'out' })
    setInputType(previousInputType)
  } else if (typeof tag === 'string') {
    const destination = nextScene!.rootObject
      .getComponentsInChildren(SceneTransitionDestination)
      .find((com) => {
        return (com as SceneTransitionDestination).tag === tag
      })

    if (!destination)
      throw new Error(
        `Transition to next scene error: not find ${nextSceneName}-${tag}`
      )
    const moveDestination = destination as SceneTransitionDestination
    teamController.moveTo(
      moveDestination.worldPosition,
      moveDestination.direciton,
      moveDestination.isPremutation
    )

    await fading({ duration: DefaultTransitionTime, type: 'out' })
    setInputType(previousInputType)
    // 触发入口事件
    const enterEvent = (
      moveDestination.root.getComponents(QuestEvent) as QuestEvent[]
    ).find((event) => event.canTrigger(EventTriggerWhen.InteractiveEnter))
    if (enterEvent) await enterEvent.interactive()
  } else {
    teamController.moveTo(tag.worldPosition, tag.direction, tag.isPremutation)

    await fading({ duration: DefaultTransitionTime, type: 'out' })
    setInputType(previousInputType)
  }
  refreshAndTriggerAutoEvent()
}

type SceneTransitionData = {
  type: string
  tag: string
  nextScene: string
  playAudio?: boolean
}

@GameplayComponent
export class SceneTransition extends Component {
  tag = 'A'
  nextScene = 'A'
  playAudio = true

  transitionTo() {
    if (this.playAudio) this.engine.audios.playME(Audios.Stairs)

    transitionToSceneByTransition(this)
  }

  parseData(_: AssetLoader, data: SceneTransitionData): void {
    this.tag = data.tag
    this.nextScene = data.nextScene
    this.playAudio = data.playAudio ?? true
  }
}

type SceneTransitionDestinationData = {
  type: string
  tag: string
  direction?: Direction
  isPremutation?: boolean
}

@GameplayComponent
export class SceneTransitionDestination extends Component {
  tag = 'A'
  direciton: Direction = Direction.down
  isPremutation = false

  parseData(_: AssetLoader, data: SceneTransitionDestinationData) {
    this.tag = data.tag
    this.direciton = parseDirection(data.direction ?? this.direciton)
    this.isPremutation =
      typeof data.isPremutation === 'boolean'
        ? data.isPremutation
        : this.isPremutation
  }
}
