import { GameplayComponent } from '../../engine/components'
import { NPCControllerComponent } from '../core/NPCControllerComponent'
import { EventTriggerWhen, QuestEvent } from './QuestEvent'

@GameplayComponent
export default class NPCQuestEvent extends QuestEvent {
  canTrigger(when: EventTriggerWhen): boolean {
    const NPCComponent = this.root.getComponent(
      NPCControllerComponent
    ) as NPCControllerComponent
    return (
      super.canTrigger(when) &&
      ((NPCComponent && !NPCComponent.isMoving) || !NPCComponent)
    )
  }
}
