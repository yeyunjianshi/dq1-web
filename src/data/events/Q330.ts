task(async () => {
  await talk('*', 'Q330_0')
  await talk('*', 'Q330_1')
  await talk('*', 'Q330_2')
  await talk('*', 'Q330_3')
  await talk('*', 'Q330_4')
  if (hasItems(502)) {
    await talk('*', 'Q330_5')
    await talk('*', 'Q330_6')
    await talk('*', 'Q330_7')
    await getQuestNPC().smoothMoveToCoord([1, 0])
    removeItems(502)
    finishQuestEvents('Q330')
  }
})
