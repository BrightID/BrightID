/* global element:false, by:false, waitFor:false */

const testUserName = 'Vincent Vega';

const createBrightID = async (name = testUserName) => {
  await element(by.id('getStartedBtn')).tap();
  await element(by.id('editName')).tap();
  await element(by.id('editName')).typeText(name);
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
  return name;
};

export { testUserName, createBrightID };
