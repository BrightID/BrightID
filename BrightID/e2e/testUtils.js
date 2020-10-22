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
  await expect(element(by.id('single-use-code'))).toExist();
  await expect(element(by.id('fakeConnectionBtn'))).toBeVisible();
  await element(by.id('fakeConnectionBtn')).tap();
  // With automatic sync this test fails intermittent, so use explicit waitFor...
  // await expect(element(by.id('previewConnectionScreen'))).toBeVisible();
  await waitFor(element(by.id('previewConnectionScreen')))
    .toBeVisible()
    .withTimeout(20000);

  if (doConfirm) {
    // confirm connection and navigate back to home screen
    await expect(element(by.id('just metBtn'))).toBeVisible();
    await element(by.id('just metBtn')).tap();
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
  // there might be several "navHomeBtn" instances in the view hierarchy
  try {
    await element(by.id('NavHomeBtn')).atIndex(0).tap();
    await element(by.id('NavHomeBtn')).atIndex(1).tap();
    await element(by.id('NavHomeBtn')).atIndex(2).tap();
  } catch (err) {}

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

const inviteConnectionToGroup = async (groupName: string) => {
  const inviteUserText = 'Invite user';

  // should start on home screen
  await expectHomescreen();
  // navigate to groups screen
  await element(by.id('groupsBtn')).tap();
  await expectGroupsScreen();
  // open group
  await element(by.text(groupName)).tap();
  // open group context menu
  await expect(element(by.id('groupOptionsBtn'))).toBeVisible();
  await element(by.id('groupOptionsBtn')).tap();
  // click on "invite"
  await expect(element(by.text(inviteUserText))).toBeVisible();
  await element(by.text(inviteUserText)).tap();
  // should be on invitescreen now
  await waitFor(element(by.id('inviteListScreen')))
    .toBeVisible()
    .withTimeout(10000);
  // find the first eligible candidate for this group
  await waitFor(element(by.id('eligibleItem-0')))
    .toBeVisible()
    .withTimeout(10000);
  // invite user
  await element(by.id('eligibleItem-0')).tap();
  // dismiss success notification
  await waitFor(element(by.text('Successful Invitation')))
    .toBeVisible()
    .withTimeout(20000);
  await element(by.text('OK')).tap();
  // Now on members screen again. Go back to homescreen.
  // TODO: navigateHome just goes back one screen here, so execute 2 times :-/
  await navigateHome();
  await navigateHome();
  await expectHomescreen();
};

const joinAllGroups = async (connectionCount: number) => {
  await expectHomescreen();
  // navigate to connections screen to make invited user join the group
  await element(by.id('connectionsBtn')).tap();
  await expectConnectionsScreen();
  // to simplify test script just click on all flagBtns and join groups
  const actionSheetTitle = 'What do you want to do?';
  const actionTitle = 'Join All Groups';
  // let connections join groups
  for (let i = 0; i < connectionCount; i++) {
    // swipe left to reach flagBtn
    await element(by.id('connectionCardContainer')).atIndex(i).swipe('left');
    await waitFor(element(by.id('flagBtn')).atIndex(i))
      .toBeVisible()
      .withTimeout(20000);
    await element(by.id('flagBtn')).atIndex(i).tap();

    // ActionSheet does not support testID, so match based on text.
    await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
    await element(by.text(actionTitle)).tap();
  }
  await navigateHome();
  await expectHomescreen();
};

/* Connect fake connections with each other */
const interConnect = async (connectionCount: number) => {
  await expectHomescreen();
  await element(by.id('connectionsBtn')).tap();
  await expectConnectionsScreen();

  // interconnect fake connections with each other
  const actionSheetTitle = 'What do you want to do?';
  const actionTitle = 'Connect to other fake connections';
  for (let i = 0; i < connectionCount; i++) {
    // swipe left to reach flagBtn
    await element(by.id('connectionCardContainer')).atIndex(i).swipe('left');
    await waitFor(element(by.id('flagBtn')).atIndex(i))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('flagBtn')).atIndex(i).tap();

    // ActionSheet does not support testID, so match based on text.
    await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
    await waitFor(element(by.text(actionTitle))).toBeVisible();
    await element(by.text(actionTitle)).tap();
  }

  await navigateHome();
  await expectHomescreen();
};

export {
  testUserName,
  createBrightID,
  createFakeConnection,
  expectHomescreen,
  expectConnectionsScreen,
  expectGroupsScreen,
  expectAppsScreen,
  interConnect,
  inviteConnectionToGroup,
  joinAllGroups,
  navigateHome,
};
