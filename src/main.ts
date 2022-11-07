import './style.css'
import { createEngine } from './engine/engine'
import TestData from './data/test_npc.json'
import './gameplay/componentConfig'
import { AddGameSceneData } from './engine/sceneManager'

AddGameSceneData([TestData])

const engine = createEngine()

engine.sceneManager.loadScene('NPCScene')

engine.init()
engine.run()

document.getElementById('startBtn')?.addEventListener('click', () => {
  engine.audios.replayBGM()
})
