// @flow

import { create } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';
import store from '../store';
import server from './server';
import emitter from '../emitter';

class BrightId {
  constructor() {
    this.api = create({
      baseURL: BrightId.baseURL,
    });

    emitter.on('serverUrlChange', () => {
      this.api.setBaseURL(BrightId.baseURL);
    });
  }

  static get baseURL() {
    return server.apiUrl;
  }

  static noContentResponse(response) {
    return {
      success: response.status === 204,
      ok: response.ok,
      status: response.status,
      data: response.data,
    };
  }

  createConnection(
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
    return this.api
      .put(`/connections`, requestParams)
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  deleteConnection(publicKey2: string) {
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
    return this.api
      .delete(`/connections`, {}, { data: requestParams })
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  getMembers(group: string) {
    return this.api
      .get(`/membership/${group}`)
      .then((response) => response.data.data)
      .catch((error) => (error.data ? error.data : error));
  }

  joinGroup(group: string) {
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
    return this.api
      .put(`/membership`, requestParams)
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  leaveGroup(group: string) {
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
    return this.api
      .delete(`/membership`, {}, { data: requestParams })
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  createUser(publicKey: string) {
    return this.api
      .post('/users', { publicKey })
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  getUserInfo() {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = publicKey + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    return this.api
      .post(`/fetchUserInfo`, { publicKey, sig, timestamp })
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  getUserScore(publicKey: string) {
    return this.api
      .get(`/userScore/${publicKey}`)
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  createGroup(publicKey2: string, publicKey3: string) {
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
    return this.api
      .post(`/groups`, requestParams)
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  deleteGroup(group: string) {
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
    return this.api
      .delete(`/groups`, {}, { data: requestParams })
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  ip(): string {
    return this.api.get('/ip').then((response) => response.data.data.ip);
  }
}

const brightId = new BrightId();

export default brightId;
