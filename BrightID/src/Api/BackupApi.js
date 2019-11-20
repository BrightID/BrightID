// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';
import store from '../store';

let seedUrl = 'http://backup.brightid.org';
if (__DEV__) {
  seedUrl = 'http://104.207.144.107:5001';
}

class BackupApi {
  api: ApiSauceInstance;

  constructor() {
    this.api = create({
      baseURL: seedUrl,
    });
  }

  static throwOnError(response) {
    if (response.ok) {
      return;
    }
    if (response.data && response.data.errorMessage) {
      throw new Error(response.data.errorMessage);
    }
    throw new Error(response.problem);
  }

  async get(key1: string, key2: string) {
    let requestParams = { key1, key2 };
    const res = await this.api.get(`/get`, requestParams);
    BackupApi.throwOnError(res);
    return res;
  }

  async set(key1: string, key2: string, data: string) {
    let requestParams = { key1, key2, data };
    const res = await this.api.post(`/set`, requestParams);
    BackupApi.throwOnError(res);
  }

}

const backupApi = new BackupApi();

export default backupApi;
