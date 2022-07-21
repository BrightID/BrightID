import _ from 'lodash';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import {
  b64ToUrlSafeB64,
  strToUint8Array,
  uInt8ArrayToB64,
  hash,
} from '@/utils/encoding';
import { selectAllConnections } from '@/reducer/connectionsSlice';
import ChannelAPI from '@/api/channelService';
import { NodeApi } from '@/api/brightId';
import { store } from '@/store';
import { loadRecoveryData } from '@/utils/recovery';
import { uploadConnection, uploadGroup } from '@/utils/channels';

export const uploadSig =
  ({
    id,
    aesKey,
    channelApi,
  }: {
    id: string;
    aesKey: string;
    channelApi: ChannelAPI;
  }) =>
  async (_, getState) => {
    const {
      keypair: { secretKey },
      user: { id: signer },
    } = getState();

    const { signingKey, timestamp } = await loadRecoveryData(
      channelApi,
      aesKey,
    );

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

export const uploadMutualInfo = async ({
  conn,
  aesKey,
  channelApi,
  nodeApi,
}: {
  conn: Connection;
  aesKey: string;
  channelApi: ChannelAPI;
  nodeApi: NodeApi;
}) => {
  const {
    keypair: { publicKey: signingKey },
    groups: { groups },
    user,
  } = store.getState();
  const { entries: dataIds, newTTL } = await channelApi.list(hash(aesKey));
  if (
    !dataIds.includes(`connection_${conn.id}:${b64ToUrlSafeB64(signingKey)}`)
  ) {
    console.log(`uploading recovery data for connection`);
    await uploadConnection({
      conn,
      channelApi,
      aesKey,
      signingKey,
    });
  }
  const connections = selectAllConnections(store.getState());

  const connectionsById = _.keyBy(connections, 'id');
  const groupsById = _.keyBy(groups, 'id');

  const otherSideConnections = await nodeApi.getConnections(conn.id, 'inbound');
  const knownLevels = ['just met', 'already known', 'recovery'];
  const mutualConnections = otherSideConnections
    ? otherSideConnections
        .filter(
          (c) =>
            connectionsById[c.id] &&
            connectionsById[c.id].name &&
            knownLevels.includes(c.level) &&
            !dataIds.includes(
              `connection_${c.id}:${b64ToUrlSafeB64(signingKey)}`,
            ),
        )
        .map((c) => connectionsById[c.id])
    : [];

  if (
    !dataIds.includes(`connection_${user.id}:${b64ToUrlSafeB64(signingKey)}`)
  ) {
    mutualConnections.push(user);
  }

  const otherSideGroups = await nodeApi.getMemberships(conn.id);
  const mutualGroups = otherSideGroups
    ? otherSideGroups
        .filter((g) => groupsById[g.id])
        .map((g) => groupsById[g.id])
    : [];

  console.log('uploading mutual connections');
  for (const c of mutualConnections) {
    await uploadConnection({
      conn: c,
      channelApi,
      aesKey,
      signingKey,
    });
  }
  console.log('uploading mutual groups');
  for (const g of mutualGroups) {
    await uploadGroup({ group: g, channelApi, aesKey, signingKey });
  }
};
