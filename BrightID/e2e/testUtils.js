// @flow
/* global element:false, by:false, waitFor:false, device: false */

import i18next from 'i18next';

const testUserName = 'Vincent Vega';

const createBrightID = async (name: string = testUserName) => {
  await element(by.id('getStartedBtn')).tap();
  await element(by.id('editName')).tap();
  await element(by.id('editName')).replaceText(name);
  await element(by.id('editName')).tapReturnKey();
  await element(by.id('addPhoto')).tap();
  // ActionSheet does not support testID prop, so match based on text.
  await expect(
    element(by.text(i18next.t('common.photoActionSheet.title'))),
  ).toBeVisible();
  // Following call is mocked through @utils/images.e2e.js to skip OS image picker
  await element(
    by.text(i18next.t('common.photoActionSheet.choosePhoto')),
  ).tap();
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

const createFakeConnection = async (doConfirm: boolean = true) => {
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
  } catch (err) {
    try {
      await element(by.id('NavHomeBtn')).atIndex(1).tap();
    } catch (err) {
      try {
        await element(by.id('NavHomeBtn')).atIndex(2).tap();
      } catch (err) {}
    }
  }

  await expectHomescreen();
};

const expectConnectionsScreen = async () => {
  await waitFor(element(by.id('connectionsScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectConnectionScreen = async () => {
  await waitFor(element(by.id('ConnectionScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectGroupsScreen = async () => {
  await waitFor(element(by.id('groupsScreen')))
    .toBeVisible()
    .withTimeout(20000);
};

const expectAppsScreen = async (bool: boolean = true) => {
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
  await waitFor(element(by.text(i18next.t('groups.alert.title.inviteSuccess'))))
    .toBeVisible()
    .withTimeout(20000);
  await element(by.text(i18next.t('common.alert.ok'))).tap();
  // Now on members screen again. Go back to homescreen.
  // TODO: navigateHome just goes back one screen here, so execute 2 times :-/
  await element(by.id('header-back')).tap();
  await navigateHome();
  await expectHomescreen();
};

const joinAllGroups = async (connectionIndex: number) => {
  await expectHomescreen();
  // navigate to connections screen to make invited user join the group
  await element(by.id('connectionsBtn')).tap();
  await expectConnectionsScreen();

  // open connection detail screen of specified connection index
  const connectionCardBtn = element(by.id(`ConnectionCard-${connectionIndex}`));
  await expect(connectionCardBtn).toBeVisible();
  await connectionCardBtn.tap();
  await expectConnectionScreen();

  // open connection test ActionSheet
  const actionSheetTitle = 'Connection Test options';
  const actionTitle = 'Accept all group invites';
  await element(by.id('connectionTestBtn')).tap();
  await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
  await waitFor(element(by.text(actionTitle))).toBeVisible();
  await element(by.text(actionTitle)).tap();

  // TODO: navigateHome just goes back one screen here, so execute 2 times :-/
  await element(by.id('header-back')).tap();
  await navigateHome();
  await expectHomescreen();
};

/* Connect a fake connection with all other fake connections */
const interConnect = async (connectionIndex: number) => {
  await expectHomescreen();
  await element(by.id('connectionsBtn')).tap();
  await expectConnectionsScreen();

  // open connection detail screen of specified connection index
  const connectionCardBtn = element(by.id(`ConnectionCard-${connectionIndex}`));
  await expect(connectionCardBtn).toBeVisible();
  await connectionCardBtn.tap();
  await expectConnectionScreen();

  // open connection test ActionSheet
  const actionSheetTitle = 'Connection Test options';
  const actionTitle = 'Connect with all other fake connections';

  await element(by.id('connectionTestBtn')).tap();
  // ActionSheet does not support testID, so match based on text.
  await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
  await waitFor(element(by.text(actionTitle))).toBeVisible();
  await element(by.text(actionTitle)).tap();

  // TODO: navigateHome just goes back one screen here, so execute 2 times :-/
  await element(by.id('header-back')).tap();
  await navigateHome();
  await expectHomescreen();
};

/*
  starts at home screen,
  opens connection screen and triggers reconnect,
  ends at preview connection screen
 */
const reconnect = async (connectionIndex: number, changeProfile: boolean) => {
  const action = changeProfile
    ? 'Reconnect with changed profile'
    : 'Reconnect with identical profile';
  // In order to have an open channel need to visit MyCodeScreen before attempting reconnect
  // open MyCode screen
  await element(by.id('MyCodeBtn')).tap();
  // make sure SINGLE connection mode is active
  await expect(element(by.id('single-use-code'))).toExist();
  // go to connections screen
  await navigateHome();
  await element(by.id('connectionsBtn')).tap();

  // should be on connectionsscreen
  await expectConnectionsScreen();

  /* Is this necessary??
  // wait upto 30 seconds till connection is established
  await waitFor(element(by.text('Connected a few seconds ago')))
    .toBeVisible()
    .withTimeout(30000);

   */

  // open connection detail screen of specified connection index
  const connectionCardBtn = element(by.id(`ConnectionCard-${connectionIndex}`));
  await expect(connectionCardBtn).toBeVisible();
  await connectionCardBtn.tap();
  await expectConnectionScreen();

  // open connection test ActionSheet
  const actionSheetTitle = 'Connection Test options';

  await element(by.id('connectionTestBtn')).tap();
  // ActionSheet does not support testID, so match based on text.
  await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
  await waitFor(element(by.text(action))).toBeVisible();
  await element(by.text(action)).tap();

  // navigate to MyCodeScreen, there it will pick up the incoming connection profile
  await element(by.id('header-back')).tap();
  await navigateHome();
  await element(by.id('MyCodeBtn')).tap();
  await expect(element(by.id('ReconnectScreen'))).toBeVisible();
};

export {
  testUserName,
  createBrightID,
  createFakeConnection,
  expectHomescreen,
  expectConnectionsScreen,
  expectConnectionScreen,
  expectGroupsScreen,
  expectAppsScreen,
  interConnect,
  inviteConnectionToGroup,
  joinAllGroups,
  navigateHome,
  reconnect,
};
