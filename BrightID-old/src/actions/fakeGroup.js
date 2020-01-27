// @flow

import nacl from 'tweetnacl';
import api from '../Api/BrightId';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  objToUint8,
} from '../utils/encoding';

export const fakeJoinGroup = ({
  group,
  id,
  secretKey,
}: {
  group: string,
  id: string,
  secretKey: {},
}) => {
  let timestamp = Date.now();
  let message = id + group + timestamp;
  let sk = objToUint8(secretKey);

  let sig = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), sk));

  let requestParams = {
    id,
    group,
    sig,
    timestamp,
  };
  console.log('====================', requestParams);
  return api.api
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

export const fakeJoinGroups = ({
  id,
  secretKey,
}: {
  id: string,
  secretKey: Uint8Array,
}) => (dispatch: dispatch, getState: getState) => {
  const { eligibleGroups } = getState();

  eligibleGroups.map((group) =>
    fakeJoinGroup({ group: group.id, id, secretKey }),
  );
};
