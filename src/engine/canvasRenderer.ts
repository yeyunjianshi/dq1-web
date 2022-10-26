export default class implements IRenderer {
  private _canvas: HTMLCanvasElement
  private _canvasContext: CanvasRenderingContext2D
  private _cacheCanvas: HTMLCanvasElement
  private _cacheContext: CanvasRenderingContext2D

  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) throw new Error(`Engine Error: 未找到对应的Canvas Id`)
    this._canvas = canvas as HTMLCanvasElement
    this._canvasContext = this._canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this._cacheCanvas = document.createElement('canvas')
    this._cacheCanvas.width = this.width
    this._cacheCanvas.height = this.height
    this._cacheContext = this._cacheCanvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D
  }

  get width() {
    return this._canvas.width
  }

  get height() {
    return this._canvas.height
  }

  get context(): CanvasRenderingContext2D {
    return this._canvasContext
  }

  drawSprite(sprite: Sprite, alpha: number, dx: number, dy: number): void
  drawSprite(
    sprite: Sprite,
    alpha: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void
  drawSprite(
    sprite: Sprite,
    alpha: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void
  drawSprite(
    sprite: Sprite,
    alpha: number,
    sx: number,
    sy: number,
    sw?: unknown,
    sh?: unknown,
    dx?: unknown,
    dy?: unknown,
    dw?: unknown,
    dh?: unknown
  ): void {
    if (!(typeof sw === 'number')) {
      dx = sx
      dy = sy
      sx = 0
      sy = 0
      dw = sw = sprite.naturalWidth
      dh = sh = sprite.naturalHeight
    } else if (!(typeof dx === 'number')) {
      dx = sx
      dy = sy
      dw = sw
      dh = sh
      sx = 0
      sy = 0
      sw = sprite.naturalWidth
      sh = sprite.naturalHeight
    }
    this._cacheContext.save()
    this._cacheContext.globalAlpha = alpha
    this._cacheContext.drawImage(
      sprite,
      sx as number,
      sy as number,
      sw as number,
      sh as number,
      dx as number,
      dy as number,
      dw as number,
      dh as number
    )
    this._cacheContext.restore()
  }

  renderBegin(): void {
    this._cacheContext.clearRect(0, 0, this.width, this.height)
  }

  renderEnd(): void {
    this._canvasContext.clearRect(0, 0, this.width, this.height)
    this._canvasContext.drawImage(
      this._cacheCanvas,
      0,
      0,
      this.width,
      this.height,
      0,
      0,
      this.width,
      this.height
    )
  }

  render(fn: () => void) {
    this.renderBegin()
    fn()
    this.renderEnd()
  }

  drawText() {}
}
