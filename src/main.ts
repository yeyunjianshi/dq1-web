import './style.css'
import { createEngine } from './engine/engine'
import TestData from './data/test_npc.json'
import BattleData from './data/test_battle.json'
import GlobalScene from './data/global.json'
import TeamController from './data/team_controller.json'
import './gameplay/componentConfig'
import { AddGameSceneData } from './engine/sceneManager'
import { AssetLoader } from './engine/resource'
import { SetGameEventScript } from './engine/components/events/EventExector'

AddGameSceneData([TestData, TeamController, GlobalScene, BattleData as any])

const engine = createEngine()

const assetLoader = new AssetLoader()
assetLoader.addAssets(
  engine.resource
    .loadJson<Record<string, string>>('events.json')
    .then((events) => SetGameEventScript(events))
)

engine.sceneManager.loadScene('Global')
engine.sceneManager.loadScene('TeamController')
engine.sceneManager.loadScene('NPCScene')

engine.init()
engine.run()

document.getElementById('startBtn')?.addEventListener('click', () => {
  engine.audios.replayBGM()
})
