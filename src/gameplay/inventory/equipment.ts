import Item from './item'

export class Equipment extends Item {
  isCanEquipment = true
}

export class Weapon extends Equipment {
  isCanEquipment = true
}
