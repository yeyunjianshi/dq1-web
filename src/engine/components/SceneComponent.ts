import { InnerGameComponent } from '.'
import MapChest from '../../gameplay/inventory/MapChest'
import Component from '../component'
import {
  GlobalSceneComponentMarker,
  GlobalTeamControllerMarker,
} from '../engine'
import { vector2Include } from '../math'
import Collider, { ColliderLayerType } from './Collider'
import { EventTriggerWhen, QuestEvent } from './events/QuestEvent'
import {
  SceneTransition,
  SceneTransitionDestination,
} from './events/Transition'
import TeamControllerComponent from './TeamControllerComponent'

@InnerGameComponent
export default class SceneComponent extends Component {
  private _transitions: SceneTransition[] = []
  private _transitionDestinations: SceneTransitionDestination[] = []
  private _questEvents: QuestEvent[] = []
  private _mapChests: MapChest[] = []
  private _colliders: Collider[] = []

  awake(): void {
    this.engine.setVariable(GlobalSceneComponentMarker, this)

    this._transitions = this.root.getComponentsInChildren(
      SceneTransition
    ) as SceneTransition[]
    this._transitionDestinations = this.root.getComponentsInChildren(
      SceneTransitionDestination
    ) as SceneTransitionDestination[]
    this._questEvents = this.root.getComponentsInChildren(
      QuestEvent
    ) as QuestEvent[]
    this._mapChests = this.root.getComponentsInChildren(MapChest) as MapChest[]
    this._colliders = this.root.getComponentsInChildren(Collider) as Collider[]
  }

  triggerTransition(position: Vector2): SceneTransition | undefined {
    return this._transitions.find((t) => {
      return vector2Include(position, t.root.boundingBox)
    })
  }

  triggerInteractive(
    position: Vector2,
    when: EventTriggerWhen
  ): Interaction | undefined {
    const interaction = this.triggerMapChest(position)
    if (interaction) return interaction
    return this.triggerQuestEvent(position, when)
  }

  triggerQuestEvent(position: Vector2, when: EventTriggerWhen) {
    return this._questEvents.find((event) => {
      return (
        event.canTrigger(when) &&
        vector2Include(position, event.root.boundingBox)
      )
    })
  }

  triggerMapChest(position: Vector2) {
    return this._mapChests.find((mapChest) => {
      return (
        mapChest.canTrigger() &&
        vector2Include(position, mapChest.root.boundingBox)
      )
    })
  }

  collider(position: Vector2, layer: ColliderLayerType) {
    const teamController = this.engine.getVariable(
      GlobalTeamControllerMarker
    ) as TeamControllerComponent

    return (
      teamController.collider(position, layer) ||
      this._colliders.some(
        (c) => c.root.active && c.active && c.collider(position, layer)
      )
    )
  }
}
