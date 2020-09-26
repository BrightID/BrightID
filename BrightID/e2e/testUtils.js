/* global element:false, by:false, waitFor:false, device: false */

const testUserName = 'Vincent Vega';

const createBrightID = async (name = testUserName) => {
  await element(by.id('getStartedBtn')).tap();
  await element(by.id('editName')).tap();
  await element(by.id('editName')).replaceText(name);
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
  await expectHomescreen();
  return name;
};

const createFakeConnection = async (doConfirm = true) => {
  // need to be on Homescreen to continue
  await expectHomescreen();
  // open MyCode screen
  await element(by.id('MyCodeBtn')).tap();
  // make sure SINGLE connection mode is active
  await expect(element(by.text('One to One '))).toExist();
  await expect(element(by.id('fakeConnectionBtn'))).toBeVisible();
  await element(by.id('fakeConnectionBtn')).tap();
  // With automatic sync this test fails intermittent, so use explicit waitFor...
  // await expect(element(by.id('previewConnectionScreen'))).toBeVisible();
  await waitFor(element(by.id('previewConnectionScreen')))
    .toBeVisible()
    .withTimeout(20000);

  if (doConfirm) {
    // confirm connection and navigate back to home screen
    await expect(element(by.id('confirmConnectionButton'))).toBeVisible();
    await element(by.id('confirmConnectionButton')).tap();
    // Should end up in the connection list
    await expectConnectionsScreen();
    await navigateHome();
  }
};

const expectHomescreen = async () => {
  await waitFor(element(by.id('homeScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const navigateHome = async () => {
  // there might be several "navHomeBtn" instances in the view hierarchy, just take the first one
  await element(by.id('NavHomeBtn')).atIndex(0).tap();
  await expectHomescreen();
};

const expectConnectionsScreen = async () => {
  await waitFor(element(by.id('connectionsScreen')))
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
  expectConnectionsScreen,
  expectGroupsScreen,
  expectAppsScreen,
  navigateHome,
};
