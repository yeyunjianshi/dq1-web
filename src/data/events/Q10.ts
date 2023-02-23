task(async (event) => {
  showGoldWindow(true)
  const money = event.args[0]
  let select = await talkWithArgs({
    characterName: '*',
    text: 'Q10_0',
    select: true,
    textArgs: [['{money}', money]],
  })
  while (select) {
    if (checkInventoryIsFull(4, 1)) {
      await talk('*', 'InventoryIsFull')
      break
    }
    if (money > hero().gold) {
      await talk('*', 'NotEnoughMoney')
      break
    }
    hero().gold -= money
    addItems(4)
    select = await talk('*', 'Q10_1', false, true)
  }
  await talk('*', 'Q10_2')
  showGoldWindow(false)
})
