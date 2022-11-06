import './style.css'
import { createEngine } from './engine/engine'
import { AssetLoadStatus } from './engine/resource'
import TestData from './data/test_battle.json'
import { assetLoader, parseScene } from './engine/parser'
import './gameplay/componentConfig'

const engine = createEngine()
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

document.getElementById('startBtn')?.addEventListener('click', () => {
  engine.audios.replayBGM()
})

const GameStart = () => {
  engine.init()
  render()
}
GameStart()
