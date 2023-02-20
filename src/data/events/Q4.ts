task(async (event) => {
  showGoldWindow(true)
  const money = event.args[0]
  await talk('*', 'Q4_0')
  const select = await talkWithArgs({
    characterName: '*',
    text: 'Q4_1',
    select: true,
    textArgs: [['{money}', money]],
  })
  if (!select) {
    await talk('*', 'Q4_N')
  } else {
    const gold = hero().gold
    if (gold < money) {
      await talk('*', 'Q4_N_MONEY')
      await talk('*', 'Q4_N')
    } else {
      hero().gold -= money
      rest()
      const audios = executingEngine.audios
      audios.pauseBGM()
      await fading({ type: 'in', duration: 1000 })
      audios.playME('se/inn.mp3')
      await delay(3000)
      await fading({ type: 'out', duration: 1000 })
      audios.replayBGM()
      await talk('*', 'Q4_Y1')
    }
  }
  showGoldWindow(false)
})
