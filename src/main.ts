import './style.css'
import { createEngine } from './engine/engine'
import './gameplay/componentConfig'
import { AssetLoader } from './engine/resource'
import { audioInitLoad } from './gameplay/audio/AudioConfig'
import {
  battle,
  currentScene,
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
import { initScene } from './gameplay/init'
import type { MagicData as MagicDataType } from './gameplay/asset/magic'
import type { EnemyData as EnemyDataType } from './gameplay/asset/gameData'

SetCharacters((AllCharactersData as CharacterData[]).map(parseCharacter))
SetItems((AllItemData as ItemData[]).map(parseItem))
SetShopItems(ShopData)
SetEneies(EnemyData as unknown as EnemyDataType[])
SetMagics(MagicData as MagicDataType[])
globalGameData.startGame()

const engine = createEngine()
engine.renderer.registerPostProcess(new TorchPostProcess(engine))
setEventEngine(engine)

const { resource } = engine
const assetLoader = new AssetLoader()
assetLoader.addAssets(
  audioInitLoad(resource),
  resource
    .loadJson<Record<string, string>>('events.json')
    .then((events) => SetGameEventScript(events)),
  engine.i18n
    .loadLanguageEntries(engine.i18n.language, resource)
    .then((entries) => {
      engine.i18n.setLanguageAndEntries(engine.i18n.language, entries)
    })
)

initScene(engine)

engine.init()
engine.run({
  afterTime: (engine) => {
    globalGameData.gameplayTime += engine.time.deltaTime
  },
})

initDevEnv()

function initDevEnv() {
  const isDev = import.meta.env.DEV
  const btn = document.getElementById('startBtn') as HTMLButtonElement
  btn.style.display = isDev ? 'block' : 'none'

  setTimeout(() => {
    battle(1)
  }, 1000)

  btn.addEventListener('click', () => {
    engine.audios.playBGM(currentScene().bgm)
  })
}
