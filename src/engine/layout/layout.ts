export const LayoutUnLimit = -3
export const LayoutMatchParent = -2
export const LayoutFitContent = -1

export function measureLocalPositionByGravity(
  gravity: LayoutGravity,
  parentSize: number,
  childSize: number
): number {
  if (gravity === 'center') return (parentSize - childSize) / 2
  else if (gravity === 'right' || gravity === 'bottom')
    return parentSize - childSize
  else return 0
}
