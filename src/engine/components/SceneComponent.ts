import { InnerGameComponent } from '.'
import MapChest from '../../gameplay/map/MapChest'
import Component from '../component'
import {
  GlobalSceneComponentMarker,
  GlobalTeamControllerMarker,
} from '../engine'
import { HasType, vector2Include } from '../math'
import { AssetLoader } from '../resource'
import Collider, { ColliderLayerType } from './Collider'
import { EventTriggerWhen, QuestEvent } from './events/QuestEvent'
import {
  SceneTransition,
  SceneTransitionDestination,
} from './events/Transition'
import TeamControllerComponent from './TeamControllerComponent'

type SceneComponentData = {
  type: string
  mapData: string
}

type MapData = {
  data: number[]
  width: number
  height: number
}

enum TileMapType {
  None = 0b00,
  Collider = 0b01,
}

@InnerGameComponent
export default class SceneComponent extends Component {
  private _transitions: SceneTransition[] = []
  private _transitionDestinations: SceneTransitionDestination[] = []
  private _questEvents: QuestEvent[] = []
  private _mapChests: MapChest[] = []
  private _colliders: Collider[] = []
  private _mapData: { name?: string; data?: MapData } = {}

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

  collider(coord: Vector2, position: Vector2, layer: ColliderLayerType) {
    if (this.colliderMapBlock(coord)) return true

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

  colliderMapBlock(coord: Vector2) {
    if (!this._mapData.name) return false
    if (!this._mapData.data) return true

    return (
      coord[0] >= this._mapData.data.width ||
      coord[1] >= this._mapData.data.height ||
      (coord[0] < 0 && coord[1] < 0) ||
      HasType(
        this._mapData.data.data[coord[0] + coord[1] * this._mapData.data.width],
        TileMapType.Collider
      )
    )
  }

  parseData(assetLoader: AssetLoader, data: SceneComponentData): void {
    const mapDataAsset = this.resource
      .loadJson<MapData>(data.mapData)
      .then((mapData) => {
        this._mapData.name = data.mapData
        this._mapData.data = mapData
      })
    assetLoader.addAssets(mapDataAsset)
  }
}
