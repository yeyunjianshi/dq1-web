export class Camera {
  x = -1
  y = -1

  private _width = 0
  private _height = 0
  private _halfWidth = 0
  private _halfHeight = 0

  sceneWidth = 4096
  sceneHeight = 4096

  private _previousCenter: Vector2 = [0, 0]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
  }

  moveToCenter(pos: Vector2, useCache = true) {
    if (
      useCache &&
      this._previousCenter[0] === pos[0] &&
      this._previousCenter[1] === pos[1]
    )
      return
    this._previousCenter = [...pos]

    this.x =
      this.width >= this.sceneWidth
        ? (this.sceneWidth - this.width) >> 1
        : pos[0] <= this._halfWidth
        ? 0
        : this._halfWidth + pos[0] >= this.sceneWidth
        ? Math.max(0, this.sceneWidth - this.width)
        : pos[0] - this._halfWidth
    this.y =
      this.height >= this.sceneHeight
        ? (this.sceneHeight - this.height) >> 1
        : pos[1] <= this._halfHeight
        ? 0
        : this._halfHeight + pos[1] >= this.sceneHeight
        ? Math.max(0, this.sceneHeight - this.height)
        : pos[1] - this._halfHeight
  }

  refresh() {
    this.moveToCenter([0, 0], false)
  }

  set width(val: number) {
    this._width = val
    this._halfWidth = val / 2
  }

  get width() {
    return this._width
  }

  set height(val: number) {
    this._height = val
    this._halfHeight = val / 2
  }

  get height() {
    return this._height
  }
}

export default Camera
