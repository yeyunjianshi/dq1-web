import { GlobalWindowMarker } from '@engine/engine'
import { getEventEngine } from '@gameplay/events/EventExector'
import { transitionToScene } from '@gameplay/events/Transition'
import GlobalWindowComponent from '@gameplay/menu/GlobalWindowComponent'
import {
  Buffer,
  Command,
  CommandTriggerType,
  CommandTriggerWhen,
} from './buffer'

export default class BackHomeEffect
  implements Command, Cloneable<BackHomeEffect>
{
  owner = 0
  turns = 0
  turnsDownEveryTurn?: (() => string) | undefined

  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (when === CommandTriggerWhen.Common && type === CommandTriggerType.Use) {
      const engine = getEventEngine()!
      const globalWindow =
        engine.getVariable<GlobalWindowComponent>(GlobalWindowMarker)
      globalWindow.clearWindows()
      transitionToScene(getEventEngine()!, 'World', 'TantegelCastle')
    }
    return ''
  }

  clone(): Buffer {
    return new BackHomeEffect()
  }
}
