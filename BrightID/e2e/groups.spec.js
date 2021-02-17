/* global device:false, element:false, by:false, waitFor:false */

import i18next from 'i18next';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectGroupsScreen,
  expectHomescreen,
  interConnect,
  joinAllGroups,
  navigateHome,
} from './testUtils';

/*
  Limitations:
  - Group search is not tested against member name matches, as member names are random
 */
const firstGroupName = 'Reservoir Dogs';
const secondGroupName = 'Inglourious Basterds';

describe('Groups', () => {
  let hasBackButton = true;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity
    await createBrightID();

    // create 3 fake connections
    await createFakeConnection();
    await createFakeConnection();
    await createFakeConnection();

    // make sure all connections are established
    await element(by.id('connectionsBtn')).tap();
    await expectConnectionsScreen();
    await waitFor(element(by.id('connection-0')))
      .toExist()
      .withTimeout(20000);
    await waitFor(element(by.id('connection-1')))
      .toExist()
      .withTimeout(20000);
    await waitFor(element(by.id('connection-2')))
      .toExist()
      .withTimeout(20000);

    await navigateHome();
  });

  describe('Show initial group screen', () => {
    beforeAll(async () => {
      // make sure to be on the groups screen before starting tests
      await element(by.id('groupsBtn')).tap();
      await expectGroupsScreen();
    });

    afterAll(async () => {
      await navigateHome();
    });

    it('should show "noGroups" screen', async () => {
      await expect(element(by.id('noGroupsView'))).toBeVisible();
      await expect(element(by.id('groupsLearnMoreBtn'))).toBeVisible();
      await expect(element(by.id('groupsCreateGroupBtn'))).toBeVisible();
    });

    it('should show group creation screen and go back (backbutton)', async () => {
      if (!hasBackButton) return;

      await element(by.id('groupsCreateGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
      await device.pressBack();
      await expect(element(by.id('noGroupsView'))).toBeVisible();
    });

    it('should show group creation screen and go back', async () => {
      await element(by.id('groupsCreateGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
      await element(by.id('header-back')).tap();
      // header-back button takes 1-2 seconds to complete switch, so use waitFor() here
      await waitFor(element(by.id('noGroupsView')))
        .toBeVisible()
        .withTimeout(20000);
    });
  });

  describe('Create initial group', () => {
    beforeAll(async () => {
      // Connect all fake connections with each other
      await interConnect(0);
      await interConnect(1);
      await interConnect(2);

      // navigate to group creation screen
      await element(by.id('groupsBtn')).tap();
      await expectGroupsScreen();
      await element(by.id('groupsCreateGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
    });

    afterAll(async () => {
      await navigateHome();
    });

    it('should set group info', async () => {
      await element(by.id('editGroupName')).tap();
      await element(by.id('editGroupName')).typeText(firstGroupName);
      await element(by.id('editGroupName')).tapReturnKey();
      await expect(element(by.id('editGroupName'))).toHaveText(firstGroupName);
      await element(by.id('editGroupPhoto')).tap();
    });

    it('should set group Co-Founders', async () => {
      // proceed to next screen
      await expect(element(by.id('nextBtn'))).toBeVisible();
      await element(by.id('nextBtn')).tap();
      await expect(element(by.id('newGroupScreen'))).toBeVisible();
      // wait until 3 connections are there, sometimes they appear only after a few seconds
      await waitFor(element(by.id('checkCoFounderBtn')).atIndex(2))
        .toExist()
        .withTimeout(20000);
      // make the first 2 available connections co-founder
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
  });

  describe('Create additional group', () => {
    beforeAll(async () => {
      // navigate to group creation screen
      await element(by.id('groupsBtn')).tap();
      await expectGroupsScreen();
      // there should be at least one group existing
      await expect(element(by.id('groupItem-0'))).toBeVisible();
      // add group
      await element(by.id('addGroupBtn')).tap();
      await expect(element(by.id('groupInfoScreen'))).toBeVisible();
    });

    afterAll(async () => {
      await navigateHome();
    });

    it('should set group info', async () => {
      await element(by.id('editGroupName')).tap();
      await element(by.id('editGroupName')).typeText(secondGroupName);
      await element(by.id('editGroupName')).tapReturnKey();
      await expect(element(by.id('editGroupName'))).toHaveText(secondGroupName);
      await element(by.id('editGroupPhoto')).tap();
    });

    it('should set group Co-Founders', async () => {
      // proceed to next screen
      await expect(element(by.id('nextBtn'))).toBeVisible();
      await element(by.id('nextBtn')).tap();
      await expect(element(by.id('newGroupScreen'))).toBeVisible();
      // make the 2nd and third available connections co-founder
      await waitFor(element(by.id('checkCoFounderBtn')).atIndex(1))
        .toExist()
        .withTimeout(20000);
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
      await navigateHome();
    });

    it('invited co-founders should join group', async () => {
      // accept invitation
      await joinAllGroups(0);
      await joinAllGroups(1);
      await joinAllGroups(2);

      // Check if cofounders actually joined the groups
      await expectHomescreen();
      // navigate to groups screen
      await element(by.id('groupsBtn')).tap();
      // wait 30 seconds until all join ops should be done on the backend
      await new Promise((r) => setTimeout(r, 30000));
      // refresh
      await element(by.id('groupsFlatList')).swipe('down');
      // Text changes to "Known members: " when all invited people have joined
      await waitFor(
        element(by.text(i18next.t('groups.label.knownMembers'))).atIndex(0),
      )
        .toBeVisible()
        .withTimeout(30000);
      await waitFor(
        element(by.text(i18next.t('groups.label.knownMembers'))).atIndex(1),
      )
        .toBeVisible()
        .withTimeout(30000);
    });
  });

  describe('Groups screen search', () => {
    beforeAll(async () => {
      // navigate to groups screen
      await element(by.id('groupsBtn')).tap();
      await expectGroupsScreen();
      // there should be two groups existing, so look for testID suffix '-1'
      await expect(element(by.id('groupItem-1'))).toBeVisible();
      // open search bar
      await element(by.id('SearchBarBtn')).tap();
    });

    afterEach(async () => {
      await element(by.id('SearchParam')).clearText();
    });

    afterAll(async () => {
      await navigateHome();
    });

    it(`should find group "${firstGroupName}"`, async () => {
      await element(by.id('SearchParam')).typeText('voir');
      await element(by.id('SearchParam')).tapReturnKey();
      await expect(element(by.text(firstGroupName))).toBeVisible();
      await expect(element(by.text(secondGroupName))).toBeNotVisible();
    });

    it(`should find group "${secondGroupName}"`, async () => {
      await element(by.id('SearchParam')).typeText('aster');
      await element(by.id('SearchParam')).tapReturnKey();
      await expect(element(by.id('SearchParam'))).toHaveText('aster');
      await expect(element(by.text(secondGroupName))).toBeVisible();
      await expect(element(by.text(firstGroupName))).toBeNotVisible();
    });

    it('should show "no match" info', async () => {
      await element(by.id('SearchParam')).typeText('not matching');
      await element(by.id('SearchParam')).tapReturnKey();
      await expect(element(by.id('noMatchText'))).toBeVisible();
    });

    test.todo('match by group member name');
  });
});
