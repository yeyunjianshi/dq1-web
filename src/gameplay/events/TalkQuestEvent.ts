import { GameplayComponent } from '../../engine/components'
import {
  EventExecuteEndMarker,
  EventExecuteStartMarker,
  ExecuteCommands,
  talk,
} from './EventExector'
import NPCQuestEvent from './NPCQuestEvent'
import { EventTriggerWhen } from './QuestEvent'

@GameplayComponent
export default class TalkQuestEvent extends NPCQuestEvent {
  when = EventTriggerWhen.InteractiveConfirm

  async interactive() {
    await this.talk()
  }

  awake(): void {
    super.awake()
  }

  private async talk() {
    console.log(`===== talk event ${this.questId} execute start =====`)
    this.root.events.emit({
      marker: EventExecuteStartMarker,
      questId: this.questId,
    })
    const talks = this.getTalks(this.questId)
    let select = true

    for (const t of talks) {
      if (
        (select && t.key.startsWith(`${this.questId}_N`)) ||
        (!select && !t.key.startsWith(`${this.questId}_N`))
      )
        continue

      let text = t.value
      if (text.startsWith('[script]')) {
        const commands = text.slice('[script]'.length)
        await ExecuteCommands(this, commands)
      } else {
        const isSelectTalk = t.value.indexOf('[select]') >= 0
        if (isSelectTalk) {
          text = t.value.slice('[select]'.length)
          select = await talk(t.infos?.talk ?? '*', text, false, true)
        } else {
          await talk(t.infos?.talk ?? '*', text, false, false)
        }
      }
    }
    this.root.events.emit({
      marker: EventExecuteEndMarker,
      questId: this.questId,
    })
    console.log(`===== talk event ${this.questId} execute end =====`)
  }

  private getTalks(id: string) {
    if (id.length === 0) return []
    return this.engine.i18n.getEntries(
      (v) => v.key === id || v.key.startsWith(`${id}_`)
    )
  }
}
