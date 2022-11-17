import { InnerGameComponent } from '.'
import Component from '../component'
import { HasType, vector2Add, vector2Include } from '../math'
import { AssetLoader } from '../resource'

export enum ColliderLayerType {
  Static = 0b001,
  Hero = 0b010,
  NPC = 0b100,
}

export const ColliderLayerInteraction: Map<ColliderLayerType, number> = new Map(
  [
    [ColliderLayerType.Static, 0b111],
    [ColliderLayerType.Hero, 0b101],
    [ColliderLayerType.NPC, 0b111],
  ]
)

export function GetColliderLayerInteractive(
  a: ColliderLayerType,
  b: ColliderLayerType
): boolean {
  return HasType(ColliderLayerInteraction.get(a) ?? 0x000, b)
}

export default abstract class Collider extends Component implements ICollider {
  abstract collider(point: Vector2, layer: ColliderLayerType): boolean
}

export type BoxColliderData = {
  type: string
  size?: Vector2
  layer?: ColliderLayerType
}

@InnerGameComponent
export class BoxCollider extends Collider {
  size: Vector2 = [32, 32]
  layer = ColliderLayerType.Static

  collider(point: Vector2, layer: ColliderLayerType): boolean {
    return (
      GetColliderLayerInteractive(this.layer, layer) &&
      vector2Include(point, [
        this.worldPosition,
        vector2Add(this.worldPosition, this.size),
      ])
    )
  }

  parseData(_: AssetLoader, data: BoxColliderData): void {
    this.size = data.size || this.size
    this.layer = data.layer || this.layer
  }
}
