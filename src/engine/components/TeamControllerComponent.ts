import { InnerGameComponent } from '.'
import GameObject from '../gameObject'
import { Direction, DirectionToCoord } from '../input'
import { distance, lerpVector2, vector2Add } from '../math'
import { AssetLoader } from '../resource'
import MoveComponent, {
  CoordToPosition,
  DefaultAnimationDuration,
  DefaultMoveState,
  DefaultRoleSprite,
  MoveComponentData,
  MoveState,
} from './MoveComponent'

type TeamControllerData = {
  moveSpeed?: number
  maxTeamCount?: number
} & MoveComponentData

const DefaultMaxTeamCount = 1
const DefaultMoveSpeed = 64
const DefaultTileSize = 32

export function NextCoordByDirection(
  coord: Vector2,
  direction: Direction
): Vector2 {
  const delta = DirectionToCoord.get(direction) as Vector2
  return [coord[0] + delta[0], coord[1] + delta[1]]
}

export function checkNextCoordCanMove(coord: Vector2): boolean {
  return true
}

@InnerGameComponent
export default class TeamControllerComponent extends MoveComponent {
  characterSpriteName = ''
  coord: Vector2 = [0, 0]
  targetCoord: Vector2 = [0, 0]
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
    this.camera.moveToCenter(
      vector2Add(this._head.position, this.worldPosition)
    )
  }

  updateDistance(moveDelta: number): void {
    const pressedDirection = this.input.getPressedDirection()
    // console.log(
    //   `==========  ${this.time.currentFrame} ${pressedDirection} ==============`
    // )

    if (!this.isMoving) {
      if (pressedDirection !== Direction.none) {
        this.changeHeadDirection(pressedDirection)

        const nextCoord = NextCoordByDirection(
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
        if (moveDistance - moveDelta > 0.01) {
          this.updateDistance(moveDistance - moveDelta)
        }
      } else {
        this.move(moveDelta)
      }
    }
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

    console.log(this._head.position)

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
