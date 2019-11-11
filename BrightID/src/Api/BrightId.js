// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';
import store from '../store';

let seedUrl = 'http://node.brightid.org';
if (__DEV__) {
  seedUrl = 'http://104.207.144.107';
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
    publicKey1: string,
    sig1: string,
    publicKey2: string,
    sig2: string,
    timestamp: number,
  ) {
    let requestParams = {
      publicKey1,
      publicKey2,
      sig1,
      sig2,
      timestamp,
    };
    const res = await this.api.put(`/connections`, requestParams);
    BrightId.throwOnError(res);
  }

  async deleteConnection(publicKey2: string) {
    const { publicKey, secretKey } = store.getState().main;
    const timestamp = Date.now();
    const message = publicKey + publicKey2 + timestamp;
    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      publicKey1: publicKey,
      publicKey2,
      sig1,
      timestamp,
    };
    const res = await this.api.delete(`/connections`, {}, { data: requestParams });
    BrightId.throwOnError(res);
  }

  async getMembers(group: string) {
    const res = await this.api.get(`/membership/${group}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async joinGroup(group: string) {
    const { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey,
      group,
      sig,
      timestamp,
    };
    console.log('====================', requestParams);
    const res = await this.api.put(`/membership`, requestParams);
    BrightId.throwOnError(res);
  }

  async leaveGroup(group: string) {
    const { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey,
      group,
      sig,
      timestamp,
    };
    const res = await this.api.delete(`/membership`, {}, { data: requestParams });
    BrightId.throwOnError(res);
  }

  async createUser(publicKey: string) {
    const res = await this.api.post('/users', { publicKey });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getUserInfo(publicKey: string, secretKey: string) {
    let timestamp = Date.now();
    let message = publicKey + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post(`/fetchUserInfo`, { publicKey, sig, timestamp });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getContext(context: string) {
    const res = await this.api.get(`/contexts/${context}`);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async getVerification(context: string, id: string) {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = `${context},${id},${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    const res = await this.api.post('/fetchVerification', { publicKey, context, id, sig, timestamp });
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async createGroup(publicKey2: string, publicKey3: string) {
    const { publicKey, secretKey } = store.getState().main;
    const timestamp = Date.now();
    const message = publicKey + publicKey2 + publicKey3 + timestamp;

    const sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey1: publicKey,
      publicKey2,
      publicKey3,
      sig1,
      timestamp,
    };
    const res = await this.api.post(`/groups`, requestParams);
    BrightId.throwOnError(res);
    return res.data.data;
  }

  async deleteGroup(group: string) {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + group + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey,
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

  async trustedConnections(connections: string) {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + connections + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      publicKey,
      connections,
      sig,
      timestamp,
    };
    const res = await this.api.post(`/trustedConnections`, requestParams);
    BrightId.throwOnError(res);
  }

  async recover(oldPublicKey: string, newPublicKey: string) {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + oldPublicKey + newPublicKey + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      publicKey,
      oldPublicKey,
      newPublicKey,
      sig,
      timestamp,
    };
    const res = await this.api.post(`/recover`, requestParams);
    BrightId.throwOnError(res);
  }
}

const brightId = new BrightId();

export default brightId;
