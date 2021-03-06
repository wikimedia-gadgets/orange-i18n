/**
 * Process the code to remove stuff unnecessary for our
 * target language(s)
 */

const fs = require('fs')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const langs = args._
console.log('Input langs: ' + langs.join(', '))

const pathPrefix = './src-working/languages'

// Remove language-specific grammar rules
let origCode = fs.readFileSync(pathPrefix + '/index.js').toString()
let origCodeLines = /export default \{(.*?)\}/s
  .exec(origCode)[1]
  .split('\n')

let fixedCodeLines = origCodeLines.filter(line => {
  if (!line) return false
  let lang = /^\s*'(\w+)/.exec(line)[1]
  return langs.includes(lang) || lang === 'default'
})

let codeToWrite = `export default {
${fixedCodeLines.join('\n')}
}`

console.log('Revised lines for export default statement:\n', codeToWrite)

fs.writeFileSync(pathPrefix + '/index.js', origCode.replace(/export default \{.*?\}/s, codeToWrite))

// Remove RTL or LTR detection code, not needed for LTR-only locales
if (!args.enableRTL) {
  console.log('Removing RTL specific code ... (use --enableRTL flag to skip this step for RTL languages)')
  const file = './src-working/emitter.js'
  let emitterJS = fs.readFileSync(file).toString()
    .replace(/const strongDirRegExp.*?\n\n/s, '\n\n\n')
    .replace(
      /function strongDirFromContent \(text\) \{.*?^\}/ms,
      "function strongDirFromContent (text) { return 'ltr' }"
    )
  fs.writeFileSync(file, emitterJS)
}
