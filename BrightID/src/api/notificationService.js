// @flow

import { create, ApiSauceInstance, ApiResponse } from 'apisauce';
import { DEVICE_OS } from '@/utils/constants';

let notificationUrl = 'https://notify.brightid.org';
if (__DEV__) {
  notificationUrl = 'https://notify-test.brightid.org';
}

class NotificationService {
  notifyApi: ApiSauceInstance;

  constructor() {
    this.notifyApi = create({
      baseURL: notificationUrl,
    });
  }

  static throwOnError(response: ApiResponse) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.errorMessage) {
      throw new Error(response.data.errorMessage);
    }
    throw new Error(response.problem);
  }

  async getToken({ deviceToken, notificationToken, oldDeviceToken }) {
    const res = await this.notifyApi.post(`/token`, {
      deviceToken,
      deviceOS: DEVICE_OS,
      notificationToken,
      oldDeviceToken,
    });
    NotificationService.throwOnError(res);
    return res.data;
  }

  async sendNotification({
    notificationToken,
    type,
    payload,
  }: {
    notificationToken: string,
    type: string,
    payload: { [val: string]: string },
  }) {
    const notificationTokens = [notificationToken];
    const res = await this.notifyApi.post(`/push`, {
      notificationTokens,
      type,
      payload,
    });

    console.log(res.data);

    NotificationService.throwOnError(res);
    // return res.data;
  }
}

const notificationService = new NotificationService();

export default notificationService;
