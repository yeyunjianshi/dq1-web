import { GlobalWindowMarker } from '@engine/engine'
import { globalGameData } from '@gameplay/asset/gameData'
import { currentScene, getEventEngine } from '@gameplay/events/EventExector'
import { transitionToScene } from '@gameplay/events/Transition'
import GlobalWindowComponent from '@gameplay/menu/GlobalWindowComponent'
import {
  Buffer,
  Command,
  CommandTriggerType,
  CommandTriggerWhen,
} from './buffer'

export default class GoToEntraceEffect
  implements Command, Cloneable<GoToEntraceEffect>
{
  owner = 0
  turns = 0
  turnsDownEveryTurn?: (() => string) | undefined

  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (when === CommandTriggerWhen.Common && type === CommandTriggerType.Use) {
      if (currentScene().isCave && globalGameData.entraceTag) {
        const engine = getEventEngine()!
        const globalWindow =
          engine.getVariable<GlobalWindowComponent>(GlobalWindowMarker)
        globalWindow.clearWindows()
        transitionToScene(getEventEngine()!, 'World', globalGameData.entraceTag)
      } else {
        return '该魔法使用失败。\n只有在洞窟中才能使用，回到出口处。'
      }
    }
    return ''
  }

  clone(): Buffer {
    return new GoToEntraceEffect()
  }
}
