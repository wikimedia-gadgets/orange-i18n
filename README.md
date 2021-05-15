# orange-i18n - Javascript Internationalization library

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/wikimedia/orange-i18n/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/orange-i18n.svg?style=flat)](https://www.npmjs.com/package/orange-i18n)

Orange-i18n is a fork of [**banana-i18n**](https://www.npmjs.com/package/banana-i18n) optimised for use in gadgets on Wikimedia sites.

Some of the changes done in this fork have been merged upstream. The only significant change here now is the use of MW plural rules rather than `Intl` based ones.

#### Patches
1. Replaced use of `Intl.PluralRules` with `mw.libs.pluralruleparser` and a pluralrules.json data file
    - `Intl.PluralRules` is not supported in IE 11 and Safari <13, for which MediaWiki still provides Grade A support. 
    - The JSON data file is from version 1.2 of banana-i18n which used it along with the [cldrpluralruleparser](https://www.npmjs.com/package/cldrpluralruleparser) npm package. cldrpluralruleparser is equivalent to mediawiki.libs.pluralruleparser. The former is kept as a dev dependency for mocking the latter in tests.
2. Added support for `{{formatnum:}}` operation - this converts the default [Arabic numerals](https://en.wikipedia.org/wiki/Arabic_numerals) to locale-specific numerals
    - The data for numerals was already present in the repo. Code for formatnum parsing is copied from mediawiki.jqueryMsg, in which this functionality is present. ([Link](https://github.com/wikimedia/mediawiki/blob/8dbcddb333435b2deb7975632ebdead29b25dd83/resources/src/mediawiki.jqueryMsg/mediawiki.jqueryMsg.js#L1445))
    - MERGED UPSTREAM in https://github.com/wikimedia/banana-i18n/pull/43
3. ~~Added support for `{{list:}}` operation which provides [mw.language.listToText](https://doc.wikimedia.org/mediawiki-core/master/js/source/mediawiki.language.html#mw-language-method-listToText) functionality (['a', 'b', 'c'] —> "a, b and c" in a language-agnostic way). This feature is available with the custom builds (see below) only.~~
   - ~~This needs the knowledge of how different languages separate words – this can be done using the MediaWiki i18n messages `word-separator`, `comma-separator` and `and` which we fetch using the MediaWiki API at the build step.~~
      - Reverted. Now that custom parser hooks are supported, this can instead be implemented as a parser hook.
4. (366319eb) Added support for custom parser hooks. Mostly intended for cases where the hook relies on data that is not available with orange-i18n but is present in the client script.
    - MERGED UPSTREAM in https://github.com/wikimedia/banana-i18n/pull/46
5. Added TypeScript type definitions.  
    - ALSO implemented in upstream
6. Make it easier to mention wiki-templates in messages by not throwing an error for `{{X}}` syntax where X is not a valid i18n parser operator. Such usages are rendered literally instead.

#### Removed/missing features:
Certain features are removed/missing in order to keep the library light-weight.
1. HTML sanitisation 
   -  Messages from untrusted sources should not be directly used as HTML, as this library does not provide runtime sanitisation of messages. Ideally, use a build step to sanitise them keeping only trusted HTML tags and attributes.
2. Wikilink, external link syntax parsing
   - This can be implemented more appropriately in the consumer script side. Since neither this library nor its parent banana-i18n use different parsing modes like mediawiki.JQueryMsg, parsing wikilinks to `<a>` tags may not be always desirable (for example, wikilinks in edit summaries).
3. Built-in fallback language resolution data
   - Fallback languages need to be explicitly set using `banana.setFallbackLocales()` method, so that the list of fallback languages does not need to be present in the library code. It is suggested to use a pre-processed i18n files that contain all fallback languages messages already resolved. This saves the time and bandwidth needed to fetch multiple i18n files.

Twinkle-core uses an [i18n build script](https://github.com/wikimedia-gadgets/twinkle-core/blob/master/scripts/build-i18n.js) for build-time message sanitisation and fallback language resolution.

### Custom builds
Another build script is included that tailors a build to include only the code and data required for a given set of languages. This optimises the build from about 27000 bytes to just about 8000 bytes in many situations. 

- ```npm run build-locale en fr hi``` gives a build that only includes code necessary for English, French and Hindi. You can specify upto 7 languages this way. 
- The rules regarding grammar, plurality and digit transformations for other languages are omitted from the build. 
- Be careful! Trying to set the locale to other languages will still work, however the output may be wrong in terms of plurality, grammar and digit transformations. 
- By default, the code for detecting RTL or LTR directionality is also omitted  of as it relies on a massive regex string. Instead, everything is just assumed to be LTR. If you need to support RTL, disable this behaviour using the `--enableRTL` flag. ```npm run build-locale fa --enableRTL``` gives a build that works right for Persian language.

In all cases the built code is saved to `dist/banana-i18n.js` which is the main entry point defined in `package.json`.

Originally created for [Twinkle](https://github.com/wikimedia-gadgets/twinkle-core) by @siddharthvp (SD0001). 

The original README of banana-i18n follows below this line.

----

# banana-i18n - Javascript Internationalization library

banana-i18n is a javascript internationalization library that uses "banana" format - A JSON based localization file format.

## Banana File format

The message files are json formatted. As a convention, you can have a folder named i18n inside your source code. For each language or locale, have a file named like languagecode.json.

Example:

```
App
    |--src
    |--doc
    |--i18n
        |--ar.json
        |--de.json
        |--en.json
        |--he.json
        |--hi.json
        |--fr.json
        |--qqq.json
```

A simple en.json file example is given below

```json
{
    "@metadata": {
        "authors": [
            "Alice",
            "David",
            "Santhosh"
        ],
        "last-updated": "2012-09-21",
        "locale": "en",
        "message-documentation": "qqq",
        "AnotherMetadata": "AnotherMedatadataValue"
    },
    "appname-title": "Example Application",
    "appname-sub-title": "An example application with jquery.i18n",
    "appname-header-introduction": "Introduction",
    "appname-about": "About this application",
    "appname-footer": "Footer text"
}
```

The json file should be a valid json. The ```@metadata``` holds all kind of data that are not messages. You can store author information, copyright, updated date or anything there.

Messages are key-value pairs. It is a good convention to prefix your appname to message keys to make the messages unique. It acts as the namespace for the message keys. It is also a good convention to have the message keys with ```-``` separated words, all in lower case.

If you are curious to see some real jquery.i18n message file from other projects:

- message files of MediaWiki https://github.com/wikimedia/mediawiki-core/tree/master/languages/i18n
- message files from jquery.uls project https://github.com/wikimedia/jquery.uls/blob/master/i18n

## Loading the messages

The localized message should be loaded before using .i18n() method. This can be done as follows:

### Using the constructor

```javascript
const banana = new Banana('es',{
  messages: {
   'key-1': 'Localized message'
  }
})
```

### Load the messages for a locale

After the initialization,

```javascript
const messages = {
  'message-key-1': 'Localized message 1',
  // Rest of the messages
};
banana.load(messages, 'es' );
```

### Load the messages for many locales at once

If you think it is convinient to load all messages for all locales at once, you can do this as follows. Here the messages are keyed by locale.

```javascript
const messages = {
  'es': {
    'message-key-1': 'Localized message 1 for es',
    // Rest of the messages for es
  },
  'ru': {
    'message-key-1': 'Localized message 1 for ru',
    // Rest of the messages for ru
  }
};
banana.load(messages); // Note that the locale parameter is missing here
```

Depeding on your application, the messages can be fetched from a server or a file system. Here is an example that fetches the localized messages json file.

```javascript
fetch('i18n/es.json').then((response) => response.json()).then((messages) => {
  banana.load(messages, 'es');
});
```

You may load the messages in parts too. That means, you can use the `banana.load(message_set1, 'es')` and later `banana.load(message_set2, 'es')`. Both of the messages will be merged to the locale. If message_2 has the same key of message_set1, the last message loaded wins.

## Setting the locale

The constructor for Banana class accepts the locale

```javascript
const banana = new Banana('es')
```

Once the banana i18n is initialized you can change the locale using setLocale method

```javascript
banana.setLocale('es'); // Change to new locale
```

All .i18n() calls will set the message for the new locale from there onwards.

## Fallback

If a particular message is not localized for locale, but localized for a fallback locale(defined in src/languages/fallbacks.json),
the .i18n() method will return that. By default English is the final fallback language. But this configurable using `finalFallback` option. Example: `new Banana('ru', {finalFallback:'es' })`

## Placeholders

Messages take parameters. They are represented by $1, $2, $3, … in the message texts, and replaced at run time. Typical parameter values are numbers (Example: "Delete 3 versions?"), or user names (Example: "Page last edited by $1"), page names, links, and so on, or sometimes other messages.

```javascript
const message = "Welcome, $1";
banana.i18n(message, 'Alice'); // This gives "Welcome, Alice"
```


## Plurals

To make the syntax of sentence correct, plural forms are required. jquery.i18n support plural forms in the message using the syntax `{{PLURAL:$1|pluralform1|pluralform2|...}}`

For example:

```javascript
const message = "Found $1 {{PLURAL:$1|result|results}}";
banana.i18n(message, 1); // This gives "Found 1 result"
banana.i18n(message, 4); // This gives "Found 4 results"
```

Note that {{PLURAL:...}} is not case sensitive. It can be {{plural:...}} too.

In case of English, there are only 2 plural forms, but many languages use more than 2 plural forms. All the plural forms can be given in the above syntax, separated by pipe(|). The number of plural forms for each language is defined in [CLDR](http://www.unicode.org/cldr/charts/latest/supplemental/language_plural_rules.html). You need to provide all those plural forms for a language.

For example, English has 2 plural forms and the message format will look like `{{PLURAL:$1|one|other}}`. for Arabic there are 6 plural forms and format will look like `{{PLURAL:$1|zero|one|two|few|many|other}}`.

You cannot skip a plural form from the middle or beginning. However, you can skip from end. For example, in Arabic, if the message is like
`{{PLURAL:$1|A|B}}`, for 0, A will be used, for numbers that fall under one, two, few, many, other categories B will be used.

If there is an explicit plural form to be given for a specific number, it is possible with the following syntax

```javascript
const message = 'Box has {{PLURAL:$1|one egg|$1 eggs|12=a dozen eggs}}.';
banana.i18n(message, 4 ); // Gives "Box has 4 eggs."
banana.i18n(message, 12 ); // Gives "Box has a dozen eggs."
```

## Gender

Similar to plural, depending on gender of placeholders, mostly user names, the syntax changes dynamically. An example in English is "Alice changed her profile picture" and "Bob changed his profile picture". To support this {{GENDER...}} syntax can be used as shown in example

```javascript
const message = "$1 changed {{GENDER:$2|his|her}} profile picture";
banana.i18n(message, 'Alice', 'female' ); // This gives "Alice changed her profile picture"
banana.i18n(message, 'Bob', 'male' ); // This gives "Bob changed his profile picture"
```

Note that {{GENDER:...}} is not case sensitive. It can be {{gender:...}} too.

## Grammar

```javascript
const banana=new Banana( { locale: 'fi' } );

const message = "{{grammar:genitive|$1}}";

banana.i18n(message, 'talo' ); // This gives "talon"

banana.locale = 'hy'; // Switch to locale Armenian
banana.i18n(message, 'Մաունա'); // This gives "Մաունայի"
```

## Directionality-safe isolation

To avoid BIDI corruption that looks like "(Foo_(Bar", which happens when a string is inserted into a context with the reverse directionality, you can use `{{bidi:…}}`. Directionality-neutral characters at the edge of the string can get wrongly interpreted by the BIDI algorithm. This would let you embed your substituted string into a new BIDI context, //e.g.//:

   "`Shalom, {{bidi:$1}}, hi!`"

The embedded context's directionality is determined by looking at the argument for `$1`, and then explicitly inserted into the Unicode text, ensuring correct rendering (because then the bidi algorithm "knows" the argument text is a separate context).


## Message documentation

The message keys and messages won't give a enough context about the message being translated to the translator. Whenever a developer adds a new message, it is a usual practice to document the message to a file named qqq.json
with same message key.

Example qqq.json:

```json
{
    "@metadata": {
        "authors": [
            "Developer Name"
        ]
    },
    "appname-title": "Application name. Transliteration is recommended",
    "appname-sub-title": "Brief explanation of the application",
    "appname-header-introduction": "Text for the introduction header",
    "appname-about": "About this application text",
    "appname-footer": "Footer text"
}

```

In MediaWiki and its hundreds of extensions, message documentation is a strictly followed practice. There is a grunt task to check whether all messages are documented or not. See https://www.npmjs.org/package/grunt-banana-checker


## Features

- Simple file format - JSON. Easily readable for humans and machines.
- Author and metadata information is not lost anywhere. There are other file formats using comments to store this.
- Uses MediaWiki convention for placeholders. Easily readable and proven convention. Example: ```There are $1 cars```
- Supports plural conversion without using extra messages for all plural forms. Plural rule handling is done using CLDR. Covers a wide range of languages
- Supports gender. By passing the gender value, you get correct sentences according to gender.
- Supports grammar forms. banana-i18n has a basic but extensible grammar conversion support
- Fallback chains for all languages.
- Nestable grammar, plural, gender support. These constructs can be nested to any arbitrary level for supporting sophisticated message localization
- Message documentation through special language code ```qqq```
- Extensible message parser to add or customize magic words in the messages. Example: ```{sitename}``` or ```[[link]]```
- Automatic message file linter using [banana-checker](https://www.npmjs.com/package/grunt-banana-checker)
- Tested in production - MediaWiki and and its extensions use this file format

## Translation

To translate the banana-i18n based application, depending on the expertise of the translator, there are multiple ways.

- Editing the json files directly - Suitable for translators with technical background. Also suitable if your application is small and you want to work with only a small number of languages
- Providing a translation interface along with your application: Suitable for proprietary or private applications with significant amount of translators
- Using open source translation platforms like translatewiki.net. The MediaWiki and jquery.uls from previous examples use translatewiki.net for crowdsourced message translation. Translatewiki.net can update your code repo at regular intervals with updated translations. Highly recommended if your application is opensource and want it to be localized to as many as languages possible with maximum number of translators.

## Frameworks

* React bindings for banana-i18n  https://www.npmjs.com/package/@wikimedia/react.i18n
* A Banana-i18n wrapper to support localization in Vue.js https://www.npmjs.com/package/vue-banana-i18n

## Thanks

This project is based on [jquery.i18n](github.com/wikimedia/jquery.i18n) library maintained by Wikimedia Foundation. Most of the internationalization related logic comes from that project. In Banana-i18n, jquery dependency was removed and the library was modernized to use in modern web applications. Contributors of jquery.i18n are greatly acknowledged and listed in AUTHORS.md
