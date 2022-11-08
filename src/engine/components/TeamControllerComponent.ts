import { InnerGameComponent } from '.'
import { GlobalSceneComponent, GlobalTeamController } from '../engine'
import GameObject from '../gameObject'
import Input, { Direction, DirectionToCoord, oppsiteDirection } from '../input'
import { distance, lerpVector2, vector2Add } from '../math'
import { AssetLoader } from '../resource'
import { AddExecuteEvent, AddGameEvent, Execute } from './events/EventExector'
import { EventTriggerWhen } from './events/QuestEvent'
import MoveComponent, {
  CoordToPosition,
  DefaultAnimationDuration,
  DefaultMoveState,
  DefaultRoleSprite,
  MoveComponentData,
  MoveState,
  PositionToCoord,
} from './MoveComponent'
import SceneComponent from './SceneComponent'

type TeamControllerData = {
  moveSpeed?: number
  maxTeamCount?: number
} & MoveComponentData

const DefaultMaxTeamCount = 1
const DefaultMoveSpeed = 64
const DefaultTileSize = 32

export function nextCoordByDirection(
  coord: Vector2,
  direction: Direction
): Vector2 {
  const delta = DirectionToCoord.get(direction) as Vector2
  return [coord[0] + delta[0], coord[1] + delta[1]]
}

export function checkNextCoordCanMove(coord: Vector2): boolean {
  return true
}

function playerCenterPosition(pos: Vector2): Vector2 {
  return vector2Add(pos, [DefaultTileSize >> 1, DefaultTileSize >> 1])
}

@InnerGameComponent
export default class TeamControllerComponent extends MoveComponent {
  characterSpriteName = ''
  playerMoveComponents: MoveComponent[] = []
  playerStats: MoveState[] = []
  private _head: MoveState = DefaultMoveState
  inited = false
  moveSpeed = DefaultMoveSpeed
  isMoving = false
  maxTeamCount: number = DefaultMaxTeamCount

  constructor(root: GameObject) {
    super(root)
  }

  awake(): void {
    this.engine.setVariable(GlobalTeamController, this)
  }

  start() {
    for (let i = 0; i < this.maxTeamCount; i++) {
      const child = new GameObject(this.root, `PlayerMoveAnimation_${i}`)
      child.configWidth = child.configHeight = DefaultTileSize
      child.measureWidth = child.measureHeight = DefaultTileSize
      child.active = true

      this.root.children.unshift(child)
      const moveComponent = new MoveComponent(child)
      moveComponent.roleIndex = i
      moveComponent.background.name = this.characterSpriteName
      this.playerMoveComponents.push(moveComponent)
      this.playerStats.push({ ...this._head })
    }
    this.inited = true
  }

  update() {
    if (!this.inited) return

    this.updateDistance((this.moveSpeed * this.time.scaleDeltaTime) / 1000)
    this.refreshAnimation()
    this.camera.moveToCenter(this.headPosition)
  }

  updateDistance(moveDelta: number): void {
    const pressedDirection = this.input.getPressedDirection()
    // console.log(
    //   `==========  ${this.time.currentFrame} ${pressedDirection} ==============`
    // )

    if (!this.isMoving) {
      // 对话、调查、开门
      if (this.checkConfirmPressed()) {
        return
      }
      if (pressedDirection !== Direction.none) {
        this.changeHeadDirection(pressedDirection)

        const nextCoord = nextCoordByDirection(
          this._head.coord,
          pressedDirection
        )

        if (checkNextCoordCanMove(nextCoord)) {
          this._head.targetCoord = nextCoord
          this._head.targetPosition = CoordToPosition(nextCoord)

          // console.log('---------------------------------')
          // console.log(nextCoord)
          // console.log(this._head.targetPosition)
          // console.log('---------------------------------')

          this.refreshNextPlayerStats()
          this.isMoving = true
        }

        this.refreshAnimationSprite()
      }
    }

    if (this.isMoving) {
      const moveDistance = distance(
        this._head.position,
        this._head.targetPosition
      )

      if (moveDistance <= moveDelta) {
        this.moveToTarget() // 移动到目标坐标
        // 检查是否有事件发生
        if (this.checkDestination()) {
          return
        }
        if (moveDistance - moveDelta > 0.01) {
          this.updateDistance(moveDistance - moveDelta)
        }
      } else {
        this.move(moveDelta)
      }
    }
  }

  private checkConfirmPressed(): boolean {
    if (!this.input.isConfirmPressed()) return false
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponent
    ) as SceneComponent

