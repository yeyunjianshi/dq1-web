import Character from '../asset/character'

export default class BattleCharacter {
  constructor(public character: Character) {}

  get name() {
    return this.character.name
  }

  get maxHP() {
    return this.character.maxHP
  }

  get maxMP() {
    return this.character.maxMP
  }

  get HP() {
    return this.character.HP
  }

  get attack() {
    return this.character.attack
  }

  get defend() {
    return this.character.defend
  }

  get speed() {
    return this.character.speed
  }
}
