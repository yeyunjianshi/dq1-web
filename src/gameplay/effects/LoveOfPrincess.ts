import { AssetLoader } from '@engine/resource'
import { currentScene } from '@gameplay/events/EventExector'
import { QuestEvent } from '@gameplay/events/QuestEvent'
import { Command, CommandTriggerType, CommandTriggerWhen } from './buffer'

export default class LoveOfPrincess
  implements Command, Cloneable<LoveOfPrincess>
{
  execute(when: CommandTriggerWhen, type: CommandTriggerType) {
    if (when === CommandTriggerWhen.Common && type === CommandTriggerType.Use) {
      const questEvent = new QuestEvent(currentScene().rootObject)
      questEvent.parseData(new AssetLoader(), {
        type: 'QuestEvent',
        eventId: 'Q50',
        predecessorId: [],
        predecessorItem: [],
      })
      questEvent.interactive()
    }
    return ''
  }

  clone() {
    return new LoveOfPrincess()
  }
}
