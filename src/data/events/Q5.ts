task(async () => {
  const type = executingEvent.args[0]
  const id = executingEvent.args[1]
  await talk('*', type === 0 ? 'Q5_0' : 'Q5_1', true)
  await shop(id)
  await talk('*', 'Q5_N', true)
})
