/**
 * Process the code to remove stuff unnecessary for our
 * target language(s)
 */

const fs = require('fs')
const minimist = require('minimist')

const args = minimist(process.argv.slice(2))

const inputLangs = args._
console.log('Input langs: ' + inputLangs.join(', '))

const pathPrefix = './src-working/languages'

let origConfig = {
  fallbacks: JSON.parse(fs.readFileSync(pathPrefix + '/fallbacks.json').toString()),
  digitTransform: JSON.parse(fs.readFileSync(pathPrefix + '/digit-transform.json').toString()),
  pluralRules: JSON.parse(fs.readFileSync(pathPrefix + '/pluralrules.json').toString())
}

let langs = []

for (let lang of inputLangs) {
  langs = langs.concat(lang, origConfig.fallbacks[lang] || [])
}

console.log('Input langs with their fallbacks: ' + langs.join(', '))

function getRelevantEntries (config) {
  let newConfig = {}
  Object.entries(config).forEach(([lang, data]) => {
    if (langs.includes(lang)) {
      newConfig[lang] = data
    }
  })
  return newConfig
}

let newConfig = {
  fallbacks: getRelevantEntries(origConfig.fallbacks),
  digitTransform: getRelevantEntries(origConfig.digitTransform),
  pluralRules: getRelevantEntries(origConfig.pluralRules)
}

console.log('Processed new config:')
console.log(newConfig)

fs.writeFileSync(pathPrefix + '/fallbacks.json', JSON.stringify(newConfig.fallbacks))
fs.writeFileSync(pathPrefix + '/digit-transform.json', JSON.stringify(newConfig.digitTransform))
fs.writeFileSync(pathPrefix + '/pluralrules.json', JSON.stringify(newConfig.pluralRules))

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

// Get data for listToText
console.log('fetching messages from mediawiki for listToText ...')
const { mwn } = require("mwn");
const api = new mwn({
  // it doesn't matter which wiki we query from, they'll all yield the same messages
  apiUrl: 'https://www.mediawiki.org/w/api.php',
  silent: true
});

let listMessages = {};
api.batchOperation(langs, (lang) => {
  return api.request({
    "action": "query",
    "format": "json",
    "meta": "allmessages",
    "formatversion": "2",
    "ammessages": ["and", "word-separator", "comma-separator"], // order here matters!
    "amlang": lang
  }).then(json => {
    listMessages[lang] = json.query.allmessages.map(msg => msg.content);
  })
}, 10).then(() => {

  fs.writeFile(pathPrefix + '/list-messages.json',
      JSON.stringify(listMessages, null, 4),
      err => err && console.log(err))
})
