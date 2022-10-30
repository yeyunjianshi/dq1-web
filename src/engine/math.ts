export function lerpVector2(
  start: Vector2,
  end: Vector2,
  amt: number
): Vector2 {
  const d = [end[0] - start[0], end[1] - start[1]]
  if (d[0] === 0 && d[1] === 0) return start
  if (d[0] === 0) return [start[0], lerp(start[1], end[1], amt)]
  if (d[1] === 0) return [lerp(start[0], end[0], amt), start[1]]

  const distance = Math.sqrt(d[0] * d[0] + d[1] * d[1])
  return [
    (amt * d[0]) / distance + start[0],
    (amt * d[1]) / distance + start[1],
  ]
}

export function lerp(start: number, end: number, amt: number): number {
  if (Math.abs(end - start) <= amt) return end
  return start + amt * Math.sign(end - start)
}

export function distance(a: Vector2, b: Vector2): number {
  const d = [b[0] - a[0], b[1] - a[1]]
  if (d[0] === 0 || d[1] === 0) return Math.abs(d[0]) + Math.abs(d[1])
  return Math.sqrt(d[0] * d[0] + d[1] * d[1])
}
