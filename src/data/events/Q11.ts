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
    if (money > hero().gold) {
      await talk('*', 'NotEnoughMoney')
      break
    }
    hero().gold -= money
    select = await talk('*', 'Q11_1', false, true)
  }
  await talk('*', 'Q11_N')
  showGoldWindow(false)
})
