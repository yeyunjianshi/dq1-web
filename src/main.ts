import { createDefaultEngine } from './engine/engine'
import GameObject from './engine/gameObject'
import AbsoluteLayout from './engine/layout/AbsoluteLayout'
import VerticalLayout from './engine/layout/VerticalLayout'
import { AssetLoader, AssetLoadStatus } from './engine/resource'
import Scene from './engine/scene'
import './style.css'
import TestData from './data/vertical_linear.json'

const assetLoader = new AssetLoader()
const engine = createDefaultEngine()

let id = 0

const parseLayout = (
  root: GameObject,
  layoutData: LayoutData = { type: 'AbsoluteLayout' }
): ILayout => {
  if (layoutData.type === 'AbsoluteLayout') return new AbsoluteLayout(root)
  else if (layoutData.type === 'VerticalLayout') return new VerticalLayout(root)
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
  gameObject.backgroudKey = data.background?.trim() ?? null
  gameObject.alpha = data.alpha ?? 1

  if (gameObject.backgroudKey)
    assetLoader.addAssets(
      engine.resource
        .loadSprite(gameObject.backgroudKey)
        .then((sprite) => (gameObject.background = sprite))
    )

  if (data.children) {
    gameObject.children = data.children.map((childData) => {
      return parseGameObject(childData, gameObject)
    })
  }

  if (data.components) {
    // gameObject.components = data.components
    //   .filter(
    //     (script) =>
    //       script.type.trim() &&
    //       engine.componentContainer.has(script.type.trim())
    //   )
    //   .map((script) => {
    //     const com = new (engine.componentContainer.get(script.type.trim())!)(
    //       gameObject
    //     )
    //     com.parseData(assetLoader, script)
    //     return com
    //   })
  }

  return gameObject
}

const parseScene = (data: SceneData) => {
  return new Scene(data.name, parseGameObject(data.root, null), engine)
}

const scene = parseScene(TestData as SceneData)

const render = (time = 0) => {
  console.log(`frame render: ${time}`)
  engine.time.tick()
  engine.renderer.render(() => {
    if (scene.loaded) scene.tick()
  })
  requestAnimationFrame(render)
}

assetLoader.assetEvent.addListener((status) => {
  if (status === AssetLoadStatus.SUCCESS) {
    scene.loaded = true
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
