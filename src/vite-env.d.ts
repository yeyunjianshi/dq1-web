/// <reference types="vite/client" />

type ListenerFunction = (...args: any[]) => void

interface SelectListener {
  select: ListenerFunction
  hover: ListenerFunction
  unselect: ListenerFunction
  unhover: ListenerFunction
}

type Font = {
  size: number
  family: string
  color: string
  bold: boolean
  italic: boolean
  align: HorizontalGravity
}

type LineInfo = {
  text: string
  width: number
}

type Vector2 = [number, number]
type Vector3 = [number, number, number]
type Vector4 = [number, number, number, number]

type Color = string
type Sprite = HTMLImageElement
type Border = {
  width: number
  color?: Color
  radius?: number
}

type Background = {
  name: string
  sprite?: Sprite
  spriteWidth: number
  spriteHeight: number
  color: Color
  scaleType: 'fit' | 'original'
  border: Border
  pivotOffset: [number, number]
  alpha: number
}

type Audio = HTMLAudioElement

interface IPostProcess {
  render(renderer: IRenderer)
}

// load sprite, audio, json
interface IResource {
  loadSprite(path: string): Promise<Sprite>
  loadAudio(path: string): Promise<Audio>
  loadJson<T>(path: string): Promise<T>

  hasSprite(key: string): boolean
  getSprite(key: string): Sprite | undefined
  hasAudio(key: string): boolean
  getAudio(key: string): Audio | undefined
}

// render
interface IRenderer {
  get width(): number
  get height(): number
  get context(): CanvasRenderingContext2D

  registerPostProcess(postProcess: IPostProcess): () => void

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
  ): void

  drawBorder(
    x: number,
    y: number,
    width: number,
    height: number,
    border: Border,
    alpha?: number
  ): void

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    backgroundColor: Color,
    radius?: number,
    alpha?: number
  ): void

  drawTextOneLine(
    text: string,
    x: number,
    y: number,
    font: Required<Font>,
    maxWidth?: number,
    alpha?: number
  )

  measureText(text: string, width: number, font: Required<Font>): LineInfo[]

  get selectedRendererContext(): CanvasRenderingContext2D
  selectRenderLayer(layer: number)
}

interface ILayout {
  layout(): [number, number]
}

interface ITime {
  init(): void
  tick(delta: number | null): void
  get scaleDeltaTime(): number
}

interface LifeCycle {
  active: boolean
  enable: boolean

  awake?(): void
  start?(): void
  tick?: () => void
  update?: () => void
  render?: () => void
}

type ComponentConstruct = {
  new (GameObject): Component
}

type ComponentData = {
  type: string
  [K in 'string']: any
}

type BackgroundData =
  | string
  | {
      sprite: string
      spriteWidth?: number
      spriteHeight: number
      scaleType?: 'fit' | 'original'
      backgroundColor?: string
      borderWidth?: number
      borderColor?: string
      radius?: number
      alpha?: number
      pivotOffset?: [number, number]
    }

type GameObjectData = {
  name?: string
  x: number
  y: number
  width: number
  height: number
  layout?: LayoutData
  active: boolean
  background?: BackgroundData
  alpha?: number
  children?: GameObjectData[]
  components?: ComponentData[]
  layoutGravity?: [HorizontalGravity, VerticalGaravity]
  pivot?: Vector2
  useScreenPosition?: boolean // 是否使用屏幕坐标，屏幕坐标开始时使用本身的相对坐标。当当前对象设置为true，所有子物体在渲染时都会转化为屏幕坐标
  renderLayer?: number
}

type SceneData = {
  name: string
  root: GameObjectData
  bgm?: string
  width?: number
  height?: number
  loadType?: number
  priority?: number // 场景渲染顺序
  hasCamera?: boolean // 是否有摄像机
  isCave?: boolean
  isMeetEnemy: boolean
}

type LayoutGravity = HorizontalGravity | VerticalGaravity
type HorizontalGravity = 'center' | 'left' | 'right'
type VerticalGaravity = 'center' | 'top' | 'bottom'

type LayoutConfig =
  | { type: 'AbsoluteLayout' }
  | ({ type: 'HorizontalLayout' } & HorizontalLayoutConfig)
  | ({ type: 'VerticalLayout' } & VerticalLayoutConfig)
  | ({ type: 'GridLayout' } & GridLayoutConfig)

type HorizontalLayoutConfig = {
  gravity: VerticalGaravity
  padding?: Vector4
}

type VerticalLayoutConfig = {
  gravity: HorizontalGravity
  padding?: Vector4
}

type GridLayoutConfig = {
  gravity: [HorizontalGravity, VerticalGaravity]
  cell: [number, number]
  col: number
  row: number
  spacing?: [number, number]
  template?: string
}

interface Cloneable<T> {
  clone(init?: boolean = true): T
}

interface Interaction {
  interactive(): void
}

interface ICollider {
  collider(point: Vector2, layer: ColliderLayerType): boolean
}
