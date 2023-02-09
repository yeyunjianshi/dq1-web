task(async () => {
  const npc = getQuestNPC()
  await npc.smoothMoveToCoord([-1, 0])
  npc.moveToCoord([0, 0], 0)
})
