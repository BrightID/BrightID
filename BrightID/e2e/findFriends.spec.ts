import { by, element, expect } from 'detox';
import { createBrightID, expectFindFriendsScreen } from './testUtils';
import { testContacts } from '@/utils/ContactsProvider.e2e';

describe('Find friends', () => {
  beforeAll(async () => {
    // create identity
    await createBrightID();

    // open find friends screen
    await element(by.id('toggleDrawer')).tap();
    await expect(element(by.id('findFriendsBtn'))).toBeVisible();
    await element(by.id('findFriendsBtn')).tap();
    await expectFindFriendsScreen();
  });

  describe('should find friend', () => {
    // check if mock contacts are displayed
    for (const contact of testContacts) {
      for (const variation of ['Email', 'Phone Number']) {
        const testId = `${contact.displayName}-${variation}`;
        it(testId, async () => {
          await expect(element(by.id(testId))).toBeVisible();
        });
      }
    }
  });
});
