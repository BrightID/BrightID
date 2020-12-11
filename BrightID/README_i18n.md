# developer workflow

## Add new strings
1. Add new translation key(s) using the `t('<translation key>', '<default english value>')'` method. 
   
   **Important:** Don't use underscores ("_") in translation keys. They are reserved for defining plural 
   variant of keys. 
1. Execute `i18next`. This will scan all source files and add new keys to all configured locales
   (`locales/<locale>/translation.json`). It will also add the default english value you supplied to the `t()` function.

## Add a new language
1. Add new locale to the `locales` array in `i18next-parser.config.js`
1. Execute `i18next`. This will create any missing translation file in `locales/<locale>/translation.json`

## Manual translation
Just edit the according strings in `locales/<locale>/translation.js` and commit the file as usual.

# Integration with locize.com

## Preconditions
To sync translations with locize website you need to install [locize cli](https://github.com/locize/locize-cli) tool:
`npm install -g locize-cli`
With every command you need to specify apiKey and projectID, some commands require default language. You can store
this information in a config file or ENV to save typing. See https://github.com/locize/locize-cli#other-information for instructions.

## Upload translations to locize
If you added new keys, new language or updated translations locally, you need to add these changes to the locize website:

Execute `locize sync <language>`.

This will add any new keys and translations of the specified
language to the locize website, so they are ready to translate.

**Important:** If you made local changes to **existing** translations you need to sync with parameter `--update-values true`.
Otherwise your local changes will be ignored.

## download translations from locize
When new translations have been created on the locize website they need to be integrated into the app.

Execute `locize download -l <language> -p <language path>` in folder `locales`. This
will update `locales/<language>/translation.json` with the latest data from locize.

_Example:_ `locize download -l de -p de` will download german translations and save them as
`locales/de/translation.json`.

