const { execSync } = require('child_process')

function getCurrentBranch() {
  try {
    const name = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim()

    return name
  } catch {
    console.error('check-branch-name: не удалось получить имя ветки')
    process.exit(1)
  }
}

const branch = getCurrentBranch()

if (branch === 'HEAD') {
  process.exit(0)
}

const allowedStaticBranches = new Set(['main', 'dev'])

const workBranchPattern =
  /^(feature|fix|chore|docs|refactor|test|ci)\/[a-z0-9]+(?:-[a-z0-9]+)*$/

if (allowedStaticBranches.has(branch) || workBranchPattern.test(branch)) {
  process.exit(0)
}

console.error(
  [
    `check-branch-name: неверное имя ветки "${branch}"`,
    '',
    'Ожидается один из вариантов:',
    '  - main',
    '  - dev',
    '  - <type>/<kebab-case-name>, где <type>: feature, fix, chore, docs, refactor, test, ci',
    '',
    'Примеры допустимых имён веток:',
    '  feature/add-time-entries-filter',
    '  fix/tray-icon-macos',
    '  chore/update-dependencies',
  ].join('\n')
)

process.exit(1)
