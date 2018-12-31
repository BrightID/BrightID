// @flow

import nacl from 'tweetnacl';
import { create } from 'apisauce';
import server from '../Api/server';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  objToUint8,
} from '../utils/encoding';

const api = create({
  baseURL: server.apiUrl,
});

export const fakeJoinGroup = ({ groupId, publicKey, secretKey }) => {
  let timestamp = Date.now();
  let message = publicKey + groupId + timestamp;
  console.log(secretKey);
  let sk = objToUint8(secretKey);
  let sig = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), sk));

  let requestParams = {
    publicKey,
    group: groupId,
    sig,
    timestamp,
  };
  console.log('====================', requestParams);
  return api
    .put(`/membership`, requestParams)
    .then((response) => ({
      success: response.status === 204,
      ok: response.ok,
      status: response.status,
      data: response.data,
    }))
    .then((data) => {
      console.log(data);
    })
    .catch((error) => (error.data ? error.data : error));
};

export const fakeJoinGroups = ({ publicKey, secretKey }) => (
  dispatch,
  getState,
) => {
  const { eligibleGroups } = getState().main;
  eligibleGroups.map(function({ id }) {
    fakeJoinGroup({ groupId: id, publicKey, secretKey });
  });
  //   fakeJoinGroup({ groupId: eligibleGroups[0].id, publicKey, secretKey });
};
