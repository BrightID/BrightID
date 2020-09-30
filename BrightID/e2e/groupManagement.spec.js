/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  expectGroupsScreen,
  navigateHome,
} from './testUtils';

/*
  Limitations:
  - All group tests are from group creator/admin perspective. There is no test
    for the "being invited" flow.
  - Inviting additional connections to a group is not tested (Can we get a fake connection
    being eligible to be invited?)
  - Group search is not tested against member name matches, as member names are random
 */

const GroupName = 'Reservoir Dogs';

describe('Group Management', () => {
  let hasBackButton = true;
  let cancelText = 'Cancel';
  let leaveGroupText = 'Leave group';
  let inviteUserText = 'Invite user';

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity
    await createBrightID();
  });

  it(`prepare connections`, async () => {
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

  it(`Interconnect all connections`, async () => {
    await element(by.id('connectionsBtn')).tap();
    await expectConnectionsScreen();

    // interconnect all fake connections with each other
    const actionSheetTitle = 'What do you want to do?';
    const actionTitle = 'Connect to other fake connections';
    for (let i of [0, 1, 2]) {
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
  });

  describe('Create group', () => {
    beforeAll(async () => {
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
      await element(by.id('editGroupName')).typeText(GroupName);
      await element(by.id('editGroupName')).tapReturnKey();
      await expect(element(by.id('editGroupName'))).toHaveText(GroupName);
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
      await expect(element(by.id('groupName'))).toHaveText(GroupName);
    });

    it('invited co-founders should join group', async () => {
      const actionSheetTitle = 'What do you want to do?';
      const actionTitle = 'Join All Groups';

      await navigateHome();
      // open connection screen
      await element(by.id('connectionsBtn')).tap();
      // let all three connections join groups
      for (const i of [0, 1, 2]) {
        // swipe left to reach flagBtn
        await element(by.id('connectionCardContainer'))
          .atIndex(i)
          .swipe('left');
        await waitFor(element(by.id('flagBtn')).atIndex(i))
          .toBeVisible()
          .withTimeout(20000);
        await element(by.id('flagBtn')).atIndex(i).tap();

        // ActionSheet does not support testID, so match based on text.
        await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
        await element(by.text(actionTitle)).tap();
      }

      // Check if cofounders actually joined the groups
      await navigateHome();
      // navigate to groups screen
      await element(by.id('groupsBtn')).tap();
      // wait 20 seconds until all join ops should be done on the backend
      await new Promise((r) => setTimeout(r, 2000));
      // refresh
      await element(by.id('groupsFlatList')).swipe('down');
      // Text changes to "Known members: " when all invited people have joined
      await waitFor(element(by.text('Known members: '))).toBeVisible();
    });
  });

  describe('Invite user', () => {
    beforeAll(async () => {
      // navigate to groups screen
      await element(by.id('groupsBtn')).tap();
    });

    beforeEach(async () => {
      // make sure to be on the groups tab/screen before starting tests
      await expectGroupsScreen();
      // reload groups
      await element(by.id('groupsFlatList')).swipe('down');
      await expectGroupsScreen();
    });

    afterAll(async () => {
      await navigateHome();
    });

    it('should invite connection to group', async () => {
      // open group
      await element(by.text(GroupName)).tap();
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
      // there should be one eligible candidate for this group
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
      // should still be on group members screen, so go back
      await navigateHome();
      // navigate to connections screen to make invited user join the group
      await element(by.id('connectionsBtn')).tap();

      // to simplify test script just click on all flagBtns and join groups
      const actionSheetTitle = 'What do you want to do?';
      const actionTitle = 'Join All Groups';
      // let all three connections join groups
      for (const i of [0, 1, 2]) {
        // swipe left to reach flagBtn
        await element(by.id('connectionCardContainer'))
          .atIndex(i)
          .swipe('left');
        await waitFor(element(by.id('flagBtn')).atIndex(i))
          .toBeVisible()
          .withTimeout(20000);
        await element(by.id('flagBtn')).atIndex(i).tap();

        // ActionSheet does not support testID, so match based on text.
        await waitFor(element(by.text(actionSheetTitle))).toBeVisible();
        await element(by.text(actionTitle)).tap();
      }

      // check group members
      await navigateHome();
      // navigate to groups screen
      await element(by.id('groupsBtn')).tap();
      // reload groups
      await element(by.id('groupsFlatList')).swipe('down');
      // open group
      await element(by.text(GroupName)).tap();
      // Group should now have 4 members
      await expect(element(by.id('memberItem-3'))).toBeVisible();
    });

    test.todo('should dismiss member from group');
    test.todo('should promote member of group to admin');

    // Commented out as this test hangs forever after clicking OK :-(
    // it('should leave group', async () => {
    //   await element(by.id('groupItem-0')).tap();
    //   await expect(element(by.id('groupOptionsBtn'))).toBeVisible();
    //   await element(by.id('groupOptionsBtn')).tap();
    //   await expect(element(by.text(leaveGroupText))).toBeVisible();
    //   await element(by.text(leaveGroupText)).tap();
    //   // confirm with OK button
    //   await expect(element(by.text('OK'))).toBeVisible();
    //   await element(by.text('OK')).tap(); // <-- this tap action hangs forever in detox
    //   // should be back at groups screen
    //   await expectGroupsScreen();
    //   // only one group should be left
    //   await expect(element(by.id('groupItem-1'))).not.toExist();
    // });
  });
});
