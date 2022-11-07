import './style.css'
import { createEngine } from './engine/engine'
import TestData from './data/test_npc.json'
import BattleData from './data/test_battle.json'
import TeamController from './data/team_controller.json'
import './gameplay/componentConfig'
import { AddGameSceneData } from './engine/sceneManager'

AddGameSceneData([TestData, TeamController, BattleData as any])

const engine = createEngine()

engine.sceneManager.loadScene('TeamController')
engine.sceneManager.loadScene('NPCScene')

engine.init()
engine.run()

document.getElementById('startBtn')?.addEventListener('click', () => {
  engine.audios.replayBGM()
})
