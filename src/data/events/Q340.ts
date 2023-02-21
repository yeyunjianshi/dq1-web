task(async () => {
  if (hasItems(506)) {
    if (hasItems(503, 504)) {
      await talk('*', 'Q340_4')
      await talk('*', 'Q340_5')
      await message('Q340_6')

      const npc = getQuestNPC()
      await npc.smoothMoveToCoord([0, -1])

      await talk('*', 'Q340_7')

      getGameObject('Holy').active = true

      await npc.smoothMoveToCoord([0, 1])

      await talk('*', 'Q340_8')

      await npc.smoothMoveToCoord([1, 0])

      removeItems(503, 504)
      finishQuestEvents('Q340')
    } else {
      await talk('*', 'Q340_2')
      await talk('*', 'Q340_3')
    }
  } else {
    await talk('*', 'Q340_0')
    await talk('*', 'Q340_1')
    executingEngine.audios.playME('se/magic.mp3')
    flashing({ duration: 400, times: 2, color: '#EEEEEE88' })
    await delay(1000)
    await transitionTo('World', 'HolyShrine1')
    setInputType(InputType.Move)
  }
})
