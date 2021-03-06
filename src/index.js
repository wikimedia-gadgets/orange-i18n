import BananaParser from './parser'
import BananaMessageStore from './messagestore'
import BananaEmitter from './emitter'
import BananaLanguage from './languages/language'

export default class Banana {
  /**
   * @param {string} locale
   * @param {Object} options options
   * @param {string} [options.finalFallback] Final fallback locale
   * @param {Object|undefined} [options.messages] messages
   */
  constructor (locale, {
    finalFallback = 'en', messages = undefined } = {}
  ) {
    this.locale = locale
    this.parser = new BananaParser(this.locale)
    this.messageStore = new BananaMessageStore()
    if (messages) {
      this.load(messages, this.locale)
    }
    this.fallbackLocales = []
    this.finalFallback = finalFallback
  }

  /**
   * Load localized messages for a locale
   * If locale not provided, the keys in messageSource will be used as locales.
   * @param {Object} messageSource
   * @param {string} [locale]
   */
  load (messageSource, locale) {
    return this.messageStore.load(messageSource, locale || this.locale)
  }

  i18n (key, ...parameters) {
    return this.parser.parse(this.getMessage(key), parameters)
  }

  setLocale (locale) {
    this.locale = locale
    // Update parser
    this.parser = new BananaParser(this.locale)
  }

  getFallbackLocales () {
    return [...this.fallbackLocales, this.finalFallback]
  }

  setFallbackLocales (locales) {
    this.fallbackLocales = locales
  }

  setPluralRules (locale, rule) {
    BananaLanguage.pluralRules[locale] = rule
  }

  setDigitTransforms (locale, transforms) {
    BananaLanguage.digitTransforms[locale] = transforms
  }

  getMessage (messageKey) {
    let locale = this.locale
    let fallbackIndex = 0
    const fallbackLocales = this.getFallbackLocales()
    while (locale) {
      // Iterate through locales starting at most-specific until
      // localization is found. As in fi-Latn-FI, fi-Latn and fi.
      let localeParts = locale.split('-')
      let localePartIndex = localeParts.length

      do {
        let tryingLocale = localeParts.slice(0, localePartIndex).join('-')

        let message = this.messageStore.getMessage(messageKey, tryingLocale)

        if (typeof message === 'string') {
          return message
        }

        localePartIndex--
      } while (localePartIndex)

      locale = fallbackLocales[fallbackIndex]
      fallbackIndex++
    }
    return messageKey
  }

  /**
   * Register a plugin for the library's message parser
   * Example:
   * <pre>
   *  banana.registerParserPlugin('sysop', nodes => {
   *    return mw.config.get('wgUserGroups').includes('sysop') ?
   *   nodes[1] : nodes[2]
   * }
   * </pre>
   * This allows messages to know if the user is a sysop. Usage:
   * <pre>
   *  banana.i18n('this is a message {{sysop:|Message for sysops|Message for non-sysops}}')
   * </pre>
   * See emitter.js for built-in parser operations.
   * @param {string} name - the name of the parser hook
   * @param {Function} plugin - the plugin function. It receives nodes as argument -
   * a mixed array corresponding to the pipe-separated objects in the operation.
   */
  registerParserPlugin (name, plugin) {
    BananaEmitter.prototype[name] = plugin
  }
}
