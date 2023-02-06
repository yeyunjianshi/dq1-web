task(async () => {
  await talk('*', 'Q1121_0')
  await talk('*', 'Q1121_1')
  healMP()
  flashing({ duration: 300, times: 2, color: '#38F3F5' })
})
