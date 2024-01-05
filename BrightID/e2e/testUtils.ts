import './i18n_for_tests';
import i18next from 'i18next';
import { by, element, expect } from 'detox';
import { connection_levels } from '@/utils/constants';
import { getConnectionLevelString } from '@/utils/connectionLevelStrings';
import { b64ToUint8Array } from '@/utils/encoding';

const testUserName = 'Vincent Vega';
const operationTimeout = 40000; // ms to wait for operations to be applied

/*
Accept EULA and proceed to Onboarding screen
 */
const acceptEula = async () => {
  await expect(element(by.id('EulaScreen'))).toBeVisible();
  await expect(element(by.id('acceptEulaBtn'))).toExist();
  await element(by.id('acceptEulaBtn')).tap();
};

const createKeypair = async () => {
  await expect(element(by.id('OnboardScreen'))).toBeVisible();
  await expect(element(by.id('createBrightID'))).toExist();
  await element(by.id('createBrightID')).tap();
};

const addName = async (name: string) => {
  await expect(element(by.id('NameScreen'))).toBeVisible();
  await expect(element(by.id('editName'))).toExist();
  await element(by.id('editName')).tap();
  await element(by.id('editName')).replaceText(name);
  await element(by.id('editName')).tapReturnKey();
  await expect(element(by.id('submitName'))).toExist();
  await element(by.id('submitName')).tap();
};

const addPhoto = async () => {
  await expect(element(by.id('PhotoScreen'))).toBeVisible();
  await expect(element(by.id('addPhoto'))).toExist();
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
  await waitFor(element(by.id('addPhoto')))
    .toBeVisible()
    .withTimeout(15000);

  const submitPhoto = element(by.id('submitPhoto'));
  await expect(submitPhoto).toExist();
  // wait for the button to be enabled after setting the photo
  await new Promise((r) => setTimeout(r, 2000));
  // submit photo
  await submitPhoto.tap();
};

const skipPassword = async () => {
  await expect(element(by.id('PasswordScreen'))).toBeVisible();
  await expect(element(by.id('skipBtn'))).toExist();
  await element(by.id('skipBtn')).tap();
};

const setPassword = async () => {
  const password = '12345678';
  await expect(element(by.id('PasswordScreen'))).toBeVisible();

  await element(by.id('password')).tap();
  await element(by.id('password')).replaceText(password);
  await element(by.id('password')).tapReturnKey();

  await element(by.id('confirmpassword')).tap();
  await element(by.id('confirmpassword')).replaceText(password);
  await element(by.id('confirmpassword')).tapReturnKey();

  await expect(element(by.id('submitBtn'))).toExist();
  await element(by.id('submitBtn')).tap();
};

const skipWalkthrough = async () => {
  await waitFor(element(by.id('ViewPasswordWalkthrough')))
    .toBeVisible()
    .withTimeout(15000);
  await expect(element(by.id('ViewPasswordGotIt'))).toExist();
  await element(by.id('ViewPasswordGotIt')).tap();
  await expect(element(by.id('BrightIdLogo'))).toExist();
  await element(by.id('BrightIdLogo')).tap();
};

const createBrightID = async (
  name = testUserName,
  withPassword = false,
): Promise<{ brightId: string; secretKey: Uint8Array; publicKey: string }> => {
  await acceptEula();
  await createKeypair();
  await addName(name);
  await addPhoto();
  if (withPassword) {
    await setPassword();
  } else {
    await skipPassword();
  }
  // await skipWalkthrough();
  // should end up at home screen
  await expectHomescreen();

  // get brightID of user
  const brightIDAttributes = await element(
    by.id('userBrightId'),
  ).getAttributes(); // as ElementAttributes;
  // get secretKey of user
  const secretKeyAttributes = await element(
    by.id('userSecretKey'),
  ).getAttributes(); // as ElementAttributes;
  // get publicKey of user
  const publicKeyAttributes = await element(
    by.id('userPublicKey'),
  ).getAttributes(); // as ElementAttributes;

  // convert to 'any' type because 'text' is not defined in detox iOSElementAttributes which it should be
  return {
    brightId: (brightIDAttributes as any).text,
    secretKey: b64ToUint8Array((secretKeyAttributes as any).text),
    publicKey: (publicKeyAttributes as any).text,
  };
};

const createFakeConnection = async (
  doConfirm = true,
  connectionLevel: ConnectionLevel = connection_levels.JUST_MET,
): Promise<string> => {
  // need to be on Homescreen to continue
  await expectHomescreen();
  // open MyCode screen
  await element(by.id('MyCodeBtn')).tap();
  // make sure SINGLE connection mode is active
  await expect(element(by.id('single-use-code'))).toExist();
  await expect(element(by.id('fakeConnectionBtn'))).toBeVisible();
  await element(by.id('fakeConnectionBtn')).tap();
  await waitFor(element(by.id('previewConnectionScreen')))
    .toBeVisible()
    .withTimeout(40000);

  // get brightID of connection
  const brightIDAttributes = await element(
    by.id('connectionBrightId'),
  ).getAttributes(); // as ElementAttributes;

  if (doConfirm) {
    // confirm connection and navigate back to home screen
    await expect(element(by.id(`${connectionLevel}Btn`))).toBeVisible();
    await element(by.id(`${connectionLevel}Btn`)).tap();
    // Should end up in the connection list
    await expectConnectionsScreen();
    await navigateHome();
  }
  return (brightIDAttributes as any).text;
};

const expectHomescreen = async () => {
  await waitFor(element(by.id('BrightIdLogo')))
    .toBeVisible()
    .withTimeout(20000);
  await element(by.id('BrightIdLogo')).tap();
  await waitFor(element(by.id('homeScreen'))).toBeVisible();
};

