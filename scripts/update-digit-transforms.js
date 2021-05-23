const fs = require('fs')
const {execSync} = require('child_process')

const run = (cmd) => execSync(cmd).toString()

process.chdir(__dirname)

// This can take some time!
run('git clone --branch master --depth 1 https://github.com/wikimedia/mediawiki')

process.chdir('./mediawiki/languages/messages')
let files = run('grep digitTransformTable *.php -l').split('\n').filter(e => e)

let output = {}
for (let filename of files) {
  if (filename === 'MessagesEn.php') continue
  const lang = filename.match(/Messages(.*?)\.php/)[1].toLowerCase()
  let nums = run(`grep digitTransformTable ${filename} -A 11`)
    .split('\n').slice(1, -2).map(line => {
      return line.match(/=> '(.*?)'/)?.[1]
    })
  output[lang] = nums.slice(0, 10).join('')
}
process.chdir(__dirname)
fs.writeFileSync('../data/digit-transforms.json', JSON.stringify(output, null, 2))
fs.rmSync('./mediawiki', { recursive: true, force: true })
