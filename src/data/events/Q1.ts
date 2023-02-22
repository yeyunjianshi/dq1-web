// 国王对话
task(async () => {
  if (hasQuestEvents('Q660')) {
    await talk('king', 'Q1002_0')
    return
  } else if (hasQuestEvents('Q666')) {
    await talk('king', 'Q1_2')
    await talk('king', 'Q1_3')
  } else {
    await talk('king', 'Q1_0')
  }
  if (hero().lv < 30) {
    await talkWithArgs({
      characterName: 'king',
      text: 'Q1_1',
      textArgs: [['{nextExp}', hero().nextExp]],
    })
  } else {
    await talk('king', 'Q1_4')
  }
})
