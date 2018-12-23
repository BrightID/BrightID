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
    publicKey1: Uint8Array,
    sig1: string,
    publicKey2: Uint8Array,
    sig2: string,
    timestamp: number,
  ) {
    let requestParams = {
      publicKey1: uInt8ArrayToB64(publicKey1),
      publicKey2: uInt8ArrayToB64(publicKey2),
      sig1,
      sig2,
      timestamp,
    };
    console.log(requestParams);
    return this.api
      .put(`/connections`, requestParams)
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  deleteConnection(publicKey2: Uint8Array) {
    const { publicKey, secretKey } = store.getState().main;
    const b64key1 = uInt8ArrayToB64(publicKey);
    const b64key2 = uInt8ArrayToB64(publicKey2);
    const timestamp = Date.now();
    const message = b64key1 + b64key2 + timestamp;
    let sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    let requestParams = {
      publicKey1: b64key1,
      publicKey2: b64key2,
      sig1,
      timestamp,
    };
    return this.api
      .delete(`/connections`, {}, { data: requestParams })
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  joinGroup(groupId) {
    const { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = uInt8ArrayToB64(publicKey);
    let message = publicKeyStr + groupId + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey: publicKeyStr,
      group: groupId,
      sig,
      timestamp,
    };
    console.log('====================', requestParams);
    return this.api
      .put(`/membership`, requestParams)
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  leaveGroup(groupId) {
    const { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = uInt8ArrayToB64(publicKey);
    let message = publicKeyStr + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey: publicKeyStr,
      group: groupId,
      sig,
      timestamp,
    };
    return this.api
      .delete(`/membership`, {}, { data: requestParams })
      .then((response) => BrightId.noContentResponse(response))
      .catch((error) => (error.data ? error.data : error));
  }

  createUser(publicKey: Uint8Array) {
    let b64PublicKey = uInt8ArrayToB64(publicKey);
    return this.api
      .post('/users', { publicKey: b64PublicKey })
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  getUserInfo() {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = uInt8ArrayToB64(publicKey);
    let message = publicKeyStr + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    return this.api
      .post(`/fetchUserInfo`, { publicKey: publicKeyStr, sig, timestamp })
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
  }

  createGroup(publicKey2: Uint8Array, publicKey3: Uint8Array) {
    const { publicKey, secretKey } = store.getState().main;
    const timestamp = Date.now();
    const key1 = uInt8ArrayToB64(publicKey);
    const key2 = uInt8ArrayToB64(publicKey2);
    const key3 = uInt8ArrayToB64(publicKey3);
    const message = key1 + key2 + key3 + timestamp;

    const sig1 = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey1: key1,
      publicKey2: key2,
      publicKey3: key3,
      sig1,
      timestamp,
    };
    console.log(requestParams);
    return this.api
      .post(`/groups`, requestParams)
      .then((response) => response.data)
      .catch((error) => (error.data ? error.data : error));
    // return fetch(`${BrightId.baseURL}/groups`, {
    //   method: 'POST', // or 'PUT'
    //   body: JSON.stringify(requestParams),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then((response) => {
    //     const contentType = response.headers.get('content-type');
    //     if (contentType && contentType.indexOf('application/json') !== -1) {
    //       return response.json();
    //     } else {
    //       return response.text();
    //     }
    //   })
    //   .then((res) => {
    //     console.log(res);
    //     return res;
    //   })
    //   .catch((error) => (error.data ? error.data : error));
  }

  deleteGroup(groupId) {
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let publicKeyStr = uInt8ArrayToB64(publicKey);
    let message = publicKeyStr + groupId + timestamp;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    let requestParams = {
      publicKey: publicKeyStr,
      group: groupId,
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
