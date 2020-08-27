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
import { names } from '../utils/fakeNames';

export const addFakeConnection = () => async (
  dispatch: dispatch,
  getState: getState,
) => {
  // create a fake user
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
    secretKey,
    signedMessage,
    timestamp,
  };

  let encrypted = encryptData(dataObj, channel.aesKey);
  const fakeChannel = { ...channel, myProfileId: await createRandomId() };
  fakeChannel.api.upload({
    channelId: fakeChannel.id,
    data: encrypted,
    dataId: fakeChannel.myProfileId,
  });

  // add fake user as pending connection, including already signed connection message
  // dispatch(
  //   addFakePendingConnection({
  //     id: profileId,
  //     channelId: getState().channels.myChannelId,
  //     state: pendingConnection_states.UNCONFIRMED,
  //     brightId: connectId,
  //     name,
  //     photo,
  //     score,
  //     signedMessage,
  //     timestamp,
  //   }),
  // );
};
