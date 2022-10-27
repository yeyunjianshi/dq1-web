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

interface ILayout {
  layout(
    measureParentWidth: number,
    measureParentHeight: number
  ): [number, number]
}

interface ITime {
  init(): void
  tick(delta: number | null): void
  get scaleDeltaTime(): number
}

interface LifeCycle {
  active: boolean
  start?(): void
  tick?: () => void
  update?: () => void
  render?: () => void
}

type ComponentData = {
  type: string
  [K in 'string']: any
}

type GameObjectData = {
  name?: string
  x: number
  y: number
  width: number
  height: number
  layout?: LayoutData
  active: boolean
  background?: string
  alpha?: number
  children?: GameObjectData[]
  components?: ComponentData[]
}

type SceneData = {
  name: string
  root: GameObjectData
}

type LayoutData = {
  type: 'AbsoluteLayout' | 'VerticalLayout' | 'HorizontalLayout' | 'GridLayout'
}
