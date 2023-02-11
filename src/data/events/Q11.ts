task(async (event) => {
  showGoldWindow(true)
  const money = event.args[0]
  let select = await talkWithArgs({
    characterName: '*',
    text: 'Q11_0',
    select: true,
    textArgs: [['{money}', money]],
  })
  while (select) {
    if (checkInventoryIsFull()) {
      await talk('*', 'InventoryIsFull')
      break
    }
    if (money > hero().gold) {
      await talk('*', 'NotEnoughMoney')
      break
    }
    hero().gold -= money
    addItems(50)
    select = await talk('*', 'Q11_1', false, true)
  }
  await talk('*', 'Q11_N')
  showGoldWindow(false)
})
