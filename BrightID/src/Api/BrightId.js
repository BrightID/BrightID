// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';
import store from '../store';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://test.brightid.org';
}

class BrightId {
  api: ApiSauceInstance;

  baseUrlInternal: string;

  constructor() {
    // for now set the baseUrl to the seedUrl since there is only one server
    this.baseUrlInternal = seedUrl;
    this.api = create({
      baseURL: this.apiUrl,
    });
  }

  get baseUrl() {
    return this.baseUrlInternal;
  }

  set baseUrl(url) {
    this.baseUrlInternal = url;
    this.api.setBaseURL(this.apiUrl);
  }

  get apiUrl() {
    return `${this.baseUrl}/brightid`;
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

  async createConnection(
    id1: string,
    sig1: string,
    id2: string,
    sig2: string,
    timestamp: number,
  ) {
    let requestParams = {
      id1,
      id2,
      sig1,
      sig2,
      timestamp,
    };
    const res = await this.api.put(`/connections`, requestParams);
    BrightId.throwOnError(res);
  }

  async deleteConnection(id2: string) {
    const { id, secretKey } = store.getState();
    const timestamp = Date.now();
    const message = id + id2 + timestamp;
    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      id1: id,
      id2,
      sig1,
      timestamp,
    };
    const res = await this.api.delete(
      `/connections`,
      {},
      { data: requestParams },
    );
    BrightId.throwOnError(res);
  }

  async getMembers(group: string) {
    const res = await this.api.get(`/membership/${group}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async joinGroup(group: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = id + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      id,
      group,
      sig,
      timestamp,
    };
    console.log('====================', requestParams);
    const res = await this.api.put(`/membership`, requestParams);
    BrightId.throwOnError(res);
  }

  async leaveGroup(group: string) {
    const { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = id + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      id,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.delete(
      `/membership`,
      {},
      { data: requestParams },
    );
    BrightId.throwOnError(res);
  }

  async createUser(id: string, signingKey: string) {
    const res = await this.api.post('/users', { id, signingKey });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getUserInfo() {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = id + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/fetchUserInfo`, { id, sig, timestamp });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getContext(context: string) {
    const res = await this.api.get(`/contexts/${context}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getVerification(context: string, userid: string) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = `${context},${userid},${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post('/fetchVerification', {
      id,
      context,
      userid,
      sig,
      timestamp,
    });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async createGroup(id2: string, id3: string) {
    const { id, secretKey } = store.getState();
    const timestamp = Date.now();
    const message = id + id2 + id3 + timestamp;

    const sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      id1: id,
      id2,
      id3,
      sig1,
      timestamp,
    };
    const res = await this.api.post(`/groups`, requestParams);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async deleteGroup(group: string) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = id + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      id,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.delete(`/groups`, {}, { data: requestParams });
    BrightId.throwOnError(res);
  }

  async ip(): string {
    const res = await this.api.get('/ip');
    BrightId.throwOnError(res);
    return res.data.data.ip;
  }

  async setTrusted(trusted: string[]) {
    let { id, secretKey } = store.getState();
    let timestamp = Date.now();
    let message = id + trusted.join(',') + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      id,
      trusted,
      sig,
      timestamp,
    };
    const res = await this.api.put(`/trusted`, requestParams);
    BrightId.throwOnError(res);
  }

  async setSigningKey(params: {
    id: string,
    signingKey: string,
    timestamp: number,
    id1: string,
    id2: string,
    sig1: string,
    sig2: string,
  }) {
    const res = await this.api.put(`/signingKey`, params);
    BrightId.throwOnError(res);
  }
}

const brightId = new BrightId();

export default brightId;
