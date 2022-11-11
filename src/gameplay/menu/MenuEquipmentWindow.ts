import { GameplayComponent } from '../../engine/components'
import BaseWindow from '../../engine/components/BaseWindow'
import ListComponent, {
  KeyValueAdapter,
} from '../../engine/components/ListComponent'
import TextComponent from '../../engine/components/TextComponent'
import { globalGameData } from '../asset/gameData'
import { DefaultRemoveEquipItemSlot, ItemSlot } from '../inventory/inventory'
import { ItemEquipmentType, ItemType } from '../inventory/item'

@GameplayComponent
export default class MenuEquipmentWindow extends BaseWindow {
  private _leftTopLabelText?: TextComponent
  private _leftTopValueText?: TextComponent
  private _leftWindow?: ListComponent
  private _rightWindow?: ListComponent

  private _selectEquip = true

  start() {
    const leftTopGameObject = this.root.getGameObjectInChildren(
      'menuEquipmentLeftTopWindow'
    )!
    this._leftTopLabelText = leftTopGameObject.children[0].components.find(
      (com) => com instanceof TextComponent
    ) as TextComponent
    this._leftTopValueText = leftTopGameObject.children[1].components.find(
      (com) => com instanceof TextComponent
    ) as TextComponent

    this._leftWindow = this.root.getComponentInChildByName(
      'menuEquipmentLeftWindow',
      ListComponent
    ) as ListComponent
    this._rightWindow = this.root.getComponentInChildByName(
      'menuEquipmentRightWindow',
      ListComponent
    ) as ListComponent

    this.enable = false
    this._leftWindow!.enable = false
    this._rightWindow!.enable = false

    this.init()
  }

  private _equipData = [] as ItemSlot[]
  private _itemData = [] as ItemSlot[]
  private _selectItemType = ItemType.Weapon

  private init() {
    this.setSelectEquip(this._selectEquip)

    const equipAdapter = new KeyValueAdapter([])
    this._leftWindow?.setAdapter(equipAdapter)
    this._leftWindow?.addHoverListenner((_, pos) => {
      if (pos === 0) {
        this.SetLeftTopKeyAndValue('攻', `${this.hero.attack}`)
      } else {
        this.SetLeftTopKeyAndValue('防', `${this.hero.defend}`)
      }
      this._selectItemType = 1 << pos
      this.refreshItemData()
    })
    this._leftWindow?.addSelectListener(() => {
      this.setSelectEquip(false)
      this._rightWindow?.setCursorIndex(0)
    })

    const itemsAdapter = new KeyValueAdapter([])
    this._rightWindow?.setAdapter(itemsAdapter)
    this._rightWindow?.addHoverListenner((_, pos) => {
      const { attack, defend } = this.hero.tryEquipment(
        this._itemData[pos],
        this._selectItemType
      )
      if (this._selectItemType === ItemType.Weapon) {
        this.SetLeftTopKeyAndValue('攻', `${this.hero.attack}→${attack}`)
      } else {
        this.SetLeftTopKeyAndValue('防', `${this.hero.defend}→${defend}`)
      }
    })
    this._rightWindow?.addSelectListener((_, pos) => {
      globalGameData.heroEquip(
        this._itemData[pos],
        this._selectItemType as ItemEquipmentType
      )
      this.setSelectEquip(true)
      this.refreshEquipmentData()
      this.refreshItemData()
    })

    this.refreshEquipmentData()
    this.refreshItemData()
  }

  private refreshEquipmentData() {
    this._equipData.splice(0, this._equipData.length)
    this._equipData.push(
      this.hero.weapon,
      this.hero.body,
      this.hero.shield,
      this.hero.accessories
    )
    const keys = ['武', '身', '盾', '饰']
    this._leftWindow!.adapter<KeyValueAdapter>()!.setData(
      this._equipData.map((slot, i) => ({
        key: keys[i],
        value: slot.item.name,
      }))
    )
  }

  private refreshItemData() {
    this._itemData.splice(0, this._itemData.length)
    this._itemData.push(
      ...globalGameData.inventory.filterItemType(this._selectItemType),
      DefaultRemoveEquipItemSlot
    )

    this._rightWindow!.adapter<KeyValueAdapter>()!.setData(
      this._itemData.map((slot) => ({
        key: slot.item.name,
        value: slot.isEquip ? 'E' : '',
      }))
    )
  }

  private SetLeftTopKeyAndValue(key: string, value: string) {
    this._leftTopLabelText?.setText(`${key}`)
    this._leftTopValueText?.setText(`${value}`)
  }

  get hero() {
    return globalGameData.hero
  }

  show(init?: boolean): void {
    super.show(init)
    this.refreshEquipmentData()
    this.refreshItemData()
    this._leftWindow?.setCursorIndex(0)
    this.setSelectEquip(true)
  }

  update(): void {
    if (this._selectEquip) this._leftWindow?.update()
    else this._rightWindow?.update()
  }

  setSelectEquip(s: boolean) {
    this._selectEquip = s
    if (s) {
      this._leftWindow!.setSelecting(true)
      this._rightWindow!.setCanSelect(false)
    } else {
      this._leftWindow!.setSelecting(false)
      this._rightWindow!.setCanSelect(true)
    }
  }

  interceptCancel(): boolean {
    if (!this._selectEquip) {
      this.setSelectEquip(true)
      return true
    }
    return false
  }
}
