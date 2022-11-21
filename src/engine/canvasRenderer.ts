export enum RenderLayer {
  Default = 0,
  Foreground = 10,
  Window = 20,
  Battle = 50,
}

type CanvasInfo = {
  renderOrder: RenderLayer
  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
}

export default class implements IRenderer {
  private _canvas: HTMLCanvasElement
  private _canvasContext: CanvasRenderingContext2D
  private _cacheContext: CanvasRenderingContext2D
  private _postProcesses: IPostProcess[] = []
  private _cacheInfos: CanvasInfo[]

  constructor(canvasId: string, postProcesses: IPostProcess[] = []) {
    const canvas = document.getElementById(canvasId)
    if (!canvas) throw new Error(`Engine Error: 未找到对应的Canvas Id`)
    this._canvas = canvas as HTMLCanvasElement
    this._canvasContext = this._canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D

    this._cacheInfos = [
      RenderLayer.Default,
      RenderLayer.Foreground,
      RenderLayer.Window,
      RenderLayer.Battle,
    ].map((renderOrder) => {
      const cacheCanvas = document.createElement('canvas')
      cacheCanvas.width = this.width
      cacheCanvas.height = this.height
      const cacheContext = cacheCanvas.getContext(
        '2d'
      ) as CanvasRenderingContext2D
      return { renderOrder, canvas: cacheCanvas, context: cacheContext }
    })
    this._cacheInfos.sort((a, b) => a.renderOrder - b.renderOrder)
    this._cacheContext = this._cacheInfos[0].context

    this._postProcesses = postProcesses
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

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    fillColor: string,
    radius = 0,
    alpha = 1
  ): void {
    if (!fillColor || fillColor.trim() === 'transparent') return

    this._cacheContext.save()
    this._cacheContext.fillStyle = fillColor
    this._cacheContext.globalAlpha = alpha
    this.drawRoundRectPath(x, y, width, height, radius)
    this._cacheContext.fill()
    this._cacheContext.restore()
  }

  drawBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    border: Border,
    alpha = 1
  ) {
    if (border.width <= 0) return

    const radius = border.radius ?? 0
    this._cacheContext.save()
    this._cacheContext.globalAlpha = alpha

    const halfBorderWidth = border.width / 2
    x += halfBorderWidth
    y += halfBorderWidth
    width -= border.width
    height -= border.width
    this._cacheContext.strokeStyle = border.color ?? 'white'
    this._cacheContext.lineWidth = border.width

    this.drawRoundRectPath(x, y, width, height, radius)
    this._cacheContext.stroke()
    this._cacheContext.restore()
  }

  private drawRoundRectPath(
    x: number,
    y: number,
    width: number,
    height: number,
    radius = 0
  ) {
    this._cacheContext.beginPath()
    this._cacheContext.moveTo(x, y + radius)
    this._cacheContext.lineTo(x, y + height - radius)
    this._cacheContext.quadraticCurveTo(x, y + height, x + radius, y + height)
    this._cacheContext.lineTo(x + width - radius, y + height)
    this._cacheContext.quadraticCurveTo(
      x + width,
      y + height,
      x + width,
      y + height - radius
    )
    this._cacheContext.lineTo(x + width, y + radius)
    this._cacheContext.quadraticCurveTo(x + width, y, x + width - radius, y)
    this._cacheContext.lineTo(x + radius, y)
    this._cacheContext.quadraticCurveTo(x, y, x, y + radius)
  }

  drawTextOneLine(
    text: string,
    x: number,
    y: number,
    font: Required<Font>,
    maxWidth?: number,
    alpha = 1
  ) {
    this._cacheContext.save()
    this._cacheContext.globalAlpha = alpha
    this._cacheContext.font = `${font.italic ? 'italic' : ''} ${
      font.bold ? 'bold' : ''
    } ${font.size}px ${font.family}`
    this._cacheContext.textBaseline = 'top'
    this._cacheContext.fillStyle = font.color
    this._cacheContext.fillText(text, x, y, maxWidth)
    this._cacheContext.restore()
  }

  measureText(text: string, width: number, font: Required<Font>): LineInfo[] {
    if (text.length === 0) return [{ text: '', width: 0 }]

    this._cacheContext.save()
    this._cacheContext.font = `${font.italic ? 'italic' : ''} ${
      font.bold ? 'bold' : ''
    } ${font.size}px ${font.family}`

    let currentLine = ''
    let currentWidth = 0
    const textLines: LineInfo[] = []

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === '\n') {
        textLines.push({ text: currentLine, width: currentWidth })
        currentLine = ''
        currentWidth = 0
      } else {
        const textMetrics = this._cacheContext.measureText(currentLine + char)
        if (textMetrics.width > width) {
          textLines.push({ text: currentLine, width: currentWidth })
          currentLine = char
          currentWidth = textMetrics.width - currentWidth
        } else {
          currentLine += char
          currentWidth = textMetrics.width
        }
      }
    }
    textLines.push({ text: currentLine, width: currentWidth })

    return textLines
  }

  renderBegin(): void {
    this._cacheInfos.forEach((info) => {
      info.context.clearRect(0, 0, this.width, this.height)
    })
  }

  renderEnd(): void {
    if (this._postProcesses.length !== 0) {
      this._postProcesses.forEach((p) => p.render(this))
    } else {
      this._canvasContext.clearRect(0, 0, this.width, this.height)
      this._cacheInfos.forEach((ctx) => {
        this._canvasContext.drawImage(
          ctx.canvas,
          0,
          0,
          this.width,
          this.height,
          0,
          0,
          this.width,
          this.height
        )
      })
    }
  }

  render(fn: () => void) {
    this.renderBegin()
    fn()
    this.renderEnd()
  }

  registerPostProcess(postProcess: IPostProcess): () => void {
    this._postProcesses.push(postProcess)

    return () => {
      const index = this._postProcesses.indexOf(postProcess)
      if (index >= 0) this._postProcesses.splice(index, 1)
    }
  }

  selectRenderLayer(order: RenderLayer = RenderLayer.Default) {
    const cacheInfo = this._cacheInfos.find(
      (info) => info.renderOrder === order
    )
    this._cacheContext = cacheInfo?.context ?? this._cacheInfos[0].context
  }

  get selectedRendererContext(): CanvasRenderingContext2D {
    return this._cacheContext
  }

  get cacheInfos(): CanvasInfo[] {
    return this._cacheInfos
  }
}
