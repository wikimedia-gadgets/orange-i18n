const fs = require('fs')
const { mwn } = require('mwn')

// for xml parsing:
const { JSDOM } = require('jsdom')
global.window = new JSDOM('').window
const $ = require('jquery')

new mwn().rawRequest({
  url: 'https://raw.githubusercontent.com/wikimedia/mediawiki/master/languages/data/plurals.xml'
}).then(response => {
  let rules = {}
  $(response.data).find('plurals pluralrules').get().forEach((el) => {
    $(el).attr('locales').split(' ').forEach(lc => {
      $(el).find('pluralRule').get().forEach((r) => {
        let ruleText = $(r).text()
        let ruleTextSliced = ruleText.slice(0, ruleText.indexOf('@')).trim()
        if (ruleTextSliced) {
          if (!rules[lc]) {
            rules[lc] = {}
          }
          rules[lc][$(r).attr('count')] = ruleTextSliced
        }
      })
    })
  })
  rules = Object.fromEntries(Object.entries(rules).filter(([lang, r]) => {
    if (Object.keys(r).length === 1 && r.one === 'i = 1 and v = 0') return false
    if (Object.keys(r).length === 1 && r.one === 'n = 1') return false
    return true
  }).sort())
  fs.writeFileSync('../data/plural-rules.json', JSON.stringify(rules, null, 2))
})
