# End-2-End tests with Detox

## Configuration
Package.json contains a section named "detox". See 
[Detox documentation](https://github.com/wix/Detox/blob/master/docs/APIRef.Configuration.md)
for available options.

## Test specs
Test specs are located in folder "e2e". For writing tests, see
[Detox API](https://github.com/wix/Detox/blob/master/docs/README.md#api-reference).

## Commands

### Preparation
Execute `detox build --configuration android.emu.debug`. To test against the release build use
configuration `android.emu.release`. 

### Running tests - Android emulator
1. Start metro bundler as usual: `npm run start`
1. Run tests. Tests can be run either for debug or release build:
   1. Test debug build: `detox test -c android.emu.debug`
   1. Test release build: `detox test -c android.emu.release`

   Detox will start the emulator (name as specified in package.json
   configuration), copy the binary and run the tests.

### Running tests - iOS emulator
TODO

#### Useful detox cmdline options
`--reuse` -> Dont re-upload app on test start to decrease test run time. As any change to the js-sources is anyway
automatically applied through Metro builder the existing app can be re-used.

`--take-screenshots failing --record-logs failing` -> For failing tests create logfiles and screenshots
into 'artifacts' directory.

`--headless` -> starts emulator in headless mode. Useful for CI environments.

`--device-name` -> manually set emulator name 

Pass arbitrary options to jest with `-- <jest options>`. E.g. 
to run only the `home.spec.ts` tests, pass option `-- home.spec`.

#### Further reading
 - [How Detox Works](https://github.com/wix/Detox/blob/master/docs/Introduction.HowDetoxWorks.md)
 - [Developing Your App While Writing Tests](https://github.com/wix/Detox/blob/master/docs/Guide.DevelopingWhileWritingTests.md)
 - Everything at https://github.com/wix/Detox/tree/master/docs :-)
