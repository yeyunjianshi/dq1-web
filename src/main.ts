import { createDefaultEngine } from './engine/engine'
import GameObject from './engine/gameObject'
import AbsoluteLayout from './engine/layout/AbsoluteLayout'
import VerticalLayout from './engine/layout/VerticalLayout'
import {
  AssetLoader,
  AssetLoadStatus,
  supportSpriteExt,
} from './engine/resource'
import Scene from './engine/scene'
import './style.css'
import TestData from './data/test_npc.json'
import GridLayout from './engine/layout/GridLayout'

const assetLoader = new AssetLoader()
const engine = createDefaultEngine()

let id = 0

const parseLayout = (
  root: GameObject,
  layoutData: LayoutConfig = { type: 'AbsoluteLayout' }
): ILayout => {
  if (layoutData.type === 'VerticalLayout')
    return new VerticalLayout(root, layoutData)
  else if (layoutData.type === 'GridLayout')
    return new GridLayout(root, layoutData)

  return new AbsoluteLayout(root)
}

const parseGameObject = (
  data: GameObjectData,
  parent: GameObject | null
): GameObject => {
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

  if (
    typeof data.background === 'string' &&
    supportSpriteExt(data.background)
  ) {
    gameObject.background.name = data.background
  } else if (typeof data.background === 'object') {
    gameObject.background = {
      name: data.background.sprite,
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
        .then((sprite) => (gameObject.background!.sprite = sprite))
    )
  }

  if (data.children) {
    gameObject.children = data.children.map((childData) => {
      return parseGameObject(childData, gameObject)
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

const parseScene = (data: SceneData) => {
  const scene = new Scene(data.name, parseGameObject(data.root, null), engine)
  scene.width = data.width ?? -1
  scene.height = data.height ?? -1
  return scene
}

const scene = parseScene(TestData as SceneData)

const render = (time = 0) => {
  // console.log(`frame render: ${time}`)
  engine.time.tick()
  engine.input.tick()
  engine.renderer.render(() => {
    if (scene.loaded) scene.tick()
    // engine.renderer.drawText()
  })
  requestAnimationFrame(render)
}

assetLoader.assetEvent.addListener((status) => {
  if (status === AssetLoadStatus.SUCCESS) {
    scene.loaded = true
    scene.show()
    scene.start()
  }
})
assetLoader.load()

const GameStart = () => {
  engine.init()
  render()
}
GameStart()

// const renderer = new CanvasRenderer('core')

// const mapKey = 'world_map.png'
// const resource = new Resource()
// const mapPromise = resource
//   .loadSprite(mapKey)
//   .then((image) => console.log(image.naturalHeight))

// const assetLoader = new AssetLoader().addAssets(mapPromise)
// assetLoader.assetEvent.addListener((status) => {
//   if (status == AssetLoadStatus.SUCCESS) {
//     console.log(resource.hasSprite(mapKey))
//     renderer.render(() => {
//       renderer.drawSprite(resource.getSprite(mapKey) as Sprite, 1, 0, 0)
//     })
//   }
// })

// assetLoader.load()
