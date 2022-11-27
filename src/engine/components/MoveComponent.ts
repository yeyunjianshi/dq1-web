import { InnerGameComponent } from '.'
import Component from '../component'
import { Direction, parseDirection } from '../input'
import { AssetLoader } from '../resource'

export type MoveComponentData = {
  type: string
  sprite?: string
  roleIndex: number
  aniamtionDuration?: number
  animationDiretions?: Direction[]
  animtionOffset: [number, number]
  initDirection: string | number
}

export type MoveState = {
  coord: Vector2
  position: Vector2
  targetCoord: Vector2
  targetPosition: Vector2
  direction: Direction
}

export const DefaultRoleSprite = 'characters.png'
export const DefalutMoveTileWidth = 32
export const DefaultMoveTileHeight = 32
export const DefaultAnimationCountInDirection = 2
export const DefaultAnimationDuration = 1000

export const DefaultMoveState = {
  coord: [0, 0] as Vector2,
  position: [0, 0] as Vector2,
  targetCoord: [0, 0] as Vector2,
  targetPosition: [0, 0] as Vector2,
  direction: Direction.down,
}

export function CoordToPosition(coord: Vector2): Vector2 {
  return [coord[0] * DefalutMoveTileWidth, coord[1] * DefaultMoveTileHeight]
}

export function PositionToCoord(position: Vector2): Vector2 {
  return [
    Math.floor(position[0] / DefalutMoveTileWidth),
    Math.floor(position[1] / DefaultMoveTileHeight),
  ]
}

@InnerGameComponent
class MoveComponent extends Component {
  sprite?: Sprite
  inited = false
  roleIndex = 0
  direction: Direction = Direction.down
  animationCountInDirection = DefaultAnimationCountInDirection
  animationIndex = 0
  animationDuration = DefaultAnimationDuration
  animationDirections = new Set<Direction>()
  offset: [number, number] = [0, 0]

  private _animationDelta = 0

  update(): void {
    if (!this.inited) return

    this.refreshAnimation()
  }

  refreshAnimation() {
    this._animationDelta += this.time.scaleDeltaTime
    if (this._animationDelta >= this.animationDuration) {
      this._animationDelta = 0
      this.animationIndex = ++this.animationIndex % 2
      this.refreshAnimationSprite()
    }
  }

  refreshAnimationSprite() {
    this.background.pivotOffset = this.animationPositionInSprite
  }

  get animationPositionInSprite(): [number, number] {
    return [
      (this.direction * this.animationCountInDirection + this.animationIndex) *
        DefalutMoveTileWidth +
        this.offset[0],
      this.roleIndex * DefaultMoveTileHeight + this.offset[1],
    ]
  }

  parseData(assetLoader: AssetLoader, data: MoveComponentData) {
    this.animationDuration = data.aniamtionDuration ?? DefaultAnimationDuration
    if (!data.animationDiretions || data.animationDiretions.length == 0)
      data.animationDiretions = [Direction.down]
    this.direction = parseDirection(
      data.initDirection ?? data.animationDiretions[0]
    )
    this.animationDirections = new Set(this.animationDirections)
    this.roleIndex = data.roleIndex
    if (!data.sprite) data.sprite = DefaultRoleSprite
    this.background.name = data.sprite
    this.offset = data.animtionOffset ?? [0, 0]

    const spriteAsset = this.resource.loadSprite(data.sprite).then((sprite) => {
      this.inited = true
      this.sprite = sprite
      this.background.sprite = sprite
      this.refreshAnimationSprite()
    })
    assetLoader.addAssets(spriteAsset)
  }
}

export default MoveComponent
