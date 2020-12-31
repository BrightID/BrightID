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

# Integration with weblate
Weblate has direct integration with github. The Weblate project is available at https://hosted.weblate.org/projects/brightid/.

## Integrating updated translations
When translations are modified in weblate, a PR will be automatically created with the changes. 
Example: https://github.com/BrightID/BrightID/pull/678

## Adding translation keys to weblate
Weblate scans the brightID repo for new strings. After adding new keys, go to https://hosted.weblate.org/projects/brightid/mobile-client/#repository.
Weblate should show the missing commits in the UI, so you just need to click "Update".

In future this can be automated by adding a github action as described in https://docs.weblate.org/en/latest/admin/continuous.html#update-vcs.
