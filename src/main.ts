import { createDefaultEngine } from './engine/engine'
import { AssetLoadStatus } from './engine/resource'
import './style.css'
import TestData from './data/test_battle.json'
import { assetLoader, parseScene } from './engine/parser'

const engine = createDefaultEngine()
const scene = parseScene(TestData as unknown as SceneData, engine)

const render = () => {
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
