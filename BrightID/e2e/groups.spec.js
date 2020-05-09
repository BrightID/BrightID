/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  createFakeConnection,
  expectGroupsScreen,
  expectHomescreen,
} from './testUtils';

/*
  Limitations:
  - All group tests are from group creator/admin perspective. There is no test
    for the "being invited" flow.
  - Inviting additional connections to a group is not tested (Can we get a fake connection
    being eligible to be invited?)
  - Creation and specific tests for primary groups are missing (Can't set the "primary"
    toggle to true from detox as it is a custom component without testID)
  - Group search is not tested against member name matches, as member names are random
 */

const firstGroupName = 'Reservoir Dogs';
const secondGroupName = 'Inglourious Basterds';

describe('Groups', () => {
  let hasBackButton = true;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // Reinstall app before starting tests to make sure all localStorage is cleared
    await device.launchApp({ delete: true });
    // create identity
    await createBrightID();
    // create 3 fake connections
    for (const i of [1, 2, 3]) {
      await element(by.id('tabBarConnectionsBtn')).tap();
      await createFakeConnection();
      await element(by.id('confirmConnectionBtn')).tap();
      await expect(element(by.id('successScreen'))).toBeVisible();
      await element(by.id('successDoneBtn')).tap();
      await expectHomescreen();
      await expect(element(by.id('ConnectionsCount'))).toHaveText(`${i}`);
    }
  });

  describe('Show initial group screen', () => {
    beforeAll(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
    });
    it('should show "noGroups" screen', async () => {
      await expect(element(by.id('noGroupsView'))).toBeVisible();
      await expect(element(by.id('groupsLearnMoreBtn'))).toBeVisible();
      await expect(element(by.id('groupsCreateGroupBtn'))).toBeVisible();
    });
    if (hasBackButton) {
      it('should show initial group and go back (backbutton)', async () => {
        await element(by.id('groupsCreateGroupBtn')).tap();
        await expect(element(by.id('groupInfoScreen'))).toBeVisible();
        await device.pressBack();
        await expect(element(by.id('noGroupsView'))).toBeVisible();
      });
    }
    it('should show initial group and go back', async () => {
      await element(by.id('groupsCreateGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
      await element(by.id('header-back')).tap();
      // header-back button takes 1-2 seconds to complete switch, so use waitFor() here
      await waitFor(element(by.id('noGroupsView')))
        .toBeVisible()
        .withTimeout(4000);
    });
  });

  describe('Create initial group (non-primary)', () => {
    beforeAll(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
      await element(by.id('groupsCreateGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
      await expect(element(by.id('primaryGroupView'))).toBeVisible();
    });

    it('should set group info', async () => {
      await element(by.id('editGroupName')).tap();
      await element(by.id('editGroupName')).typeText(firstGroupName);
      await element(by.id('editGroupName')).tapReturnKey();
      await expect(element(by.id('editGroupName'))).toHaveText(firstGroupName);
      await element(by.id('editGroupPhoto')).tap();
      // TODO: make this a primary group. Unfortunately detox can't match ToggleSwitch instance :-(
      // await element(by.id('primaryGroupToggle')).tap();
    });

    it('should set group Co-Founders', async () => {
      // proceed to next screen
      await expect(element(by.id('nextBtn'))).toBeVisible();
      await element(by.id('nextBtn')).tap();
      await expect(element(by.id('newGroupScreen'))).toBeVisible();
      // make the first 2 available connections co-founder
      await waitFor(element(by.id('checkCoFounderBtn')).atIndex(0))
        .toExist()
        .withTimeout(2000);
      await element(by.id('checkCoFounderBtn')).atIndex(0).tap();
      await element(by.id('checkCoFounderBtn')).atIndex(1).tap();
    });

    it('should create group', async () => {
      await element(by.id('createNewGroupBtn')).tap();
      await expect(element(by.id('createNewGroupBtn'))).toBeNotVisible();
      // if group was created successfully we should be back at the Groups screen
      await expectGroupsScreen();
      // there should be exactly one group now
      await expect(element(by.id('groupItem-0'))).toBeVisible();
      await expect(element(by.id('groupName'))).toHaveText(firstGroupName);
    });

    it('invited co-founders should join group', async () => {
      const actionSheetTitle = 'What do you want to do?';
      const actionTitle = 'Join All Groups';

      // open connection screen
      await element(by.id('tabBarConnectionsBtn')).tap();
      // let all three connections join groups
      for (const i of [0, 1, 2]) {
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(i))
          .toExist()
          .withTimeout(2000);
        await element(by.id('flagConnectionBtn')).atIndex(i).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(actionSheetTitle))).toBeVisible();
        await element(by.text(actionTitle)).tap();
        await element(by.text('OK')).tap();
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(0))
          .toNotExist()
          .withTimeout(2000);
      }
    });
  });

  describe('Create additional group (TODO: primary)', () => {
    beforeAll(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
      // there should be at least one group existing
      await expect(element(by.id('groupItem-0'))).toBeVisible();
      // add group
      await element(by.id('addGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
      await expect(element(by.id('primaryGroupView'))).toBeVisible();
    });

    it('should set group info', async () => {
      await element(by.id('editGroupName')).tap();
      await element(by.id('editGroupName')).typeText(secondGroupName);
      await element(by.id('editGroupName')).tapReturnKey();
      await expect(element(by.id('editGroupName'))).toHaveText(secondGroupName);
      await element(by.id('editGroupPhoto')).tap();
      // TODO: figure out how to toggle the "primary" switch with detox and make this
      //   the primary group
    });

    it('should set group Co-Founders', async () => {
      // proceed to next screen
      await expect(element(by.id('nextBtn'))).toBeVisible();
      await element(by.id('nextBtn')).tap();
      await expect(element(by.id('newGroupScreen'))).toBeVisible();
      // make the 2nd and third available connections co-founder
      await waitFor(element(by.id('checkCoFounderBtn')).atIndex(1))
        .toExist()
        .withTimeout(2000);
      await element(by.id('checkCoFounderBtn')).atIndex(1).tap();
      await element(by.id('checkCoFounderBtn')).atIndex(2).tap();
    });

    it('should create group', async () => {
      await element(by.id('createNewGroupBtn')).tap();
      await expect(element(by.id('createNewGroupBtn'))).toBeNotVisible();
      // if group was created successfully we should be back at the Groups screen
      await expectGroupsScreen();
      // there should be exactly two groups now
      await expect(element(by.id('groupItem-0'))).toBeVisible();
      await expect(element(by.id('groupItem-1'))).toBeVisible();
    });

    it('invited co-founders should join group', async () => {
      const actionSheetTitle = 'What do you want to do?';
      const actionTitle = 'Join All Groups';

      // open connection screen
      await element(by.id('tabBarConnectionsBtn')).tap();
      // let all three connections join groups
      for (const i of [0, 1, 2]) {
        await waitFor(element(by.id('flagConnectionBtn')).atIndex(i))
          .toExist()
          .withTimeout(2000);
        await element(by.id('flagConnectionBtn')).atIndex(i).tap();
        // ActionSheet does not support testID, so try to match based on text.
        await expect(element(by.text(actionSheetTitle))).toBeVisible();
        await element(by.text(actionTitle)).tap();
        await element(by.text('OK')).tap();
      }
    });
  });

  describe('Groups screen search', () => {
    beforeAll(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
      // there should be two groups existing, so look for testID suffix '-1'
      await expect(element(by.id('groupItem-1'))).toBeVisible();
      await element(by.id('searchParam')).clearText();
    });

    afterEach(async () => {
      await element(by.id('searchParam')).clearText();
    });

    it(`should find group "${firstGroupName}"`, async () => {
      await element(by.id('searchParam')).typeText('voir');
      await element(by.id('searchParam')).tapReturnKey();
      await expect(element(by.id('searchParam'))).toHaveText('voir');
      await expect(element(by.text(firstGroupName))).toBeVisible();
      await expect(element(by.text(secondGroupName))).toBeNotVisible();
    });

    it(`should find group "${secondGroupName}"`, async () => {
      await element(by.id('searchParam')).typeText('aster');
      await element(by.id('searchParam')).tapReturnKey();
      await expect(element(by.id('searchParam'))).toHaveText('aster');
      await expect(element(by.text(secondGroupName))).toBeVisible();
      await expect(element(by.text(firstGroupName))).toBeNotVisible();
    });

    it('should show "no match" info', async () => {
      await element(by.id('searchParam')).typeText('not matching');
      await element(by.id('searchParam')).tapReturnKey();
      await expect(element(by.id('noMatchText'))).toBeVisible();
    });

    it('should clear searchParam with eraser button', async () => {
      await element(by.id('searchParam')).typeText('not matching');
      await element(by.id('searchParam')).tapReturnKey();
      await expect(element(by.id('noMatchText'))).toBeVisible();
      await element(by.id('clearSearchParamBtn')).tap();
      await expect(element(by.id('searchParam'))).toHaveText('');
    });

    test.todo('match by group member name');
  });

  describe('Group Management', () => {
    beforeAll(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
      // there should be two groups existing, so look for testID suffix '-1'
      await expect(element(by.id('groupItem-1'))).toBeVisible();
    });

    beforeEach(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await element(by.id('tabBarGroupsBtn')).tap();
      await expectGroupsScreen();
    });

    it('group should have ellipsis menu', async () => {
      // select first group
      await element(by.id('groupItem-0')).tap();
      await expect(element(by.id('membersView'))).toBeVisible();
      await expect(element(by.id('groupOptionsBtn'))).toBeVisible();
      await element(by.id('groupOptionsBtn')).tap();
      // now actionsheet should be open
      await expect(element(by.text('What do you want to do?'))).toBeVisible();
      await expect(element(by.text('Invite'))).toBeVisible();
      await expect(element(by.text('Leave Group'))).toBeVisible();
      await expect(element(by.text('cancel'))).toBeVisible();
      // close actionsheet without changing anything
      await element(by.text('cancel')).tap();
      await expect(element(by.id('membersView'))).toBeVisible();
    });

    it('should leave first group and cancel', async () => {
      await element(by.id('groupItem-0')).tap();
      await expect(element(by.id('groupOptionsBtn'))).toBeVisible();
      await element(by.id('groupOptionsBtn')).tap();
      await expect(element(by.text('Leave Group'))).toBeVisible();
      await element(by.text('Leave Group')).tap();
      // back out with CANCEL button
      await element(by.text('CANCEL')).tap();
      await expect(
        element(by.text('What do you want to do?')),
      ).toBeNotVisible();
      await expect(element(by.id('membersView'))).toBeVisible();
    });

    it('should leave first group and confirm', async () => {
      await element(by.id('groupItem-0')).tap();
      await expect(element(by.id('groupOptionsBtn'))).toBeVisible();
      await element(by.id('groupOptionsBtn')).tap();
      await element(by.text('Leave Group')).tap();
      // confirm with OK button
      await element(by.text('OK')).tap();
      // should be back at groups screen
      await expectGroupsScreen();
    });

    test.todo('should invite connection to group');
    test.todo('should leave primary group');
  });
});
