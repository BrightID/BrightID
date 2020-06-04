/* global element:false, by:false, waitFor:false, device: false */

const testUserName = 'Vincent Vega';

const createBrightID = async (name = testUserName) => {
  await element(by.id('getStartedBtn')).tap();
  await element(by.id('editName')).tap();
  await element(by.id('editName')).typeText(name);
  await element(by.id('editName')).tapReturnKey();
  await element(by.id('addPhoto')).tap();
  // ActionSheet does not support testID prop, so match based on text.
  await expect(element(by.text('Select photo'))).toBeVisible();
  // Following call is mocked through @utils/images.e2e.js to skip OS image picker
  await element(by.text('Choose From Library')).tap();
  // Wait until photo is loaded
  await waitFor(element(by.id('editPhoto')))
    .toBeVisible()
    .withTimeout(20000);
  // create new ID
  await element(by.id('createBrightIDBtn')).tap();
  // should end up at home screen
  await waitFor(element(by.id('homeScreen')))
    .toBeVisible()
    .withTimeout(20000);
  return name;
};

const createFakeConnection = async () => {
  const sureText = device.getPlatform() === 'android' ? 'SURE' : 'Sure';
  await element(by.id('createFakeConnectionBtn')).tap();
  await element(by.text(sureText)).tap();
  // With automatic sync this test fails intermittent, so use explicit waitFor...
  await waitFor(element(by.id('previewConnectionScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectHomescreen = async () => {
  await waitFor(element(by.id('homeScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectGroupsScreen = async () => {
  await waitFor(element(by.id('groupsScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectAppsScreen = async (bool = true) => {
  bool
    ? await waitFor(element(by.id('appsScreen')))
        .toBeVisible()
        .withTimeout(20000)
    : await waitFor(element(by.id('appsScreen')))
        .toBeNotVisible()
        .withTimeout(5000);
};

export {
  testUserName,
  createBrightID,
  createFakeConnection,
  expectHomescreen,
  expectGroupsScreen,
  expectAppsScreen,
};
