import { GameplayComponent } from '../../engine/components'
import {
  ColliderLayerType,
  BoxCollider,
  BoxColliderData,
} from '../../engine/components/Collider'
import MoveComponent, {
  MoveComponentData,
  MoveState,
  DefaultMoveState,
  CoordToPosition,
  PositionToCoord,
  DefalutMoveTileWidth,
  DefaultMoveTileHeight,
} from '../../engine/components/MoveComponent'
import { GlobalTeamControllerMarker } from '../../engine/engine'
import {
  Direction,
  DirectionToCoord,
  getDirectionByCoord,
  oppsiteDirection,
} from '../../engine/input'
import {
  random,
  vector2Add,
  vector2Include,
  vector2Minus,
  range,
  distance,
  lerpVector2,
} from '../../engine/math'
import { AssetLoader } from '../../engine/resource'
import {
  EventExecuteStartMarker,
  EventExecuteEndMarker,
} from '../events/EventExector'
import TeamControllerComponent, {
  checkNextCoordCanMove,
} from './TeamControllerComponent'

type NPCPathType = 'fixed' | 'random'

type NPCFixedPathData = {
  type: NPCPathType
  datas: Vector2[]
  alternate: boolean
}

type NPCRandomPathData = {
  type: NPCPathType
  radius?: number
  centerCoord?: Vector2
  scope?: [Vector2, Vector2]
}

type NPCData = {
  type: string
  moveSpeed?: number
  moveWaitTime?: number | Vector2
  path?: NPCFixedPathData | NPCRandomPathData
  colliderSize?: Vector2
} & MoveComponentData

const DefaultMoveSpeed = 32
const DefaultMoveWaitTime: Vector2 = [2000, 4000]
const DefaultPathData: Required<NPCRandomPathData> = {
  type: 'random',
  centerCoord: [0, 0] as Vector2,
  radius: 2,
  scope: [
    [-2, -2],
    [2, 2],
  ],
}

@GameplayComponent
export class NPCControllerComponent extends MoveComponent {
  moveSpeed = DefaultMoveSpeed
  moveWaitTime = 2000
  configMoveWaitTime: Vector2 = DefaultMoveWaitTime
  path: Required<NPCFixedPathData | NPCRandomPathData> = { ...DefaultPathData }

  isTalking = false
  isMoving = false
  moveState: MoveState & { pathIndex: number; reverse: boolean } = {
    ...DefaultMoveState,
    pathIndex: 0,
    reverse: false,
  }
  private _moveDelta = 0

  start() {
    super.start()

    this.root.events.register(({ marker }) => {
      if (marker === EventExecuteStartMarker) {
        this.talk()
      } else if (marker === EventExecuteEndMarker) {
        this.isTalking = false
      }
    })
  }

  update() {
    if (!this.inited) return
    if (this.moveSpeed > 0 && !this.isTalking) this.move()
    super.update()
  }

  findNextCoord(): [Vector2, Direction] {
    if (this.path.type === 'random') {
      const direction = random(4) as Direction
      const nextCooord = vector2Add(
        this.moveState.targetCoord,
        DirectionToCoord.get(direction) as Vector2
      )
      return vector2Include(
        nextCooord,
        (this.path as NPCRandomPathData).scope as [Vector2, Vector2]
      ) && checkNextCoordCanMove(nextCooord, this.engine, ColliderLayerType.NPC)
        ? [nextCooord, direction]
        : [this.moveState.targetCoord, Direction.none]
    } else {
      const path = this.path as NPCFixedPathData
      if (path.datas.length === 0) return [this.moveState.coord, Direction.none]
      if (path.datas.length === 1) return [path.datas[0], Direction.none]

      if (
        this.moveState.pathIndex === 0 &&
        this.moveState.reverse &&
        path.alternate
      )
        this.moveState.reverse = false
      else if (
        this.moveState.pathIndex === path.datas.length - 1 &&
        !this.moveState.reverse &&
        path.alternate
      )
        this.moveState.reverse = true

      if (this.moveState.reverse) this.moveState.pathIndex--
      else this.moveState.pathIndex++
      this.moveState.pathIndex = this.moveState.pathIndex % path.datas.length

      const nextCoord = path.datas[this.moveState.pathIndex]
      const nextDireciton = getDirectionByCoord(
        vector2Minus(nextCoord, this.moveState.targetCoord)
      )
      if (!checkNextCoordCanMove(nextCoord, this.engine, ColliderLayerType.NPC))
        return [this.moveState.targetCoord, Direction.none]
      return [nextCoord, nextDireciton]
    }
  }

