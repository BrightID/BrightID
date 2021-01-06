// @flow

import _ from 'lodash';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import api from '@/api/brightId';
import { strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { loadRecoveryData } from './channelDownloadThunks';

export const uploadSig = ({ id, aesKey, channelApi }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  let {
    keypair: { secretKey },
    user: { id: signer },
  } = getState();

  const { signingKey, timestamp } = await loadRecoveryData(channelApi, aesKey);

  let op = {
    name: 'Set Signing Key',
    id,
    signingKey,
    timestamp,
    v: 5,
  };
  const message = stringify(op);
  let sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );

  let data = { signer, id, sig };

  await channelApi.upload({
    channelId: hash(aesKey),
    dataId: `sig_${signer}`,
    data,
  });
};

const uploadConnection = async ({ conn, channelApi, aesKey }) => {
  try {
    let { id, name, photo } = conn;

    if (!name) {
      return;
    }

    // retrieve photo
    if (photo?.filename) {
      photo = await retrieveImage(photo.filename);
    }

    let profileTimestamp = Date.now();

    let dataObj = {
      id,
      photo,
      name,
      profileTimestamp,
    };

    let encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting profile data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `connection_${id}`,
    });
  } catch (err) {
    console.error(`uploadConnection: ${err.message}`);
  }
};

const uploadGroup = async ({ group, channelApi, aesKey }) => {
  try {
    let { id, name, photo, aesKey: groupKey } = group;
    if (!groupKey) {
      // not worth uploading group data is missing
      return;
    }
    // retrieve photo
    if (photo?.filename) {
      photo = await retrieveImage(photo.filename);
    }
    let profileTimestamp = Date.now();

    let dataObj = {
      id,
      photo,
      name,
      profileTimestamp,
      aesKey: groupKey,
    };

    let encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting group data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `group_${id}`,
    });
  } catch (err) {
    console.error(`uploadGroup: ${err.message}`);
  }
};

export const uploadMutualInfo = ({ conn, aesKey, channelApi }) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    const dataIds = await channelApi.list(hash(aesKey));
    if (!dataIds.includes(`connection_${conn.id}`)) {
      console.log(`uploading recovery data for connection`);
      await uploadConnection({ conn, channelApi, aesKey });
    }
    let {
      connections: { connections },
      groups: { groups },
      user,
    } = getState();
    connections = _.keyBy(connections, 'id');
    groups = _.keyBy(groups, 'id');

    let otherSideConnections = await api.getConnections(conn.id, 'inbound');
    const knownLevels = ['just met', 'already known', 'recovery'];
    let mutualConnections = otherSideConnections
      .filter(
        (c) =>
          connections[c.id] &&
          connections[c.id].name &&
          knownLevels.includes(c.level) &&
          !dataIds.includes(`connection_${c.id}`),
      )
      .map((c) => connections[c.id]);

    if (!dataIds.includes(`connection_${user.id}`)) {
      mutualConnections.push(user);
    }

    let otherSideGroups = (await api.getUserInfo(conn.id))?.groups;
    let mutualGroups = otherSideGroups
      .filter((g) => groups[g.id])
      .map((g) => groups[g.id]);

    console.log('uploading mutual connections');
    for (let c of mutualConnections) {
      await uploadConnection({ conn: c, channelApi, aesKey });
    }
    console.log('uploading mutual groups');
    for (let g of mutualGroups) {
      await uploadGroup({ group: g, channelApi, aesKey });
    }
  } catch (err) {
    console.error(`uploadMutualInfo: ${err.message}`);
  }
};
