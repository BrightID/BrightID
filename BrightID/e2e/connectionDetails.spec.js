// @flow
/* global element:false, by:false, waitFor:false, device: false */
import i18next from 'i18next';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionScreen,
  expectConnectionsScreen,
  expectGroupsScreen,
  expectHomescreen,
  interConnect,
  joinAllGroups,
  navigateHome,
} from './testUtils';
import { connectionLevelStrings } from '../src/utils/connectionLevelStrings';
import { connection_levels } from '../src/utils/constants';

describe('Connection details', () => {
  const groupName = 'Test Group';

  beforeAll(async () => {
    // create identity
    await createBrightID();

    // create 5 fake connections
    await createFakeConnection();
    await createFakeConnection();
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
    await waitFor(element(by.id('connection-3')))
      .toExist()
      .withTimeout(20000);
    await waitFor(element(by.id('connection-4')))
      .toExist()
      .withTimeout(20000);

    await navigateHome();
    await expectHomescreen();

    // interconnect first 2 fake accounts to have mutual connections
    await interConnect(0);
    await interConnect(1);

    // create a group - enter group info
    await element(by.id('groupsBtn')).tap();
    await expectGroupsScreen();
    await element(by.id('groupsCreateGroupBtn')).tap();
    await expect(element(by.id('groupInfoScreen'))).toBeVisible();
    await element(by.id('editGroupName')).tap();
    await element(by.id('editGroupName')).typeText(groupName);
    await element(by.id('editGroupName')).tapReturnKey();
    await element(by.id('editGroupPhoto')).tap();
    // wait 5 seconds until group photo be loaded
    await new Promise((r) => setTimeout(r, 5000));

    // invite cofounder
    await expect(element(by.id('nextBtn'))).toBeVisible();
    await element(by.id('nextBtn')).tap();
    await expect(element(by.id('newGroupScreen'))).toBeVisible();
    // wait until 2 connections are there, sometimes they appear only after a few seconds
    await waitFor(element(by.id('checkCoFounderBtn')).atIndex(1))
      .toExist()
      .withTimeout(20000);
    // make the first 2 available connections co-founder
    await element(by.id('checkCoFounderBtn')).atIndex(0).tap();
    await element(by.id('checkCoFounderBtn')).atIndex(1).tap();
    // create group
    await element(by.id('createNewGroupBtn')).tap();
    await expect(element(by.id('createNewGroupBtn'))).not.toBeVisible();
    // if group was created successfully we should be back at the Groups screen
    await expectGroupsScreen();
    // there should be exactly one group now
    await expect(element(by.id('groupItem-0'))).toBeVisible();
    await expect(element(by.id('groupName'))).toHaveText(groupName);

    // Have first 2 accounts accept group invites
    await navigateHome();
    await expectHomescreen();
    await joinAllGroups(0);
    await joinAllGroups(1);

    // Check if cofounders actually joined the groups
    // navigate to groups screen
    await element(by.id('groupsBtn')).tap();
    // wait 30 seconds until all join ops should be done on the backend
    await new Promise((r) => setTimeout(r, 30000));
    // refresh
    await element(by.id('groupsFlatList')).swipe('down');

    // Text changes to "Known members" when all invited people have joined
    await waitFor(
      element(by.text(i18next.t('groups.label.knownMembers'))).atIndex(0),
    )
      .toBeVisible()
      .withTimeout(30000);
    await navigateHome();
    await expectHomescreen();
  });

  describe('Information', () => {
    beforeAll(async () => {
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      // open connection details of first connection
      await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
      await element(by.id('ConnectionCard-0')).tap();
      await expectConnectionScreen();
    });
    afterAll(async () => {
      await element(by.id('header-back')).tap();
      await navigateHome();
      await expectHomescreen();
    });
    test('should show correct connection level', async () => {
      await expect(element(by.id('ConnectionLevelText'))).toHaveText(
        connectionLevelStrings[connection_levels.JUST_MET],
      );
    });

    test('should show correct mutual connections count', async () => {
      await expect(element(by.id('connections-count'))).toBeVisible();
      await expect(element(by.id('connections-count'))).toHaveText('4');
    });
    test('should show correct mutual groups count', async () => {
      await expect(element(by.id('groups-count'))).toBeVisible();
      await expect(element(by.id('groups-count'))).toHaveText('1');
    });
    test('should expand and collapse mutual connections', async () => {
      const itemTestId = 'connections-0';
      const toggleButton = element(by.id('connections-toggleBtn'));
      const firstItem = element(by.id(itemTestId));
      await expect(toggleButton).toBeVisible();
      // initially item should not be visible
      await expect(firstItem).not.toBeVisible();
      // expand list
      await toggleButton.tap();
      // item should be visible now
      await expect(firstItem).toBeVisible();
      // hide list
      await toggleButton.tap();
      // item should not be visible anymore
      await expect(firstItem).not.toBeVisible();
    });
    test('should expand and collapse mutual groups', async () => {
      const itemTestId = 'groups-0';
      const toggleButton = element(by.id('groups-toggleBtn'));
      const firstItem = element(by.id(itemTestId));
      await expect(toggleButton).toBeVisible();
      // initially item should not be visible
      await expect(firstItem).not.toBeVisible();
      // expand list
      await toggleButton.tap();
      // item should be visible now
      await expect(firstItem).toBeVisible();
      // hide list
      await toggleButton.tap();
      // item should not be visible anymore
      await expect(firstItem).not.toBeVisible();
      await expect(element(by.id('groups-toggleBtn'))).toBeVisible();
    });
  });

  describe('Connection level', () => {
    beforeAll(async () => {
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      // open connection details of first connection
      await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
      await element(by.id('ConnectionCard-0')).tap();
      await expectConnectionScreen();
    });

    afterAll(async () => {
      await element(by.id('header-back')).tap();
      await navigateHome();
      await expectHomescreen();
    });

    test('should change connection level', async () => {
      const slider = element(by.id('ConnectionLevelSlider'));
      const sliderText = element(by.id('ConnectionLevelSliderText'));

      // open popup
      await element(by.id('EditConnectionLevelBtn')).tap();
      await expect(element(by.id('ConnectionLevelSliderPopup'))).toBeVisible();
      // check initial value
      await expect(sliderText).toHaveText(
        connectionLevelStrings[connection_levels.JUST_MET],
      );
      // set new value by swiping right
      // "adjustSliderToPosition" is only available on iOS, so we have to use the not-so-exact "swipe" method
      // This will swipe all the way to the right, so the new expected level is RECOVERY
      await slider.swipe('right', 'fast');
      await expect(sliderText).toHaveText(
        connectionLevelStrings[connection_levels.RECOVERY],
      );

      // click save button
      await element(by.id('SaveLevelBtn')).tap();
      // popup should be closed
      await expect(
        element(by.id('ConnectionLevelSliderPopup')),
      ).not.toBeVisible();
      // verify new value is displayed
      await expect(element(by.id('ConnectionLevelText'))).toHaveText(
        connectionLevelStrings[connection_levels.RECOVERY],
      );
      // wait 30 seconds until operation is confirmed in the backend
      await new Promise((r) => setTimeout(r, 30000));
      // verify new value is still displayed after operation confirmed
      await expect(element(by.id('ConnectionLevelText'))).toHaveText(
        connectionLevelStrings[connection_levels.RECOVERY],
      );
    });
  });
});
