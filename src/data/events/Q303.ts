task(async () => {
  await talk('*', 'Q302_0')
  await talk('*', 'Q302_1')
  await getQuestNPC().smoothMoveToCoord([8, 0])
})