    const nextPosition = CoordToPosition(
      nextCoordByDirection(this._head.coord, this._head.direction)
    )

    // 对话
    const questEvent = sceneComponent.triggerQuestEvent(
      playerCenterPosition(nextPosition),
      EventTriggerWhen.InteractiveConfirm
    )
    if (questEvent) {
      AddExecuteEvent(questEvent)
      Execute(this.engine)
      return true
    }
    return false
  }

  private checkDestination(): boolean {
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponent
    ) as SceneComponent
    if (sceneComponent) {
      const transition = sceneComponent.triggerTransition(
        vector2Add(this.headPosition, [
          DefaultTileSize >> 1,
          DefaultTileSize >> 1,
        ])
      )
      if (transition) {
        transition.transitionTo()
        return true
      }
    }
    return false
  }

  move(dis: number) {
    this.playerStats.forEach((p) => {
      p.position = lerpVector2(p.position, p.targetPosition, dis)
      // console.log(p.position)
    })
    this._head.position = this.playerStats[0].position

    this.refreshAllMoveComponent((stat, component) => {
      component.localPosition = stat.position
    })
  }

  moveToTarget() {
    this.playerStats.forEach((p) => {
      p.coord = p.targetCoord
      p.position = p.targetPosition
    })
    this._head.coord = this._head.targetCoord
    this._head.position = this._head.targetPosition

    // console.log(this._head.position)

    this.refreshAllMoveComponent((stat, component) => {
      component.localPosition = stat.targetPosition
    })

    this.isMoving = false
  }

  refreshNextPlayerStats() {
    for (let i = this.playerStats.length - 1; i >= 0; i--) {
      const p = this.playerStats[i]
      const pre = i === 0 ? this._head : this.playerStats[i - 1]
      p.targetCoord = pre.targetCoord
      p.targetPosition = pre.targetPosition
      p.direction = pre.direction
    }

    this.refreshAllMoveComponent((stat, component) => {
      component.localPosition = stat.position
      component.direction = stat.direction
    })
  }

  refreshAllMoveComponent(
    fn: (stat: MoveState, component: MoveComponent) => void
  ) {
    for (let i = 0; i < this.playerStats.length; i++) {
      fn(this.playerStats[i], this.playerMoveComponents[i])
    }
  }

  refreshAnimationSprite(): void {
    this.playerMoveComponents.forEach((p) => {
      p.animationIndex = this.animationIndex
      p.refreshAnimationSprite()
    })
  }

  changeHeadDirection(direciton: Direction) {
    this._head.direction = direciton
    this.playerMoveComponents[0].direction = direciton
  }

  public moveTo(worldPostion: Vector2, dir: Direction, isPermutation = true) {
    this.isMoving = false
    const coord = PositionToCoord(worldPostion)
    this._head.targetCoord = this._head.coord = coord
    this._head.direction = dir
    for (let i = 0; i < this.playerStats.length; i++) {
      const playerState = this.playerStats[i]
      playerState.coord = playerState.targetCoord =
        i == 0 || !isPermutation
          ? coord
          : nextCoordByDirection(
              this.playerStats[i - 1].targetCoord,
              oppsiteDirection(dir)
            )
      playerState.position = playerState.targetPosition = CoordToPosition(
        playerState.coord
      )
      playerState.direction = this.direction
    }
    this.refreshAllMoveComponent((stat, component) => {
      component.localPosition = stat.position
      component.direction = stat.direction
    })
    this.refreshAnimationSprite()
  }

  get headPosition() {
    return vector2Add(this._head.position, this.worldPosition)
  }

  parseData(assetLoader: AssetLoader, data: TeamControllerData): void {
    this.animationDuration = data.aniamtionDuration ?? DefaultAnimationDuration
    if (!data.animationDiretions || data.animationDiretions.length == 0)
      data.animationDiretions = [Direction.down]
    this.direction = data.animationDiretions[0]
    this.animationDirections = new Set(this.animationDirections)
    this.roleIndex = data.roleIndex
    if (!data.sprite) data.sprite = DefaultRoleSprite
    this.characterSpriteName = data.sprite
    this.offset = data.animtionOffset ?? [0, 0]
    this.moveSpeed = data.moveSpeed ?? DefaultMoveSpeed
    this.maxTeamCount = data.maxTeamCount ?? DefaultMaxTeamCount

    const spriteAsset = this.resource.loadSprite(data.sprite).then(() => {
      this.inited = true
    })
    assetLoader.addAssets(spriteAsset)
  }
}
