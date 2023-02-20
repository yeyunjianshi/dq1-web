task(async () => {
  await message('Q50_0')
  await talkWithArgs({
    characterName: 'luola',
    text: 'Q50_1',
    textArgs: [['{nextExp}', hero().nextExp]],
  })
  await talkWithArgs({
    characterName: 'luola',
    text: 'Q50_2',
    textArgs: [
      ['{coordX}', headCoord()[0]],
      ['{coordY}', headCoord()[1]],
    ],
  })
  await talk('luola', 'Q50_3')
})
