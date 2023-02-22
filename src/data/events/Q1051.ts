task(async () => {
  const princess = getQuestNPC('PrincessQ1051')
  princess.root.active = true

  changeHeroRoleId(0)

  await talk('king', 'Q1051_0')
  await talk('king', 'Q1051_1')

  await talk('luola', 'Q1051_2')
  await talk('luola', 'Q1051_3')

  await talk('luola', 'Q1051_4')
  await talk('luola', 'Q1051_5')

  await princess.smoothMoveToCoord([3, 0])
  await princess.smoothMoveToCoord([0, -1])

  addItems(505)

  removeQuestEvents('Q665')
  finishQuestEvents('Q666', 'Q1051')
})