const expectNotificationsScreen = async () => {
  await waitFor(element(by.id('NotificationsScreen')))
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
      } catch (err) {
        try {
          await element(by.id('NavHomeBtn')).atIndex(3).tap();
        } catch (err) {
          console.log(`No navHomeBtn found`);
          throw err;
        }
      }
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

const expectFindFriendsScreen = async () => {
  await waitFor(element(by.id('findFriendsScreen')))
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
  await element(by.id('toggleDrawer')).tap();
  await expect(element(by.id('groupsBtn'))).toBeVisible();
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
  // should be on connections screen now
  await waitFor(element(by.id('connectionsScreen')))
    .toBeVisible()
    .withTimeout(10000);
  // find the first eligible candidate for this group
  await waitFor(element(by.id('ConnectionCard-0')))
    .toBeVisible()
    .withTimeout(10000);
  // invite user
  await element(by.id('ConnectionCard-0')).tap();
  // dismiss success notification
  await waitFor(element(by.text(i18next.t('groups.alert.title.inviteSuccess'))))
    .toBeVisible()
    .withTimeout(20000);
  await element(by.text(i18next.t('common.alert.ok'))).tap();
  // Now on members screen again. Go back to homescreen.
  await element(by.id('NavBackBtn')).tap();
  await navigateHome();
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

  await element(by.id('NavBackBtn')).tap();
  await navigateHome();
};

/* Connect a fake connection with all other fake connections */
const interConnect = async (
  connectionIndex: number,
  connectionLevel: ConnectionLevel = connection_levels.JUST_MET,
) => {
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
  const actionTitle = `Connect with all other fake connections - ${getConnectionLevelString(
    connectionLevel,
  )}`;

  await element(by.id('connectionTestBtn')).tap();
  // ActionSheet does not support testID, so match based on text.
  await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
  await waitFor(element(by.text(actionTitle))).toBeVisible();
  await element(by.text(actionTitle)).tap();

  // navigation is a mess. Connection Screen has standard back button,
  // connection list screen has our custom "NavHome" btn. So we need to
  // "nav back" once and then "nav home" ...
  await element(by.id('NavBackBtn')).tap();
  await navigateHome();
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
  await element(by.id('NavBackBtn')).tap();
  await navigateHome();
  await element(by.id('MyCodeBtn')).tap();
  await waitFor(element(by.id('ReconnectScreen')))
    .toBeVisible()
    .withTimeout(30000);
};

const clearData = async () => {
  await expectHomescreen();
  await element(by.id('JoinCommunityBtn')).tap();
  // Alert should be open
  await expect(element(by.text('WARNING'))).toBeVisible();
  // Confirm clearing data
  const platform = await device.getPlatform();
  if (platform === 'android') {
    await element(by.text('SURE')).tap();
  } else {
    await element(by.text('Sure')).tap();
  }

  // EULA screen should open
  await expect(element(by.id('EulaScreen'))).toBeVisible();
};

const navigateGroupsScreen = async () => {
  await expectHomescreen();
  await element(by.id('toggleDrawer')).tap();
  await expect(element(by.id('groupsBtn'))).toBeVisible();
  await element(by.id('groupsBtn')).tap();
  await expectGroupsScreen();
};

const createGroup = async (name: string, invitees: Array<number>) => {
  await expectHomescreen();
  await navigateGroupsScreen();
  // create group
  await element(by.id('addGroupBtn')).tap();
  await expect(element(by.id('groupInfoScreen'))).toBeVisible();
  await element(by.id('editGroupName')).tap();
  await element(by.id('editGroupName')).typeText(name);
  await element(by.id('editGroupName')).tapReturnKey();
  await expect(element(by.id('editGroupName'))).toHaveText(name);
  await element(by.id('editGroupPhoto')).tap();
  // proceed to next screen to invite connections
  await expect(element(by.id('nextBtn'))).toBeVisible();
  await element(by.id('nextBtn')).tap();
  await expect(element(by.id('newGroupScreen'))).toBeVisible();
  for (const inviteeIndex of invitees) {
    await element(by.id('checkInviteeBtn')).atIndex(inviteeIndex).tap();
  }
  await element(by.id('createNewGroupBtn')).tap();
  // we should be back at the Groups screen
  await expectGroupsScreen();

  await navigateHome();
};

// extract group ID and AESKey of groups
const getGroupKeys = async (
  numGroups: number,
): Promise<Array<{ id: string; aesKey: string }>> => {
  await expectHomescreen();
  await navigateGroupsScreen();
  const groupKeys: Array<{ id: string; aesKey: string }> = [];
  for (let index = 0; index < numGroups; index++) {
    const groupIDAttributs = await element(
      by.id('groupID').withAncestor(by.id(`groupItem-${index}`)),
    ).getAttributes(); // as ElementAttributes;
    const groupAESKeyAttributs = await element(
      by.id('groupAESKey').withAncestor(by.id(`groupItem-${index}`)),
    ).getAttributes(); // as ElementAttributes;
    groupKeys.push({
      id: (groupIDAttributs as any).text,
      aesKey: (groupAESKeyAttributs as any).text,
    });
  }
  await navigateHome();
  return groupKeys;
};

export {
  testUserName,
  acceptEula,
  clearData,
  createBrightID,
  createFakeConnection,
  createGroup,
  expectHomescreen,
  expectNotificationsScreen,
  expectConnectionsScreen,
  expectConnectionScreen,
  expectFindFriendsScreen,
  expectGroupsScreen,
  expectAppsScreen,
  getGroupKeys,
  interConnect,
  inviteConnectionToGroup,
  joinAllGroups,
  navigateHome,
  navigateGroupsScreen,
  operationTimeout,
  reconnect,
};
