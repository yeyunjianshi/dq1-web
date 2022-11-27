import { GameplayComponent } from '../../engine/components'
import {
  EventExecuteEndMarker,
  EventExecuteStartMarker,
  talk,
} from './EventExector'
import { TalkGetAll } from '../asset/gameData'
import NPCQuestEvent from './NPCQuestEvent'
import { EventTriggerWhen } from './QuestEvent'

@GameplayComponent
export default class TalkQuestEvent extends NPCQuestEvent {
  interactive(): void {
    this.talk()
  }

  awake(): void {
    super.awake()
    this.when = EventTriggerWhen.InteractiveConfirm
  }

  private async talk() {
    this.root.events.emit(EventExecuteStartMarker)
    const talks = TalkGetAll(this.questId)
    let select = true

    for (const t of talks) {
      if (
        (select && t.key.startsWith(`${this.questId}_N`)) ||
        (!select && !t.key.startsWith(`${this.questId}_N`))
      )
        continue

      console.log(t.key)
      const isSelectTalk = t.text.indexOf('[select]') >= 0
      let text = t.text
      if (isSelectTalk) {
        text = t.text.slice('[select]'.length)
        select = await talk(t.name, text.replaceAll('\\n', '\n'), false, true)
        console.log(select)
      } else {
        await talk(t.name, text.replaceAll('\\n', '\n'))
      }
    }
    this.root.events.emit(EventExecuteEndMarker)
  }
}
