import { by, element, expect } from 'detox';
import { report_reasons } from '@/utils/constants';
import {
  createBrightID,
  createFakeConnection,
  expectConnectionScreen,
  expectConnectionsScreen,
  navigateHome,
  operationTimeout,
} from './testUtils';

describe('Report Connections', () => {
  let hasBackButton = true;
  const reasons = [
    report_reasons.DUPLICATE,
    report_reasons.REPLACED,
    report_reasons.OTHER,
  ];
  let remainingConnections = 4;

  beforeAll(async () => {
    const platform = await device.getPlatform();
    hasBackButton = platform === 'android';
    // create identity
    await createBrightID();
    // create 4 fake connections
    await createFakeConnection();
    await createFakeConnection();
    await createFakeConnection();
    await createFakeConnection();
  });

  describe('Cancel reporting', () => {
    beforeAll(async () => {
      // go to connections screen
      await element(by.id('connectionsBtn')).tap();
      await expectConnectionsScreen();
      // wait till first connection is established
      await waitFor(element(by.id('connection-0')))
        .toBeVisible()
        .withTimeout(operationTimeout);
    });

    beforeEach(async () => {
      // open connection details of first connection
      await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
      await element(by.id('ConnectionCard-0')).tap();
      await expectConnectionScreen();
      // click report button
      await element(by.id('ReportBtn')).tap();
      // modal should be open now
      await expect(element(by.id('ReportReasonModal'))).toBeVisible();
    });

    it(`should cancel report with Cancel button `, async () => {
      await element(by.id('CancelReportBtn')).tap();
      // modal should be closed
      await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
      // should still be on Connection Screen
      await expectConnectionScreen();
      // all 4 connections should still exist
      await expect(
        element(by.id(`ConnectionCard-${remainingConnections - 1}`)),
      ).toBeVisible();
    });

    it(`should cancel report with backbutton `, async () => {
      if (!hasBackButton) {
        return;
      }
      await device.pressBack();
      // modal should be closed
      await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
      // should still be on Connection Screen
      await expectConnectionScreen();
      // all 4 connections should still exist
      await expect(
        element(by.id(`ConnectionCard-${remainingConnections - 1}`)),
      ).toBeVisible();
    });

    afterAll(async () => {
      await element(by.id('header-back')).tap();
      await navigateHome();
    });
  });

  reasons.forEach((reason) => {
    describe(`Report as ${reason}`, () => {
      beforeAll(async () => {
        // go to connections screen
        await element(by.id('connectionsBtn')).tap();
        await expectConnectionsScreen();
      });

      beforeEach(async () => {
        // wait till connection is established
        await waitFor(element(by.id('connection-0')))
          .toBeVisible()
          .withTimeout(operationTimeout);
        // open connection details of first connection
        await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
        await element(by.id('ConnectionCard-0')).tap();
        await expectConnectionScreen();
        // click report button
        await element(by.id('ReportBtn')).tap();
        // modal should be open now
        await expect(element(by.id('ReportReasonModal'))).toBeVisible();
      });

      it(`should confirm ${reason}`, async () => {
        const reasonButton = element(by.id(`${reason}-RadioBtn`));
        const submitButton = element(by.id('SubmitReportBtn'));
        await expect(reasonButton).toBeVisible();
        await reasonButton.tap();
        // click Submit button
        await submitButton.tap();
        // modal should be closed
        await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
        // go back to connections screen
        await element(by.id('header-back')).tap();
        await expectConnectionsScreen();
        // remaining connections should still exist
        remainingConnections -= 1;
        if (remainingConnections > 0) {
          await expect(
            element(by.id(`ConnectionCard-${remainingConnections - 1}`)),
          ).toBeVisible();
        } else {
          // no connection should be there
          await expect(element(by.id(`ConnectionCard-0`))).not.toBeVisible();
        }
      });

      afterAll(async () => {
        await navigateHome();
      });
    });
  });
});
