import { GameplayComponent } from '../../engine/components'
import { talk } from '../../engine/components/events/EventExector'
import {
  QuestEvent,
  IntercativeMarker,
} from '../../engine/components/events/QuestEvent'
import { TalkGetAll } from '../asset/gameData'

@GameplayComponent
export default class TalkQuestEvent extends QuestEvent {
  interactive(): void {
    this.root.events.emit(IntercativeMarker)
    this.talk()
  }

  private async talk() {
    const talks = TalkGetAll(this.questId)
    const judge = true
    for (const t of talks) {
      if (!judge && !t.key.startsWith(`${this.questId}_N`)) continue

      const select = t.text.indexOf('--select--')
      // if (select > 0) {
      // }
      await talk(t.name, t.text.replaceAll('\\n', '\n'))
    }
  }
}
