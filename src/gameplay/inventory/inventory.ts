import { GetItem } from '../asset/gameData'
import Item, { ItemType, parseItem } from './item'

export type ItemSlot = {
  id: number
  item: Item
  isEquip: boolean
  count: number
}

// 显示装备无的插槽
export const DefaultNoneItemSlot: ItemSlot = {
  id: 0,
  item: parseItem({ id: 0, name: '无', price: 0, sellPrice: 0, type: 15 }),
  isEquip: false,
  count: 0,
}

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
  count: 0,
}

export default class Inventory {
  constructor(public capacity: number = 10) {}

  private _slots = [] as ItemSlot[]

  addItem(item: number | Item): ItemSlot {
    if (typeof item === 'number') {
      item = GetItem(item)
    }

    let slot
    if (item.isGroup) {
      slot = this.getItemSlotByItemId(item.id)
      if (slot !== DefaultNoneItemSlot) {
        slot.count++
        return slot
      }
    }
    slot = { id: this.generateSlotId(), item, count: 1, isEquip: false }
    this._slots.push(slot)
    this.sort()
    return slot
  }

  hasItem(itemId: number): boolean {
    return this._slots.some((slot) => slot.item.id === itemId)
  }

  getItem(id: number): Item {
    return this.getItemSlot(id).item
  }

  getItemSlot(id: number): ItemSlot {
    return this._slots.find((slot) => slot.id === id) ?? DefaultNoneItemSlot
  }

  getItemSlotByItemId(id: number) {
    return (
      this._slots.find((slot) => slot.item.id === id) ?? DefaultNoneItemSlot
    )
  }

  filterItemType(type: ItemType): ItemSlot[] {
    return this._slots.filter((slot) => (slot.item.type & type) > 0)
  }

  generateSlotId(): number {
    let newId = 0
    do {
      newId = Math.floor(Math.random() * 1000000) + 10000
    } while (this._slots.some((slot) => slot.id === newId))
    return newId
  }

  removeSlotIndex(index: number): void {
    this._slots.splice(index, 1)
  }

  removeSlotId(id: number, count = 1): void {
    const removeIndex = this._slots.findIndex((slot) => slot.id === id)
    if (removeIndex >= 0) {
      const slot = this._slots[removeIndex]
      if (slot.item.isGroup) {
        slot.count -= count
        if (slot.count > 0) return
      }
      this.removeSlotIndex(removeIndex)
    }
  }

  removeItemId(id: number, count = 1) {
    const removeIndex = this._slots.findIndex((slot) => slot.item.id === id)
    if (removeIndex >= 0) {
      this.removeSlotId(this._slots[removeIndex].id, count)
    }
  }

  sort(): void {
    this._slots.sort((a, b) => {
      if (a.isEquip === b.isEquip) {
        return a.item.id - b.item.id
      } else if (a.isEquip) return -1
      else return 1
    })
  }

  itemCount(itemId: number): number {
    const item = GetItem(itemId)
    if (item.isGroup) return this.getItemSlotByItemId(itemId).count
    return this._slots.filter((slot) => slot.item.id === itemId).length
  }

  isEmpty() {
    return this._slots.length === 0
  }

  isFull(itemId: number, count = 1) {
    const slot = this.getItemSlotByItemId(itemId)
    if (slot !== DefaultNoneItemSlot)
      if (slot.item.isGroup) return slot.count + count > slot.item.capacity
    return this._slots.length === this.capacity
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

  toSaveData(): SaveItemSlot[] {
    return this._slots.map((v) => ({
      id: v.id,
      itemId: v.item.id,
      count: v.count,
      isEquip: v.isEquip,
    }))
  }

  static parseFromSaveData(slots: SaveItemSlot[]) {
    const inventory = new Inventory()
    inventory._slots = slots.map((s) => ({
      id: s.id,
      item: GetItem(s.itemId),
      isEquip: s.isEquip,
      count: s.count,
    }))
    return inventory
  }
}

export type SaveItemSlot = Omit<ItemSlot, 'item'> & { itemId: number }
