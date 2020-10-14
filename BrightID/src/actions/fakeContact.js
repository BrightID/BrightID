// @flow

import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  b64ToUrlSafeB64,
} from '@/utils/encoding';
import { encryptData } from '@/utils/cryptoHelper';
import { createRandomId } from '@/utils/channels';
import { selectChannelById } from '@/components/PendingConnectionsScreens/channelSlice';
import { names } from '@/utils/fakeNames';
import { connectFakeUsers } from '@/utils/fakeHelper';
import api from '@/api/brightId';

export const addFakeConnection = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  try {
    // create a fake user
    console.log('creating fake user');
    const { publicKey, secretKey } = await nacl.sign.keyPair();
    const {
      user: { id },
    } = getState();
    const b64PubKey = uInt8ArrayToB64(publicKey);
    const connectId = b64ToUrlSafeB64(b64PubKey);
    const { firstName, lastName } = names[
      Math.floor(Math.random() * (names.length - 1))
    ];
    const name = `${firstName} ${lastName}`;
    const score = Math.floor(Math.random() * 99);
    const timestamp = Date.now();
    const message = `Add Connection${connectId}${id}${timestamp}`;
    const signedMessage = uInt8ArrayToB64(
      nacl.sign.detached(strToUint8Array(message), secretKey),
    );

    // load random photo
    let photo;
    const photoResponse = await RNFetchBlob.fetch(
      'GET',
      'https://picsum.photos/180',
      {},
    );
    if (photoResponse.info().status === 200) {
      photo = `data:image/jpeg;base64,${String(photoResponse.base64())}`;
    } else {
      Alert.alert('Error', 'Unable to fetch image');
      return;
    }

    const channel = selectChannelById(
      getState(),
      getState().channels.myChannelIds[getState().channels.displayChannelType],
    );

    const dataObj = {
      id: connectId,
      photo,
      name,
      score,
      profileTimestamp: Date.now(),
      secretKey: uInt8ArrayToB64(secretKey),
      signedMessage,
      timestamp,
      notificationToken: null,
    };

    let encrypted = encryptData(dataObj, channel.aesKey);
    const fakeChannel = { ...channel, myProfileId: await createRandomId() };

    await fakeChannel.api.upload({
      channelId: fakeChannel.id,
      data: encrypted,
      dataId: fakeChannel.myProfileId,
    });
  } catch (err) {
    console.log(err.message);
  }
};

export const connectWithOtherFakeConnections = (id: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // get fakeUser by ID
  const fakeUser1 = getState().connections.connections.find(
    (entry) => entry.id === id,
  );
  if (!fakeUser1) {
    console.log(`Failed to get fake connection id ${id}`);
    return;
  }
  if (!fakeUser1.secretKey) {
    console.log(`Fake connection ${id} does not have a secretKey!`);
    return;
  }

  // get all other fakeUser that we should connect to
  const otherFakeUser = getState().connections.connections.filter(
    (entry) => entry.secretKey && entry.id !== id,
  );
  console.log(`Connecting ${id} with ${otherFakeUser.length} fake connections`);
  for (const otherUser of otherFakeUser) {
    await connectFakeUsers(
      { id: fakeUser1.id, secretKey: fakeUser1.secretKey },
      { id: otherUser.id, secretKey: otherUser.secretKey },
    );
  }
};

export const joinAllGroups = (id: string) => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // get fakeUser by ID
  const fakeUser = getState().connections.connections.find(
    (entry) => entry.id === id,
  );
  if (!fakeUser) {
    console.log(`Failed to get fake connection id ${id}`);
    return;
  }
  if (!fakeUser.secretKey) {
    console.log(`Fake connection ${id} does not have a secretKey!`);
    return;
  }

  // join all groups
  const { groups } = getState().groups;
  groups.map((group) =>
    api.joinGroup(group.id, { id, secretKey: fakeUser.secretKey }),
  );
};
