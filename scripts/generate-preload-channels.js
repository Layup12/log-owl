const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const channelsPath = path.join(root, 'contracts/channels.ts')
const templatePath = path.join(root, 'main/preload.template.ts')
const preloadPath = path.join(root, 'main/preload.ts')

const PLACEHOLDER = '  /* __ALLOWED_CHANNELS_ARRAY__ */'

const channelsSrc = fs.readFileSync(channelsPath, 'utf8')

const channelsBlockMatch = channelsSrc.match(
  /export const CHANNELS = \{([\s\S]*?)\}\s*as const/
)
if (!channelsBlockMatch) {
  console.error(
    'generate-preload-channels: не найден блок CHANNELS в contracts/channels.ts'
  )
  process.exit(1)
}
const block = channelsBlockMatch[1]
const valueRegex = /:\s*['"]([^'"]+)['"]/g
const channels = []
let m
while ((m = valueRegex.exec(block)) !== null) {
  channels.push(m[1])
}

const taskChannels = channels.filter((c) => c.startsWith('task:'))
const taskSessionChannels = channels.filter((c) => c.startsWith('taskSession:'))
const timeEntryChannels = channels.filter((c) => c.startsWith('timeEntry:'))
const settingsChannels = channels.filter((c) => c.startsWith('settings:'))
const reportChannels = channels.filter((c) => c.startsWith('report:'))
const appChannels = channels.filter((c) => c.startsWith('app:'))
const lines = [
  taskChannels.map((c) => `'${c}'`).join(', '),
  taskSessionChannels.map((c) => `'${c}'`).join(', '),
  timeEntryChannels.map((c) => `'${c}'`).join(', '),
  settingsChannels.map((c) => `'${c}'`).join(', '),
  reportChannels.map((c) => `'${c}'`).join(', '),
  appChannels.map((c) => `'${c}'`).join(', '),
].filter((line) => line.length > 0)
const arrayBody = lines.map((line) => `  ${line}`).join(',\n')

let template = fs.readFileSync(templatePath, 'utf8')
if (!template.includes(PLACEHOLDER)) {
  console.error(
    `generate-preload-channels: в main/preload.template.ts не найден плейсхолдер ${PLACEHOLDER}`
  )
  process.exit(1)
}
const preloadSrc = template.replace(PLACEHOLDER, arrayBody)
fs.writeFileSync(preloadPath, preloadSrc, 'utf8')
console.log(
  'generate-preload-channels: сгенерирован main/preload.ts из шаблона, каналов:',
  channels.length
)
