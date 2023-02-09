task(async () => {
  const npc = getQuestNPC()
  await talk('*', 'Q300_0')
  await talk('*', 'Q300_1')
  await talk('*', 'Q300_2')
  await talk('*', 'Q300_3')
  await npc.smoothMoveToCoord([1, 0])
  finishQuestEvents('Q300__0')
})
