// @flow

import { create, ApiSauceInstance } from 'apisauce';
import nacl from 'tweetnacl';
import { strToUint8Array, uInt8ArrayToB64 } from '../utils/encoding';
import store from '../store';
import server from './server';
import emitter from '../emitter';

class BrightId {
  api: ApiSauceInstance;

  baseUrl: string;

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

  static error = error => error.data ? error.data.errorMessage : error.problem;

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
      .catch(BrightId.error);
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
      .catch(BrightId.error)
  }

  getMembers(group: string) {
    return this.api
      .get(`/membership/${group}`)
      .then(response => response.data.data)
      .catch(BrightId.error);
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
      .catch(BrightId.error);
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
      .catch(BrightId.error);
  }

  createUser(publicKey: string) {
    return this.api
      .post('/users', { publicKey })
      .then(response => response.data)
      .catch(BrightId.error);
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
      .then(response => response.data)
      .catch(BrightId.error);
  }

  getUserScore(publicKey: string) {
    return this.api
      .get(`/userScore/${publicKey}`)
      .then(response => response.data)
      .catch(BrightId.error);
  }

  getContext(context: string) {
    return this.api
      .get(`/contexts/${context}`)
      .then(response => response.data)
      .catch(BrightId.error)
  }

  getVerification(context: string, id: string){
    let { publicKey, secretKey } = store.getState().main;
    let timestamp = Date.now();
    let message = `${context},${id},${timestamp}`;
    let sig = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );
    return this.api
      .post('/fetchVerification', { publicKey, context, id, sig, timestamp} )
      .then(response => response.data)
      .catch(BrightId.error);
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
      .then(response => response.data)
      .catch(BrightId.error);
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
      .catch(BrightId.error);
  }

  ip(): string {
    return this.api
      .get('/ip')
      .then(response => response.data.data.ip)
      .catch(BrightId.error);
  }
}

const brightId = new BrightId();

export default brightId;
