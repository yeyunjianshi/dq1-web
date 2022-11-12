import { GetItem } from '../asset/gameData'
import Item, { ItemType, parseItem } from './item'

export type ItemSlot = {
  id: number
  item: Item
  isEquip: boolean
}

// 显示装备无的插槽
export const DefaultNoneItemSlot: ItemSlot = {
  id: 0,
  item: parseItem({ id: 0, name: '无', price: 0, sellPrice: 0, type: 15 }),
  isEquip: false,
}

// 显示装备卸下装备的插槽
// export const [
//   DefaultRemoveWeaponItemSlot,
//   DefaultRemoveBodyItemSlot,
//   DefaultRemoveShieldItemSlot,
//   DefaultRemoveAccessoriesItemSlot,
// ] = [ItemType.Weapon, ItemType.Body, ItemType.Shield, ItemType.Accessories].map(
//   (itemType: ItemType, i: number) => {
//     return {
//       id: 1 + i,
//       item: parseItem({
//         id: 10000,
//         name: '卸下',
//         price: 0,
//         sellPrice: 0,
//         type: itemType,
//       }),
//       isEquip: false,
//     }
//   }
// )
export const DefaultRemoveEquipItemSlot = {
  id: 1,
  item: parseItem({
    id: 10000,
    name: '卸下',
    price: 0,
    sellPrice: 0,
    type: 15,
  }),
  isEquip: false,
}

export default class inventory {
  constructor(public capacity: number = 10) {}

  private _slots = [] as ItemSlot[]

  addItem(item: number | Item) {
    if (typeof item === 'number') {
      item = GetItem(item)
    }
    this._slots.push({
      id: this.generateSlotId(),
      item,
      isEquip: false,
    })
    this.sort()
  }

  getItem(id: number) {
    return this.getItemSlot(id).item
  }

  getItemSlot(id: number) {
    return this._slots.find((slot) => slot.id === id) ?? DefaultNoneItemSlot
  }

  filterItemType(type: ItemType) {
    return this._slots.filter((slot) => (slot.item.type & type) > 0)
  }

  generateSlotId() {
    let newId = 0
    do {
      newId = Math.floor(Math.random() * 1000000) + 10000
    } while (this._slots.some((slot) => slot.id === newId))
    return newId
  }

  removeSlotIndex(index: number) {
    this._slots.splice(index, 1)
  }

  removeSlotId(id: number) {
    const removeIndex = this._slots.findIndex((slot) => slot.id === id)
    if (removeIndex >= 0) this.removeSlotIndex(removeIndex)
  }

  sort() {
    this._slots.sort((a, b) => {
      if (a.isEquip === b.isEquip) {
        return a.item.id - b.item.id
      } else if (a.isEquip) return -1
      else return 1
    })
  }

  all() {
    return this._slots
  }
  weapons() {
    return this._slots.find((slot) => slot.item.isWeapon)
  }
  bodies() {
    return this._slots.find((slot) => slot.item.isBody)
  }
  shields() {
    return this._slots.find((slot) => slot.item.isShield)
  }
  accessories() {
    return this._slots.find((slot) => slot.item.isAccessories)
  }
}
