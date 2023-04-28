export const Audios = {
  Door: 'se/door.mp3',
  Stairs: 'se/stairs.mp3',
  Menu: 'se/menu.mp3',
  Select: 'se/select.mp3',
  Bump: 'se/bump.mp3',
  Chest: 'se/chest.mp3',
  ImportantItem: 'se/important_item.mp3',
  Type: 'se/type.mp3',
  Save: 'se/save.mp3',
  Inn: 'se/inn.mp3',
  Revive: 'se/revive.mp3',
  Dead: 'se/dead.mp3',
  Magic: 'se/magic.mp3',
  Heal: 'se/heal.mp3',
  Rainbow: 'se/rainbow.mp3',
  Attack: 'se/attack.mp3',
  Damage1: 'se/damage1.mp3',
  Damage2: 'se/damage2.mp3',
  Damage3: 'se/damage3.mp3',
  Victory: 'se/victory.mp3',
  LvUp: 'se/lvup.mp3',
}

export function audioInitLoad(resource: IResource) {
  return Promise.allSettled(
    Object.values(Audios).map((audio) => resource.loadAudio(audio))
  )
}
