import _ from 'lodash';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import { retrieveImage } from '@/utils/filesystem';
import { encryptData } from '@/utils/cryptoHelper';
import { b64ToUrlSafeB64, strToUint8Array, uInt8ArrayToB64, hash } from '@/utils/encoding';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import { loadRecoveryData } from './channelDownloadThunks';
import { store } from '@/store';

export const uploadSig = ({ id, aesKey, channelApi }) => async (
  _,
  getState,
) => {
  const {
    keypair: { secretKey },
    user: { id: signer },
  } = getState();

  const { signingKey, timestamp } = await loadRecoveryData(channelApi, aesKey);

  const op = {
    name: 'Social Recovery',
    id,
    signingKey,
    timestamp,
    v: 6,
  };
  const message = stringify(op);
  const sig = uInt8ArrayToB64(
    nacl.sign.detached(strToUint8Array(message), secretKey),
  );

  const data = { signer, id, sig };

  await channelApi.upload({
    channelId: hash(aesKey),
    dataId: `sig_${signer}`,
    data,
  });
};

export const uploadConnection = async ({ conn, channelApi, aesKey }) => {
  const { keypair: { publicKey: signingKey } } = store.getState();
  try {
    let { id, name, photo, timestamp, testPhoto = '' } = conn;

    if (!name) {
      return;
    }

    // retrieve photo
    if (photo?.filename) {
      photo = await retrieveImage(photo.filename);
    } else {
      photo = testPhoto;
    }

    const dataObj = {
      id,
      photo,
      name,
      timestamp,
    };

    const encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting profile data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `connection_${id}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadConnection: ${err.message}`);
  }
};

export const uploadGroup = async ({ group, channelApi, aesKey }) => {
  const { keypair: { publicKey: signingKey } } = store.getState();
  try {
    let { id, name, photo, aesKey: groupKey } = group;
    if (!groupKey) {
      // not worth uploading group data is missing
      return;
    }
    // retrieve photo
    if (photo?.filename) {
      photo = await retrieveImage(photo.filename);
    } else {
      photo = '';
    }

    const dataObj = {
      id,
      photo,
      name,
      aesKey: groupKey,
    };

    const encrypted = encryptData(dataObj, aesKey);
    console.log(`Posting group data of ${id} ...`);
    await channelApi.upload({
      channelId: hash(aesKey),
      data: encrypted,
      dataId: `group_${id}:${b64ToUrlSafeB64(signingKey)}`,
    });
  } catch (err) {
    console.error(`uploadGroup: ${err.message}`);
  }
};

export const uploadMutualInfo = async ({
  conn,
  aesKey,
  channelApi,
  nodeApi,
}) => {
  const dataIds = await channelApi.list(hash(aesKey));
  if (!dataIds.includes(`connection_${conn.id}`)) {
    console.log(`uploading recovery data for connection`);
    await uploadConnection({ conn, channelApi, aesKey });
  }
  let {
    groups: { groups },
    user,
  } = store.getState();
  let connections = selectAllConnections(store.getState());
  connections = _.keyBy(connections, 'id');
  groups = _.keyBy(groups, 'id');
  const otherSideConnections = await nodeApi.getConnections(
    conn.id,
    'inbound',
  );
  const knownLevels = ['just met', 'already known', 'recovery'];
  const mutualConnections = otherSideConnections
    ? otherSideConnections
        .filter(
          (c) =>
            connections[c.id] &&
            connections[c.id].name &&
            knownLevels.includes(c.level) &&
            !dataIds.includes(`connection_${c.id}`),
        )
        .map((c) => connections[c.id])
    : [];

  if (!dataIds.includes(`connection_${user.id}`)) {
    mutualConnections.push(user);
  }
  const otherSideGroups = await nodeApi.getMemberships(conn.id);
  const mutualGroups = otherSideGroups
    ? otherSideGroups.filter((g) => groups[g.id]).map((g) => groups[g.id])
    : [];
  console.log('uploading mutual connections');
  for (const c of mutualConnections) {
    await uploadConnection({ conn: c, channelApi, aesKey });
  }
  console.log('uploading mutual groups');
  for (const g of mutualGroups) {
    await uploadGroup({ group: g, channelApi, aesKey });
  }
};
