import { set_fs, readFile, utils } from 'xlsx/xlsx.mjs'
import * as fs from 'fs'
import { dirname, resolve } from 'path'
import consola from 'consola'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

set_fs(fs)

function filename(path) {
  const index = path.lastIndexOf('.')
  return index === -1 ? path : path.slice(0, index)
}

function convertToJson(xls) {
  consola.info(`转化${xls}`)
  const workbook = readFile(xls)
  const data = utils
    .sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], {
      header: ['A', 'B', 'C'],
      blankrows: false,
    })
    .map((row) => ({
      key: row['A'],
      value: row['B'].replaceAll('\\n', '\n'),
      infos: row['C'] ? JSON.parse(row['C']) : undefined,
    }))
  return data
}

async function writeFile(file, data, options) {
  consola.info(`写入${file}...`)
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, options, (err) => {
      if (err) {
        consola.error(`写入${file}失败.`)
        consola.error(err)
        reject(err)
      } else {
        consola.success(`写入${file}成功.`)
        resolve(data)
      }
    })
  })
}

async function cli() {
  const targetResolve = (path) =>
    resolve(__dirname, `../public/assets/data/i18n/${path}.json`)
  const i18nDirPath = resolve(__dirname, '../database/i18n')
  const i18nXlsxs = fs.readdirSync(i18nDirPath)

  for (const xls of i18nXlsxs) {
    const data = convertToJson(resolve(i18nDirPath, xls))
    await writeFile(targetResolve(filename(xls)), JSON.stringify(data))
  }
}

cli()
