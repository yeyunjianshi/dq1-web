task(async () => {
  await talk('*', 'Q1122_0')
  const audios = executingEngine.audios
  audios.pauseBGM()
  audios.playME('se/revive.mp3')
  healHP()
  await delay(5000)
  audios.pauseME()
  audios.replayBGM()
  await talk('*', 'Q1122_1')
})
