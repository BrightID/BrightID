// @flow

import nacl from 'tweetnacl';
import api from '../api/brightId';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  hash,
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
  let sk = objToUint8(secretKey);
  let message = `Add Membership${id}${group}${timestamp}`;
  let sig = uInt8ArrayToB64(nacl.sign.detached(strToUint8Array(message), sk));

  const op = {
    _key: hash(message),
    name: 'Add Membership',
    id,
    group,
    sig,
    timestamp,
    v: 4,
  };
  console.log('joining', op);
  return api.api
    .put(`/operations/${op._key}`, op)
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
  const {
    groups: { groups },
  } = getState();

  groups.map((group) => fakeJoinGroup({ group: group.id, id, secretKey }));
};
