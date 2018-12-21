// @flow

import { create } from 'apisauce';
import nacl from 'tweetnacl';
import { obj2b64, strToUint8Array, uInt8Array2b64 } from '../utils/encoding';
import store from '../store';
import server from './server';
import emitter from '../emitter';

const api = create({
  baseURL: server.apiUrl,
});

emitter.on('serverUrlChange', () => {
  api.setBaseURL(server.apiUrl);
});

function urlSafe(str: string) {
  return str
    .replace(/\=/g, '')
    .replace(/\//g, '_')
    .replace(/\+/g, '-');
}

function noContentResponse(response) {
  return {
    success: response.status === 204,
    ok: response.ok,
    status: response.status,
    data: response.data,
  };
}

function createConnection(
  publicKey1: Uint8Array,
  sig1: string,
  publicKey2: Uint8Array,
  sig2: string,
  timestamp: number,
) {
  let requestParams = {
    publicKey1: uInt8Array2b64(publicKey1),
    publicKey2: uInt8Array2b64(publicKey2),
    sig1,
    sig2,
    timestamp,
  };
  return api
    .put(`/connections`, requestParams)
    .then((response) => noContentResponse(response))
    .catch((error) => (error.data ? error.data : error));
}

function deleteConnection(publicKey2: Uint8Array) {
  const { publicKey, secretKey } = store.getState().main;
  const b64key1 = uInt8Array2b64(publicKey);
  const b64key2 = uInt8Array2b64(publicKey2);
  const timestamp = Date.now();
  const message = b64key1 + b64key2 + timestamp;
  let sig1 = uInt8Array2b64(nacl.sign.detached(strToUint8Array(message), secretKey));
  let requestParams = {
    publicKey1: b64key1,
    publicKey2: b64key2,
    sig1,
    timestamp,
  };
  return api
    .delete(`/connections`, {}, { data: requestParams })
    .then((response) => noContentResponse(response))
    .catch((error) => (error.data ? error.data : error));
}

function joinAGroup(groupId) {
  let { publicKey, secretKey } = store.getState().main;
  let timestamp = Date.now();
  let publicKeyStr = urlSafe(obj2b64(publicKey));
  let message = publicKeyStr + groupId + timestamp;
  let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

  let requestParams = {
    publicKey: publicKeyStr,
    group: groupId,
    sig,
    timestamp,
  };
  console.log('====================', requestParams);
  return api
    .put(`/membership`, requestParams)
    .then((response) => noContentResponse(response))
    .catch((error) => (error.data ? error.data : error));
}

function leaveAGroup(groupId) {
  let { publicKey, secretKey } = store.getState().main;
  let timestamp = Date.now();
  let publicKeyStr = urlSafe(obj2b64(publicKey));
  let message = publicKeyStr + timestamp;
  let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

  let requestParams = {
    publicKey: publicKeyStr,
    group: groupId,
    sig,
    timestamp,
  };
  return api
    .delete(`/membership`, {}, { data: requestParams })
    .then((response) => noContentResponse(response))
    .catch((error) => (error.data ? error.data : error));
}

function createUser(publicKey: Uint8Array) {
  let b64PublicKey = obj2b64(publicKey);
  return api
    .post('/users', { publicKey: b64PublicKey })
    .then((response) => response.data)
    .catch((error) => (error.data ? error.data : error));
}

function getUserInfo() {
  let { publicKey, secretKey } = store.getState().main;
  let timestamp = Date.now();
  let publicKeyStr = urlSafe(obj2b64(publicKey));
  let message = publicKeyStr + timestamp;
  let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));
  return api
    .post(`/fetchUserInfo`, { publicKey: publicKeyStr, sig, timestamp })
    .then((response) => response.data)
    .catch((error) => (error.data ? error.data : error));
}

function createGroup(
  publicKey1: Uint8Array,
  publicKey2: Uint8Array,
  publicKey3: Uint8Array,
) {
  let { secretKey } = store.getState().main;
  let timestamp = Date.now();
  let message =
    urlSafe(obj2b64(publicKey1)) +
    urlSafe(obj2b64(publicKey2)) +
    urlSafe(obj2b64(publicKey3)) +
    timestamp;
  let sig1 = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

  let requestParams = {
    publicKey1: urlSafe(obj2b64(publicKey1)),
    publicKey2: urlSafe(obj2b64(publicKey2)),
    publicKey3: urlSafe(obj2b64(publicKey3)),
    sig1,
    timestamp,
  };
  console.log(requestParams);
  // return api
  //   .post(`/groups`, requestParams)
  //   .then((response) => response.data)
  //   .catch((error) => (error.data ? error.data : error));
  return fetch(`${server.apiUrl}/groups`, {
    method: 'POST', // or 'PUT'
    body: JSON.stringify(requestParams),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json();
      } else {
        return response.text();
      }
    })
    .then((res) => {
      console.log(res);
      return res;
    })
    .catch((error) => (error.data ? error.data : error));
}

function deleteGroup(groupId) {
  let { publicKey, secretKey } = store.getState().main;
  let timestamp = Date.now();
  let publicKeyStr = urlSafe(obj2b64(publicKey));
  let message = publicKeyStr + groupId + timestamp;
  let sig = obj2b64(nacl.sign.detached(strToUint8Array(message), secretKey));

  let requestParams = {
    publicKey: publicKeyStr,
    group: groupId,
    sig,
    timestamp,
  };
  return api
    .delete(`/groups`, {}, { data: requestParams })
    .then((response) => noContentResponse(response))
    .catch((error) => (error.data ? error.data : error));
}

function ip(): string {
  return api.get('/ip').then((response) => response.data.data.ip);
}

export default {
  urlSafe,
  createConnection,
  deleteConnection,
  joinAGroup,
  leaveAGroup,
  createGroup,
  deleteGroup,
  getUserInfo,
  createUser,
  ip,
  baseUrl: server.apiUrl,
};
