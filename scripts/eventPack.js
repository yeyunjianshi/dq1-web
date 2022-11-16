const path = require('path')
const fs = require('fs')

const writeDataPath = path.resolve('public/assets/data/events.json')
const eventsDirPath = path.resolve('src/data/events')
if (!fs.existsSync(eventsDirPath)) {
  throw new Error(`未找到文件夹: ${eventsDirPath}`)
}
const eventsDir = fs.readdirSync(eventsDirPath)
const object = {}
for (const filename of eventsDir) {
  const file = fs.readFileSync(path.resolve(eventsDirPath, filename))
  const eventId = filename.slice(0, -3)
  object[`${eventId}`] = file.toString()
}
const json = JSON.stringify(object)
fs.writeFileSync(writeDataPath, json)

console.log(`写入events.json成功`)
