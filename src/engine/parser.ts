import Engine from './engine'
import GameObject from './gameObject'
import AbsoluteLayout from './layout/AbsoluteLayout'
import GridLayout from './layout/GridLayout'
import VerticalLayout from './layout/VerticalLayout'
import { AssetLoader, supportSpriteExt } from './resource'
import Scene from './scene'

export const assetLoader = new AssetLoader()
export let id = 0

export function parseLayout(
  root: GameObject,
  layoutData: LayoutConfig = { type: 'AbsoluteLayout' }
): ILayout {
  if (layoutData.type === 'VerticalLayout')
    return new VerticalLayout(root, layoutData)
  else if (layoutData.type === 'GridLayout') {
    const gridLayout = new GridLayout(root, layoutData)
    if (layoutData.template) {
      root.children = []
      assetLoader.addAssets(
        root.engine.resource
          .loadJson<GameObjectData>(layoutData.template)
          .then((data) => {
            gridLayout.initTemplate(data)
          })
      )
    }
    return gridLayout
  }

  return new AbsoluteLayout(root)
}

export function parseGameObject(
  data: GameObjectData,
  parent: GameObject | null,
  parentEngine?: Engine
): GameObject {
  if (parent !== null) {
    parentEngine = parent.engine
  }

  if (parentEngine === null) {
    throw new Error(`解析GameObject数据失败，未设置引擎`)
  }

  const engine = parentEngine as Engine

  const gameObject = new GameObject(
    parent,
    data.name ?? `GameObject${id++}`,
    null,
    engine
  )
  gameObject.configLayout = parseLayout(gameObject, data.layout)
  gameObject.localX = data.x
  gameObject.localY = data.y
  gameObject.configWidth = data.width
  gameObject.configHeight = data.height
  gameObject.active = data.active
  gameObject.alpha = data.alpha ?? 1
  gameObject.layoutGravity = data.layoutGravity ?? ['left', 'top']
  gameObject.pivot = data.pivot ?? [0, 0]

  if (
    typeof data.background === 'string' &&
    supportSpriteExt(data.background)
  ) {
    gameObject.background.name = data.background
  } else if (typeof data.background === 'object') {
    gameObject.background = {
      name: data.background.sprite,
      spriteWidth:
        data.background.spriteWidth ?? gameObject.background.spriteWidth,
      spriteHeight:
        data.background.spriteHeight ?? gameObject.background.spriteHeight,
      scaleType: data.background.scaleType ?? gameObject.background.scaleType,
      color: data.background.backgroundColor ?? gameObject.background.color,
      border: {
        width:
          data.background.borderWidth ?? gameObject.background.border.width,
        color:
          data.background.borderColor ?? gameObject.background.border.color,
        radius: data.background.radius ?? gameObject.background.border.radius,
      },
      pivotOffset:
        data.background.pivotOffset ?? gameObject.background.pivotOffset,
      alpha: data.background.alpha ?? gameObject.background.alpha,
    }
  }

  if (gameObject.background && gameObject.background.name) {
    assetLoader.addAssets(
      engine.resource
        .loadSprite(gameObject.background.name)
        .then((sprite) => (gameObject.background.sprite = sprite))
    )
  }

  if (data.children) {
    gameObject.children = data.children.map((childData) => {
      return parseGameObject(childData, gameObject, engine)
    })
  }

  if (data.components) {
    gameObject.components = data.components
      .filter(
        (script) =>
          script.type.trim() &&
          engine.componentContainer.has(script.type.trim())
      )
      .map((script) => {
        const com = new (engine.componentContainer.get(
          script.type.trim()
        ) as ComponentConstruct)(gameObject)
        com.parseData(assetLoader, script)
        return com
      })
  }

  return gameObject
}

export function parseScene(data: SceneData, engine: Engine) {
  const scene = new Scene(
    data.name,
    parseGameObject(data.root, null, engine),
    engine
  )
  scene.width =
    data.width && data.width >= 0 ? data.width : engine.renderer.width
  scene.height =
    data.height && data.height >= 0 ? data.height : engine.renderer.height
  return scene
}