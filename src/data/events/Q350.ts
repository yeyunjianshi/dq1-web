task(async () => {
  await message('Q350')

  const coord = headCoord()
  if (coord[0] === 69 && coord[1] === 53) {
    globalWindow().clearWindows()
    audio().pauseBGM()
    audio().playME('se/rainbow.mp3')
    await delay(6000)
    audio().replayBGM()
    removeItems(507)
    finishQuestEvents('Q350')
    setTimeout(() => {
      setInputType(InputType.Move)
    })
  } else {
    await message('NotHappenThing')
  }
})
