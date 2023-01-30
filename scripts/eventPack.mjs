import { resolve } from 'path'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import consola from 'consola'

const writeDataPath = resolve('public/assets/data/events.json')
const eventsDirPath = resolve('src/data/events')

if (!existsSync(eventsDirPath)) {
  throw new Error(`未找到文件夹: ${eventsDirPath}`)
}
const eventsDir = readdirSync(eventsDirPath)
const object = {}
for (const filename of eventsDir) {
  const file = readFileSync(resolve(eventsDirPath, filename))
  const eventId = filename.slice(0, -3)
  object[`${eventId}`] = file.toString()
}
const json = JSON.stringify(object)
writeFileSync(writeDataPath, json)

consola.success(`写入events.json成功`)
