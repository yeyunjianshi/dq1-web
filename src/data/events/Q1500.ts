task(async () => {
  const princess = getQuestNPC('PrincessQ1500')
  const heroMove = teamController()
  heroMove.moveSpeed = 16
  princess.moveSpeed = 8

  if (hasQuestEvents('Q665')) {
    finishQuestEvents('Q666')

    await talk('king', 'Q1500_0')
    princess.root.active = true
    changeHeroRoleId(0)
  }

  await talk('king', 'Q1500_1')
  await talk('king', 'Q1500_2')
  await talk('king', 'Q1500_3')
  await talk('king', 'Q1500_4')
  await talk('king', 'Q1500_5')
  await message('Q1500_6')
  await talk(heroName(), 'Q1500_7')
  await talk('king', 'Q1500_8')
  await talk('king', 'Q1500_9')

  if (hasQuestEvents('Q666')) {
    let select = false
    await talk('luola', 'Q1500_10')
    while (!select) {
      await talk('luola', 'Q1500_11')
      select = await talkWithArgs({
        characterName: 'luola',
        text: 'Q1500_12',
        select: true,
      })
      if (!select) await talk('luola', 'Q1500_13')
      else await talk('luola', 'Q1500_14')
    }
  }
  await talk('king', 'Q1500_15')

  Array(8)
    .fill(1)
    .map((_, i) => getQuestNPC(`bingshi_${i}`))
    .forEach((v) => (v.roleIndex = 20))

  if (hasQuestEvents('666')) await princess.smoothMoveToCoord([0, 1])

  teamController().smoothMoveToCoord([17, 20])
  await princess.smoothMoveToCoord([0, 6])
})