  move() {
    if (!this.isMoving) {
      this._moveDelta += this.time.scaleDeltaTime
      if (this._moveDelta < this.moveWaitTime) return

      this.moveWaitTime = range(this.configMoveWaitTime)
      this._moveDelta = 0

      const [nextCoord, nextDirection] = this.findNextCoord()
      if (nextDirection !== Direction.none) {
        this.moveState.targetCoord = nextCoord
        this.moveState.targetPosition = CoordToPosition(nextCoord)
        this.moveState.direction = nextDirection
        this.direction = nextDirection
        this.refreshAnimationSprite()

        this.isMoving = true
      }
    }

    if (this.isMoving) {
      const moveDistance = distance(
        this.moveState.position,
        this.moveState.targetPosition
      )
      const moveDelta = (this.moveSpeed * this.time.scaleDeltaTime) / 1000

      if (moveDistance <= moveDelta) {
        this.moveState.coord = this.moveState.targetCoord
        this.moveState.position = this.moveState.targetPosition
        this.isMoving = false
      } else {
        this.moveState.position = lerpVector2(
          this.moveState.position,
          this.moveState.targetPosition,
          moveDelta
        )
      }
      this.localPosition = this.moveState.position
    }
  }

  private initMoveState(coord: Vector2) {
    this.moveState.coord = this.moveState.targetCoord = coord
    this.moveState.position = this.moveState.targetPosition = CoordToPosition(
      this.moveState.coord
    )
    this.localPosition = this.moveState.position
  }

  talk() {
    this.isTalking = true

    const teamController = this.engine.getVariable(
      GlobalTeamControllerMarker
    ) as TeamControllerComponent

    this.direction = oppsiteDirection(teamController.headDirection)
    this.refreshAnimationSprite()
  }

  parseData(assetLoader: AssetLoader, data: NPCData): void {
    super.parseData(assetLoader, data)

    this.moveSpeed = data.moveSpeed ?? this.moveSpeed
    this.configMoveWaitTime =
      typeof data.moveWaitTime === 'undefined'
        ? this.configMoveWaitTime
        : typeof data.moveWaitTime === 'number'
        ? [data.moveWaitTime, data.moveWaitTime]
        : data.moveWaitTime
    this.moveWaitTime = range(this.configMoveWaitTime)
    if (data.path) {
      if (data.path.type === 'random') {
        const dataPath = data.path as NPCRandomPathData
        const path = this.path as Required<NPCRandomPathData>
        path.radius = dataPath.radius ?? path.radius
        path.centerCoord =
          dataPath.centerCoord ?? PositionToCoord(this.worldPosition)
        path.scope = dataPath.scope ?? [
          vector2Minus(path.centerCoord, [path.radius, path.radius]),
          vector2Add(path.centerCoord, [path.radius, path.radius]),
        ]
        this.initMoveState(path.centerCoord)
      } else if (data.path.type === 'fixed') {
        const dataPath = data.path as NPCFixedPathData
        if (dataPath.datas.length > 0) this.initMoveState(dataPath.datas[0])
        this.path = { ...dataPath }
      }
    }
    this.root.addComponent(BoxCollider, {
      size: data.colliderSize ?? [DefalutMoveTileWidth, DefaultMoveTileHeight],
      layer: ColliderLayerType.NPC,
    } as BoxColliderData)
  }
}
