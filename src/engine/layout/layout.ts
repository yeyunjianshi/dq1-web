export const LayoutUnLimit = -3
export const LayoutMatchParent = -2
export const LayoutFitContent = -1

export function measureLocalPositionByGravity(
  gravity: LayoutGravity,
  parentSize: number,
  childSize: number,
  padding: Vector2 = [0, 0]
): number {
  if (gravity === 'center') return (parentSize - childSize) / 2
  else if (gravity === 'right' || gravity === 'bottom')
    return parentSize - childSize - padding[1]
  else return padding[0]
}
