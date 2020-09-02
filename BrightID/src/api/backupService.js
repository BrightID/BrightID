// @flow

import { create, ApiSauceInstance, ApiResponse } from 'apisauce';
import nacl from 'tweetnacl';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
} from '@/utils/encoding';
import { obtainKeys } from '@/utils/keychain';
import store from '@/store';

let recoveryUrl = 'https://recovery.brightid.org';
let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

class BackupService {
  recoveryApi: ApiSauceInstance;

  profileApi: ApiSauceInstance;

  constructor() {
    this.recoveryApi = create({
      baseURL: recoveryUrl,
    });
    this.profileApi = create({
      baseURL: seedUrl,
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

  async getRecovery(key1: string, key2: string) {
    let res = await this.recoveryApi.get(
      `/backups/${b64ToUrlSafeB64(key1)}/${b64ToUrlSafeB64(key2)}`,
    );
    BackupService.throwOnError(res);
    return res;
  }

  async putRecovery(key1: string, key2: string, data: string) {
    let res = await this.recoveryApi.put(
      `/backups/${b64ToUrlSafeB64(key1)}/${b64ToUrlSafeB64(key2)}`,
      {
        data,
      },
    );
    BackupService.throwOnError(res);
  }

  async getSig() {
    try {
      let { publicKey } = store.getState().recoveryData;
      let res = await this.profileApi.get(
        `/profile/download/${b64ToUrlSafeB64(publicKey)}`,
      );
      BackupService.throwOnError(res);
      return res.data.data;
    } catch (err) {
      console.warn(err);
    }
  }

  async setSig({
    id,
    timestamp,
    signingKey,
  }: {
    id: string,
    timestamp: string,
    signingKey: string,
  }) {
    try {
      let { username, secretKey } = await obtainKeys();

      let message = `Set Signing Key${id}${signingKey}${timestamp}`;

      let sig = uInt8ArrayToB64(
        nacl.sign.detached(strToUint8Array(message), secretKey),
      );

      let data = { signer: username, id, sig };

      let res = await this.profileApi.post(`/profile/upload`, {
        data,
        uuid: b64ToUrlSafeB64(signingKey),
      });
      BackupService.throwOnError(res);
      console.log('setSig');
    } catch (err) {
      console.warn(err);
    }
  }
}

const backupService = new BackupService();

export default backupService;
