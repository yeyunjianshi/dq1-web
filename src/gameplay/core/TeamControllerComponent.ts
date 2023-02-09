import FadingComponent from '@engine/components/FadingComponent'
import { Audios } from '@gameplay/audio/AudioConfig'
import { GameplayComponent } from '../../engine/components'
import { ColliderLayerType } from '../../engine/components/Collider'
import MoveComponent, {
  MoveComponentData,
  CoordToPosition,
  MoveState,
  DefaultMoveState,
  PositionToCoord,
  DefaultAnimationDuration,
  DefaultRoleSprite,
  DefaultTileSize,
  nextCoordByDirection,
  checkNextCoordCanMove,
  playerCenterPosition,
} from '../../engine/components/MoveComponent'
import {
  GlobalFadingMarker,
  GlobalSceneComponentMarker,
  GlobalTeamControllerMarker,
  GlobalWindowMarker,
} from '../../engine/engine'
import GameObject from '../../engine/gameObject'
import { Direction, oppsiteDirection } from '../../engine/input'
import {
  vector2Add,
  distance,
  lerpVector2,
  vector2Include,
  HasType,
} from '../../engine/math'
import { AssetLoader } from '../../engine/resource'
import { globalGameData, InputType } from '../asset/gameData'
import {
  checkMeetEnemy,
  battle,
  hero,
  checkDeadToInit,
} from '../events/EventExector'
import { EventTriggerWhen } from '../events/QuestEvent'
import GlobalWindowComponent from '../menu/GlobalWindowComponent'
import SceneComponent, { TileMapType } from './SceneComponent'

type TeamControllerData = {
  moveSpeed?: number
  maxTeamCount?: number
  coord: Vector2
} & MoveComponentData

const DefaultMaxTeamCount = 3
const DefaultMoveSpeed = 64

@GameplayComponent
export default class TeamControllerComponent
  extends MoveComponent
  implements ICollider
{
  characterSpriteName = ''
  playerMoveComponents: MoveComponent[] = []
  playerStats: MoveState[] = []
  private _head: MoveState = DefaultMoveState
  inited = false
  moveSpeed = DefaultMoveSpeed
  isMoving = false
  maxTeamCount: number = DefaultMaxTeamCount
  startCoord: Vector2 = [0, 0]

  constructor(root: GameObject) {
    super(root)
  }

  awake(): void {
    this.engine.setVariable(GlobalTeamControllerMarker, this)
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
    this.initTeam()
    this.moveToCoord(this.startCoord, Direction.down, false)
    this.inited = true
  }

  initTeam() {
    const moveRoles = globalGameData.teamMoves
    for (let i = 0; i < this.maxTeamCount; i++) {
      if (i < moveRoles.length) {
        this.playerMoveComponents[i].roleIndex = moveRoles[i].roleId
        this.playerMoveComponents[i].root.active = true
      } else {
        this.playerMoveComponents[i].root.active = false
      }
    }
  }

  update() {
    if (!this.inited) return

    this.updateDistance((this.moveSpeed * this.time.scaleDeltaTime) / 1000)
    this.refreshAnimation()
    this.camera.moveToCenter(this.headPosition)
  }

  updateDistance(moveDelta: number): void {
    if (globalGameData.inputType !== InputType.Move) return

    const pressedDirection = this.input.getPressedDirection()

    if (!this.isMoving) {
      // 菜单
      if (this.checkCancelPressed()) {
        return
      }
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

        if (
          checkNextCoordCanMove(nextCoord, this.engine, ColliderLayerType.Hero)
        ) {
          this._head.targetCoord = nextCoord
          this._head.targetPosition = CoordToPosition(nextCoord)

          this.refreshNextPlayerStats()
          this.isMoving = true
        } else {
          if (!this.audios.MEAudio || this.audios.MEAudio.paused) {
            this.audios.playME(Audios.Bump)
          }
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

        if (this.checkTargetEvent()) return

        if (moveDistance - moveDelta > 0.01) {
          this.updateDistance(moveDistance - moveDelta)
        }
      } else {
        this.move(moveDelta)
      }
    }
  }

  private checkTargetEvent() {
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponentMarker
    ) as SceneComponent
    // 检查是否有事件发生
    const interaction = sceneComponent.triggerQuestEvent(
      this._head.coord,
      EventTriggerWhen.Trigger
    )
    if (interaction) {
      interaction.interactive()
      return true
    }

    // 检查是否出入口
    if (this.checkDestination()) {
      return true
    }
    // 检查毒池
    if (this.checkPoisonPool()) return true
    // 检查回复Buff检测
    globalGameData.hero.triggerMoveBuffers()
    // 检查敌人
    if (checkMeetEnemy()) {
      battle()
      return true
    }

    return false
  }

  private checkCancelPressed(): boolean {
    if (!this.input.isCancelPressed()) return false

    globalGameData.inputType = InputType.Menu

    const globalWindow = this.engine.getVariable(
      GlobalWindowMarker
    ) as GlobalWindowComponent
    globalWindow.showMenu()

    return true
  }

  private checkConfirmPressed(): boolean {
    if (!this.input.isConfirmPressed()) return false
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponentMarker
    ) as SceneComponent

    const nextPosition = CoordToPosition(
      nextCoordByDirection(this._head.coord, this._head.direction)
    )
    const playerNextCenterPosition = playerCenterPosition(nextPosition)
    const interaction = sceneComponent.triggerInteractive(
      playerNextCenterPosition,
      EventTriggerWhen.InteractiveConfirm
    )
    if (interaction) {
      interaction.interactive()
      return true
    }
    return false
  }

  private checkPoisonPool() {
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponentMarker
    ) as SceneComponent
    const fadingComponent = this.engine.getVariable(
      GlobalFadingMarker
    ) as FadingComponent
    const tileData = sceneComponent.getMapData(this._head.coord)
    if (HasType(tileData, TileMapType.Poison) && !hero().isImmunotoxicity) {
      hero().HP -= tileData === TileMapType.Poison ? 15 : 1
      fadingComponent.flashing({ duration: 300, times: 1 })
      checkDeadToInit()
      return hero().isDead
    }
    return false
  }

  private checkDestination(): boolean {
    const sceneComponent = this.engine.getVariable(
      GlobalSceneComponentMarker
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

  collider(point: Vector2, layer: ColliderLayerType): boolean {
    if (layer === ColliderLayerType.Hero) return false

    return this.root.children.some((child) => {
      return child.active && vector2Include(point, child.boundingBox)
    })
  }

  public moveToCoord(coord: Vector2, dir: Direction, isPermutation = true) {
    this.isMoving = false

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
      playerState.direction = dir
    }

    this._head = { ...this.playerStats[0] }

    this.refreshAllMoveComponent((stat, component) => {
      component.localPosition = stat.position
      component.direction = stat.direction
    })
    this.refreshAnimationSprite()

    this.camera.moveToCenter(this.headPosition, true)
  }

  public moveTo(worldPostion: Vector2, dir: Direction, isPermutation = true) {
    this.moveToCoord(PositionToCoord(worldPostion), dir, isPermutation)
  }

  get headDirection() {
    return this._head.direction
  }

  get headPosition() {
    return vector2Add(this._head.position, this.worldPosition)
  }

  get headCameraPosition() {
    return vector2Add(this.cameraPosition, this.headPosition)
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
    this.startCoord = data.coord ?? this.startCoord

    const spriteAsset = this.resource.loadSprite(data.sprite).then(() => {
      this.inited = true
    })
    assetLoader.addAssets(spriteAsset)
  }
}
