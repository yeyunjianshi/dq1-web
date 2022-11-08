import { InnerGameComponent } from '.'
import Component from '../component'
import { GlobalSceneComponent } from '../engine'
import { vector2Include } from '../math'
import { EventTriggerWhen, QuestEvent } from './events/QuestEvent'
import {
  SceneTransition,
  SceneTransitionDestination,
} from './events/Transition'

@InnerGameComponent
export default class SceneComponent extends Component {
  private _transitions: SceneTransition[] = []
  private _transitionDestinations: SceneTransitionDestination[] = []
  private _questEvents: QuestEvent[] = []

  awake(): void {
    this.engine.setVariable(GlobalSceneComponent, this)

    this._transitions = this.root.getComponentsInChildren(
      SceneTransition
    ) as SceneTransition[]
    this._transitionDestinations = this.root.getComponentsInChildren(
      SceneTransitionDestination
    ) as SceneTransitionDestination[]
    this._questEvents = this.root.getComponentsInChildren(
      QuestEvent
    ) as QuestEvent[]
  }

  triggerTransition(position: Vector2): SceneTransition | undefined {
    return this._transitions.find((t) => {
      return vector2Include(position, t.root.boundingBox)
    })
  }

  triggerQuestEvent(position: Vector2, when: EventTriggerWhen) {
    return this._questEvents.find((event) => {
      return (
        vector2Include(position, event.root.boundingBox) && event.when === when
      )
    })
  }
}
