import './style.css'
import { createEngine } from './engine/engine'
import BattleData from './data/test_battle.json'
import GlobalScene from './data/globalWindow.json'
import TeamController from './data/team_controller.json'
import './gameplay/componentConfig'
import { AddGameSceneData } from './engine/sceneManager'
import { AssetLoader } from './engine/resource'
import {
  setEventEngine,
  SetGameEventScript,
} from './gameplay/events/EventExector'
import {
  globalGameData,
  SetCharacters,
  SetEneies,
  SetItems,
  SetMagics,
  SetShopItems,
} from './gameplay/asset/gameData'
import { CharacterData, parseCharacter } from './gameplay/asset/character'
import { ItemData, parseItem } from './gameplay/inventory/item'
import AllCharactersData from '../public/assets/data/characters.json'
import AllItemData from '../public/assets/data/items.json'
import ShopData from '../public/assets/data/shop.json'
import EnemyData from '../public/assets/data/enemies.json'
import MagicData from '../public/assets/data/magic.json'
import TorchPostProcess from './gameplay/postprocess/TorchPostProcess'

import TantegelCastleScene from './data/TantegelCastle.json'
import TantegelCastle2Scene from './data/TantegelCastle2.json'

SetCharacters((AllCharactersData as CharacterData[]).map(parseCharacter))
SetItems((AllItemData as ItemData[]).map(parseItem))
SetShopItems(ShopData)
SetEneies(EnemyData)
SetMagics(MagicData)
AddGameSceneData([
  TantegelCastleScene,
  TantegelCastle2Scene,
  TeamController,
  GlobalScene,
  BattleData as any,
])
globalGameData.startGame()

const engine = createEngine()
engine.renderer.registerPostProcess(new TorchPostProcess(engine))
setEventEngine(engine)

const assetLoader = new AssetLoader()
assetLoader.addAssets(
  engine.resource
    .loadJson<Record<string, string>>('events.json')
    .then((events) => SetGameEventScript(events))
)

engine.sceneManager.loadScene('Global')
engine.sceneManager.loadScene('TeamController')
engine.sceneManager.loadScene('TantegelCastle2')
// engine.sceneManager.loadScene('Battle')

engine.init()
engine.run()

document.getElementById('startBtn')?.addEventListener('click', () => {
  engine.audios.replayBGM()
})
