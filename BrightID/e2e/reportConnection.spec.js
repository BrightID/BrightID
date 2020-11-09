// @flow
/* global device:false, element:false, by:false, waitFor:false */

import {
  createBrightID,
  createFakeConnection,
  expectConnectionsScreen,
  navigateHome,
} from './testUtils';
import { report_reasons } from '../src/utils/constants';

describe('Report Connections', () => {
  let hasBackButton = true;
  // $FlowIssue[incompatible-type]
  const reasons: Array<string> = Object.values(report_reasons);
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
      // wait upto 30 seconds till first connection is established
      await waitFor(element(by.id('connection-0')))
        .toBeVisible()
        .withTimeout(30000);
    });

    beforeEach(async () => {
      // open connection details of first connection
      await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
      await element(by.id('ConnectionCard-0')).tap();
      await expect(element(by.id('ConnectionScreen'))).toBeVisible();
      // click report button
      await element(by.id('ReportBtn')).tap();
      // modal should be open now
      await expect(element(by.id('ReportReasonModal'))).toBeVisible();
    });

    it(`should cancel report with Cancel button `, async () => {
      if (!hasBackButton) {
        return;
      }
      await element(by.id('CancelReportBtn')).tap();
      // modal should be closed
      await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
      // should still be on Connection Screen
      await expect(element(by.id('ConnectionScreen'))).toBeVisible();
      // all 4 connections should still exist
      await expect(
        element(by.id(`ConnectionCard-${remainingConnections - 1}`)),
      ).toBeVisible();
    });

    it(`should cancel report with backbutton `, async () => {
      await device.pressBack();
      // modal should be closed
      await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
      // should still be on Connection Screen
      await expect(element(by.id('ConnectionScreen'))).toBeVisible();
      // all 4 connections should still exist
      await expect(
        element(by.id(`ConnectionCard-${remainingConnections - 1}`)),
      ).toBeVisible();
    });

    afterAll(async () => {
      await navigateHome();
    });
  });

  reasons.forEach((reason) => {
    describe(reason, () => {
      beforeAll(async () => {
        // go to connections screen
        await element(by.id('connectionsBtn')).tap();
        await expectConnectionsScreen();
      });

      beforeEach(async () => {
        // wait upto 30 seconds till connection is established
        await waitFor(element(by.id('connection-0')))
          .toBeVisible()
          .withTimeout(30000);
        // open connection details of first connection
        await expect(element(by.id('ConnectionCard-0'))).toBeVisible();
        await element(by.id('ConnectionCard-0')).tap();
        await expect(element(by.id('ConnectionScreen'))).toBeVisible();
        // click report button
        await element(by.id('ReportBtn')).tap();
        // modal should be open now
        await expect(element(by.id('ReportReasonModal'))).toBeVisible();
      });

      it(`should confirm ${reason}`, async () => {
        const reasonButton = element(by.id(`${reason}-ReportBtn`));
        await expect(reasonButton).toBeVisible();
        await reasonButton.tap();
        // modal should be closed
        await expect(element(by.id('ReportReasonModal'))).not.toBeVisible();
        // should be back on Connections Screen
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
