import { AddGameSceneData } from '@engine/sceneManager'

import TantegelCastleScene from '@data/scenes/TantegelCastle.tmj'
import TantegelCastle2Scene from '@data/scenes/TantegelCastle2.json'
import MairaScene from '@data/scenes/Maira.tmj'
import Mercdo1Scene from '@data/scenes/Mercado1.tmj'
import Mercdo2Scene from '@data/scenes/Mercado2.tmj'
import Mercdo3Scene from '@data/scenes/Mercado3.tmj'
import RimuldarScene from '@data/scenes/Rimuldar.tmj'
import RadatomeScene from '@data/scenes/Radatome.tmj'
import DomdoraScene from '@data/scenes/Domdora.tmj'

import WorldScene from '@data/scenes/World.tmj'

import HolyShrine1Scene from '@data/scenes/HolyShrine1.tmj'
import HolyShrine2Scene from '@data/scenes/HolyShrine2.tmj'
import RainShrine1Scene from '@data/scenes/RainShrine1.tmj'
import RainShrine2Scene from '@data/scenes/RainShrine2.tmj'

import RotosCave1Scene from '@data/scenes/RotosCave1.tmj'
import RotosCave2Scene from '@data/scenes/RotosCave2.tmj'
import MarshyCaveScene from '@data/scenes/MarshyCave.tmj'
import Garais1Scene from '@data/scenes/Garais1.tmj'
import Garais2Scene from '@data/scenes/Garais2.tmj'
import Garais3Scene from '@data/scenes/Garais3.tmj'
import Garais4Scene from '@data/scenes/Garais4.tmj'
import Mercado1Scene from '@data/scenes/Mercado1.tmj'
import Mercado2Scene from '@data/scenes/Mercado2.tmj'
import Mercado3Scene from '@data/scenes/Mercado3.tmj'
import RockyCave1Scene from '@data/scenes/RockyCave1.tmj'
import RockyCave2Scene from '@data/scenes/RockyCave2.tmj'
import DracolordsCastle1Scene from '@data/scenes/DracolordsCastle1.tmj'
import DracolordsCastle2Scene from '@data/scenes/DracolordsCastle2.tmj'
import DracolordsCastle3Scene from '@data/scenes/DracolordsCastle3.tmj'
import DracolordsCastle4Scene from '@data/scenes/DracolordsCastle4.tmj'
import DracolordsCastle5Scene from '@data/scenes/DracolordsCastle5.tmj'
import DracolordsCastle6Scene from '@data/scenes/DracolordsCastle6.tmj'
import DracolordsCastle7Scene from '@data/scenes/DracolordsCastle7.tmj'
import DracolordsCastle8Scene from '@data/scenes/DracolordsCastle8.tmj'

import TitleScene from '@data/scenes/Title.json'
import BattleData from '@data/scenes/battle.json'
import GlobalScene from '@data/scenes/globalWindow.json'
import TeamController from '@data/scenes/team_controller.json'
import Engine from '@engine/engine'

AddGameSceneData([
  TantegelCastleScene,
  TantegelCastle2Scene,
  RadatomeScene,
  MairaScene,
  Mercdo1Scene,
  Mercdo2Scene,
  Mercdo3Scene,
  RimuldarScene,
  DomdoraScene,

  HolyShrine1Scene,
  HolyShrine2Scene,
  RainShrine1Scene,
  RainShrine2Scene,

  RotosCave1Scene,
  RotosCave2Scene,
  MarshyCaveScene,
  Garais1Scene,
  Garais2Scene,
  Garais3Scene,
  Garais4Scene,
  Mercado1Scene,
  Mercado2Scene,
  Mercado3Scene,
  RockyCave1Scene,
  RockyCave2Scene,
  DracolordsCastle1Scene,
  DracolordsCastle2Scene,
  DracolordsCastle3Scene,
  DracolordsCastle4Scene,
  DracolordsCastle5Scene,
  DracolordsCastle6Scene,
  DracolordsCastle7Scene,
  DracolordsCastle8Scene,

  WorldScene,
  TitleScene,
  TeamController,
  GlobalScene,
  BattleData as any,
])

export function initScene(engine: Engine) {
  engine.sceneManager.loadScene('Global')
  engine.sceneManager.loadScene('TeamController')
  engine.sceneManager.loadScene('World')
  // engine.sceneManager.loadScene('Battle')
  // engine.sceneManager.loadScene('Title')

  // engine.sceneManager.loadScene('TantegelCastle1')
  // engine.sceneManager.loadScene('TantegelCastle2')
  // engine.sceneManager.loadScene('Maira')
  // engine.sceneManager.loadScene('Rimuldar')
  // engine.sceneManager.loadScene('Radatome')
  // engine.sceneManager.loadScene('Domdora')

  // engine.sceneManager.loadScene('HolyShrine1')
  // engine.sceneManager.loadScene('HolyShrine2')
  // engine.sceneManager.loadScene('RainShrine1')
  // engine.sceneManager.loadScene('RainShrine2')

  // engine.sceneManager.loadScene('RotosCave1')
  // engine.sceneManager.loadScene('RotosCave2')
  // engine.sceneManager.loadScene('MarshyCave')

  // engine.sceneManager.loadScene('Garais1Scene')
  // engine.sceneManager.loadScene('Garais2Scene')
  // engine.sceneManager.loadScene('Garais3Scene')
  // engine.sceneManager.loadScene('Garais4Scene')
  // engine.sceneManager.loadScene('Mercado1Scene')
  // engine.sceneManager.loadScene('Mercado2Scene')
  // engine.sceneManager.loadScene('Mercado3Scene')
  // engine.sceneManager.loadScene('RockyCave1Scene')
  // engine.sceneManager.loadScene('RockyCave2Scene')
  // engine.sceneManager.loadScene('DracolordsCastle1Scene')
  // engine.sceneManager.loadScene('DracolordsCastle2Scene')
  // engine.sceneManager.loadScene('DracolordsCastle3Scene')
  // engine.sceneManager.loadScene('DracolordsCastle4Scene')
  // engine.sceneManager.loadScene('DracolordsCastle5Scene')
  // engine.sceneManager.loadScene('DracolordsCastle6Scene')
  // engine.sceneManager.loadScene('DracolordsCastle7Scene')
  // engine.sceneManager.loadScene('DracolordsCastle8Scene')
}