/* global device:false, element:false, by:false, waitFor:false */

describe('Homescreen', () => {
  const userName = 'Johnny Knoxville';
  beforeAll(async () => {
    // Reinstall app before starting tests to make sure all localStorage is cleared
    await device.launchApp({ delete: true });

    // create BrightID for following tests
    await element(by.id('getStartedBtn')).tap();
    await element(by.id('editName')).tap();
    await element(by.id('editName')).typeText(userName);
    await element(by.id('editName')).tapReturnKey();
    await element(by.id('addPhoto')).tap();
    // ActionSheet does not support testID prop, so match based on text.
    await expect(element(by.text('Select photo'))).toBeVisible();
    // Following call is mocked through @utils/images.e2e.js to skip OS image picker
    await element(by.text('Choose From Library')).tap();
    // Wait until photo is loaded
    await waitFor(element(by.id('editPhoto')))
      .toBeVisible()
      .withTimeout(2000);
    // create new ID
    await element(by.id('createBrightIDBtn')).tap();
    // should end up at home screen
    await waitFor(element(by.id('homeScreen')))
      .toBeVisible()
      .withTimeout(2000);
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should show all elements', async () => {
    await expect(element(by.id('PhotoContainer'))).toBeVisible();
    await expect(element(by.id('ScoreContainer'))).toBeVisible();
    await expect(element(by.id('ConnectionsCount'))).toBeVisible();
    await expect(element(by.id('GroupsCount'))).toBeVisible();
    await expect(element(by.id('VerificationsContainer'))).toBeVisible();
    await expect(element(by.id('ConnectButton'))).toBeVisible();
  });

  /*
    open chat action sheet, check all options are there and close again
  */
  it('should show chat ActionSheet after tap on chat button', async () => {
    // ActionSheet does not support testID, so try to match based on text.
    await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
    await element(by.id('chatButton')).tap();
    await expect(element(by.text('Like to chat with us?'))).toBeVisible();
    await expect(element(by.text('BrightID Discord'))).toBeVisible();
    await element(by.text('cancel')).tap();
    await expect(element(by.text('Like to chat with us?'))).toBeNotVisible();
  });

  it('should edit profile name', async () => {
    const newName = 'John Travolta';
    await expect(element(by.id('EditNameBtn'))).toHaveText(userName);
    await element(by.id('EditNameBtn')).tap();
    await element(by.id('EditNameInput')).clearText();
    await device.disableSynchronization();
    await element(by.id('EditNameInput')).typeText(newName);
    await device.enableSynchronization();
    await element(by.id('EditNameInput')).tapReturnKey();
    await expect(element(by.id('EditNameBtn'))).toHaveText(newName);
  });
});
