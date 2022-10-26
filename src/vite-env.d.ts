/// <reference types="vite/client" />

type Sprite = HTMLImageElement
type Audio = HTMLAudioElement

// load sprite, audio, json
interface IResource {
  loadSprite(path: string): Promise<Sprite>
  loadAudio(): Promise<Audio>
  loadJson<T>(path: string): Promise<T>

  hasSprite(key: string): boolean
  getSprite(key: string): Sprite | null
}

// render
interface IRenderer {
  get width(): number
  get height(): number
  get context(): CanvasRenderingContext2D

  render(fn: () => void)

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
  )
}
