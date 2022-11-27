import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import { message } from '../events/EventExector'
import ListComponent, {
  KeyValueAdapter,
  TextAdapter,
} from '../../engine/components/ListComponent'
import { useTextPostProcessing } from '../../engine/helper'
import { globalGameData } from '../asset/gameData'
import { CommandTriggerType, CommandTriggerWhen } from '../effects/buffer'
import { DefaultRemoveEquipItemSlot, ItemSlot } from '../inventory/inventory'
import { ItemEquipmentType } from '../inventory/item'

@GameplayComponent
export default class MenuItemWindow extends BaseWindow {
  private _selectWindow?: ListComponent
  private _dealWindow?: ListComponent

  private _selecting = true

  start() {
    this._selectWindow = this.root.getComponentInChildByName(
      'menuItemSelectWindow',
      ListComponent
    ) as ListComponent
    this._dealWindow = this.root.getComponentInChildByName(
      'menuItemDealWindow',
      ListComponent
    ) as ListComponent

    this.enable = false
    this._selectWindow!.enable = false
    this._dealWindow!.enable = false

    this.init()
  }

  private _dealData = [] as { text: string; command: string }[]
  private _itemData = [] as ItemSlot[]
  private _selectedItem?: ItemSlot

  private init() {
    this.setSelectItem(this._selecting)

    const equipAdapter = new KeyValueAdapter([])

    this._selectWindow?.setAdapter(equipAdapter)
    this._selectWindow?.addSelectListener((_, pos) => {
      this._selectedItem = this._itemData[pos]
      if (
        this._selectedItem.item.isCanEquip ||
        this._selectedItem.item.isCanCommonUse ||
        this._selectedItem.item.isCanDiscard
      ) {
        this.setSelectItem(false)
        this.refreshDealData()
        this._dealWindow?.setCursorIndex(0)
      }
    })

    const dealAdapter = new TextAdapter([])
    this._dealWindow?.setAdapter(dealAdapter)
    this._dealWindow?.addSelectListener((_, pos) => {
      if (!this._selectedItem) return

      const command = this._dealData[pos].command
      if (command === 'equip') {
        globalGameData.heroEquip(this._selectedItem)
      } else if (command === 'removeEquipment') {
        globalGameData.heroEquip(
          DefaultRemoveEquipItemSlot,
          this._selectedItem.item.type as ItemEquipmentType
        )
      } else if (command === 'discard') {
        globalGameData.inventoryRemoveItemSlotById(this._selectedItem.id)
        this.setSelectItem(true)
        this.refreshItemData()
      } else if (command === 'use') {
        const item = globalGameData.inventory.getItem(this._selectedItem.id)
        const useText =
          item.useEffects
            .map((effect) => {
              return effect.execute(
                CommandTriggerWhen.Common,
                CommandTriggerType.Use
              )
            })
            .filter((s) => s.trim().length > 0)
            .join('\n') || item.useCommonText.trim()

        if (useText.length > 0) {
          message(
            useTextPostProcessing(useText, globalGameData.hero.name),
            async () => {
              globalGameData.inventory.removeSlotId(this._selectedItem!.id)
              this.setSelectItem(true)
              this.refreshDealData()
              this.refreshItemData()
            }
          )
        }
      }
      this.setSelectItem(true)
      this.refreshDealData()
      this.refreshItemData()
    })

    this.refreshDealData()
    this.refreshItemData()
  }

  private refreshDealData() {
    this._dealData.splice(0, this._itemData.length)

    if (this._selectedItem) {
      if (this._selectedItem.item.isEquipment) {
        this._dealData.push(
          this._selectedItem.isEquip
            ? { text: '卸下', command: 'removeEquipment' }
            : { text: '装备', command: 'equip' }
        )
      } else if (this._selectedItem.item.isCanCommonUse) {
        this._dealData.push({ text: '使用', command: 'use' })
      }
      if (this._selectedItem.item.isCanDiscard)
        this._dealData.push({ text: '丢弃', command: 'discard' })

      this._dealWindow!.adapter<TextAdapter>()!.setData([...this._dealData])
    }
  }

  private refreshItemData() {
    this._itemData.splice(0, this._itemData.length)
    this._itemData.push(...globalGameData.inventory.all())

    this._selectWindow!.adapter<KeyValueAdapter>()!.setData(
      this._itemData.map((slot) => ({
        key: slot.item.name,
        value: slot.isEquip ? 'E' : '',
      }))
    )
  }

  get hero() {
    return globalGameData.hero
  }

  show(init?: boolean): void {
    super.show(init)
    this.refreshItemData()
    this._selectWindow?.setCursorIndex(0)
    this.setSelectItem(true)
  }

  update(): void {
    if (this._selecting) this._selectWindow?.update()
    else this._dealWindow?.update()
  }

  setSelectItem(select: boolean) {
    this._selecting = select
    if (select) {
      this._selectWindow!.setSelecting(true)
      this._dealWindow!.root.active = false
    } else {
      this._selectWindow!.setSelecting(false)
      this._dealWindow!.root.active = true
    }
  }

  interceptCancel(): boolean {
    if (!this._selecting) {
      this.setSelectItem(true)
      return true
    }
    return false
  }
}
