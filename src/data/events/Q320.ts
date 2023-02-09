task(async () => {
  await message('Q320_0')
  await message('Q320_1')
  if (checkInventoryIsFull(502)) {
    await message('InventoryIsFull')
    return
  }
  addItems(502)
  audio().pauseBGM()
  audio().playME('se/important_item.mp3')
  await delay(2000)
  audio().replayBGM()
  finishQuestEvents('Q320')
})
