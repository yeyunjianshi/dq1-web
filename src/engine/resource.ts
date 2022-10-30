import EventEmitter from './eventEmitter'

export const ASSETS_PREFIX = 'public/assets/'
export const SPRITES_PREFIX = ASSETS_PREFIX + 'sprites/'

export enum AssetLoadStatus {
  READY,
  RUNNING,
  SUCCESS,
  FAIED,
}

export class AssetLoader {
  private runningPromise: Promise<any>[] = []
  private status = AssetLoadStatus.READY
  private pendingAssetPromises: Promise<any>[] = []
  public assetEvent = new EventEmitter<AssetLoadStatus>()

  addAssets(...assetPromise: Promise<any>[]): AssetLoader {
    this.pendingAssetPromises = [...this.pendingAssetPromises, ...assetPromise]
    return this
  }

  async load() {
    this.status = AssetLoadStatus.RUNNING

    while (this.pendingAssetPromises.length > 0) {
      this.runningPromise = [...this.pendingAssetPromises]
      this.pendingAssetPromises = []

      await Promise.all(this.runningPromise)
    }

    this.assetEvent.emit(AssetLoadStatus.SUCCESS)
  }

  loadOneTime() {
    if (this.status !== AssetLoadStatus.READY) {
      console.warn(`AssetLoader Error: 已经加载过资源了`)
      return
    }

    Promise.all(this.pendingAssetPromises)
      .then((successPromise) => {
        this.status = AssetLoadStatus.SUCCESS
        this.runningPromise = this.runningPromise.filter(
          (p) => successPromise.indexOf(p) < 0
        )
      })
      .catch(() => {
        this.status = AssetLoadStatus.FAIED
        this.runningPromise = []
      })
      .finally(() => {
        this.assetEvent.emit(this.status)
      })
  }
}

export const supportSpriteExt = (path: string): boolean =>
  ['.png', '.jpg', '.jpeg', '.bmp'].some((ext) => path.endsWith(ext))

export class Resource implements IResource {
  private _sprites = new Map<string, Sprite>()
  private _audios = new Map<string, Audio>()

  loadSprite(relativePath: string): Promise<Sprite> {
    if (this.hasSprite(relativePath)) {
      return Promise.resolve(this.getSprite(relativePath) as Sprite)
    }

    const path = `${SPRITES_PREFIX}${relativePath}`
    if (!supportSpriteExt(path))
      return Promise.reject(
        `resource: load image ${path} error, not support ext.`
      )

    const image = new Image()
    image.src = path

    const promise = new Promise<Sprite>((resolve, reject) => {
      image.addEventListener('load', () => {
        console.log(`resource: load image ${path} success`)
        this._sprites.set(relativePath, image)
        resolve(image)
      })
      image.addEventListener('error', () => {
        reject(`resource: load image ${path} error.`)
      })
    })

    return promise
  }

  loadAudio(): Promise<Audio> {
    return Promise.resolve(new Audio())
  }

  loadJson<T>(relativePath: string): Promise<T> {
    const path = `${ASSETS_PREFIX}${relativePath}`

    return fetch(path)
      .then((data) => {
        return data.json()
      })
      .catch((error) => {
        return Promise.reject(`resource: load json ${path} error, ${error}`)
      })
  }

  hasSprite(key: string): boolean {
    return this._sprites.has(key)
  }

  getSprite(key: string): HTMLImageElement | undefined {
    return this._sprites.get(key)
  }
}

export default Resource
