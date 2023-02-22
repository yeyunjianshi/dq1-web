task(async () => {
  await talk('dragon_king', 'Q7000_0')
  await talk('dragon_king', 'Q7000_1')
  await talk('dragon_king', 'Q7000_2')

  let select = await talkWithArgs({
    characterName: 'dragon_king',
    text: 'Q7000_3',
    select: true,
  })
  if (!select) {
    select = await talkWithArgs({
      characterName: 'dragon_king',
      text: 'Q7000_4',
      select: true,
    })
  }
  console.log(select)
  if (select) {
    await talk('dragon_king', 'Q7000_5')
    await message('Q7000_6')
    await talk('dragon_king', 'Q7000_7')
    await talk('dragon_king', 'Q7000_8')
    await talk('dragon_king', 'Q7000_9')
    await talk('dragon_king', 'Q7000_10')
    await talk('dragon_king', 'Q7000_11')
    transitionTo('End')
    return
  }

  await talk('dragon_king', 'Q7000_12')
  await talk('dragon_king', 'Q7000_13')

  // 战斗
  const victory = true
  if (victory) {
    getQuestNPC().root.active = false

    await message('Q7000_14')
    await message('Q7000_15')
    await flashing({ duration: 3000, times: 1, color: '#EEEEEE88' })
    await message('Q7000_16')
    finishQuestEvents('Q888')
    await transitionTo('World', 'DracolordsCastle1')
    setInputType(InputType.Move)
  }
})
