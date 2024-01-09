import nacl from 'tweetnacl';
import RNFetchBlob from 'rn-fetch-blob';
import { Alert } from 'react-native';
import { createSelector } from '@reduxjs/toolkit';
import {
  b64ToUrlSafeB64,
  uInt8ArrayToB64,
  urlSafeRandomKey,
} from '@/utils/encoding';
import { encryptData } from '@/utils/cryptoHelper';
import { selectChannelById } from '@/components/PendingConnections/channelSlice';
import {
  selectAllConnections,
  selectConnectionById,
} from '@/reducer/connectionsSlice';
import { names } from '@/utils/fakeNames';
import { connectFakeUsers } from '@/utils/fakeHelper';
import { retrieveImage } from '@/utils/filesystem';
import { PROFILE_VERSION } from '@/utils/constants';
import { addOperation } from '@/reducer/operationsSlice';
import { NodeApi } from '@/api/brightId';
import { getConnectionLevelString } from '@/utils/connectionLevelStrings';

/** SELECTORS */

export const selectOtherFakeConnections = createSelector(
  selectAllConnections,
  (_: RootState, id: string) => id,
  (connections, id) => connections.filter((c) => c.secretKey && c.id !== id),
);

export const addFakeConnection =
  (): AppThunk => async (dispatch: AppDispatch, getState) => {
    try {
      // create a fake user
      console.log('creating fake user');
      const { publicKey, secretKey } = await nacl.sign.keyPair();
      const b64PubKey = uInt8ArrayToB64(publicKey);
      const connectId = b64ToUrlSafeB64(b64PubKey);
      const { firstName, lastName } =
        names[Math.floor(Math.random() * (names.length - 1))];
      const name = `${firstName} ${lastName}`;

      // load random photo
      let photo;
      const photoResponse = await RNFetchBlob.fetch(
        'GET',
        'https://loremflickr.com/180/180',
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
        getState().channels.myChannelIds[
          getState().channels.displayChannelType
        ],
      );

      const dataObj: SharedProfile = {
        id: connectId,
        photo,
        name,
        profileTimestamp: Date.now(),
        secretKey: uInt8ArrayToB64(secretKey),
        notificationToken: null,
        version: PROFILE_VERSION,
      };

      const encrypted = encryptData(dataObj, channel.aesKey);
      const fakeChannel = {
        ...channel,
        myProfileId: await urlSafeRandomKey(9),
      };

      await fakeChannel.api.upload({
        channelId: fakeChannel.id,
        data: encrypted,
        dataId: fakeChannel.myProfileId,
      });
    } catch (err) {
      err instanceof Error ? console.log(err.message) : console.log(err);
    }
  };

export const connectWithOtherFakeConnections =
  (id: string, api: NodeApi, level: ConnectionLevel) =>
  async (dispatch: AppDispatch, getState) => {
    // get fakeUser by ID
    const fakeUser1 = selectConnectionById(getState(), id);

    if (!fakeUser1) {
      console.log(`Failed to get fake connection id ${id}`);
      return;
    }
    if (!fakeUser1.secretKey) {
      console.log(`Fake connection ${id} does not have a secretKey!`);
      return;
    }

    // get all other fakeUser that we should connect to
    const otherFakeUsers = selectOtherFakeConnections(getState(), id);

    console.log(
      `Connecting ${id} with ${
        otherFakeUsers.length
      } fake connections as ${getConnectionLevelString(level)}`,
    );
    for (const otherUser of otherFakeUsers) {
      const ops = await connectFakeUsers(
        { id: fakeUser1.id, secretKey: fakeUser1.secretKey },
        { id: otherUser.id, secretKey: otherUser.secretKey },
        api,
        level,
      );
      for (const op of ops) {
        dispatch(addOperation(op));
      }
    }
  };

export const joinAllGroups =
  (id: string, api: NodeApi): AppThunk =>
  async (dispatch: AppDispatch, getState) => {
    // get fakeUser by ID
    const fakeUser = selectConnectionById(getState(), id);

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
    for (const group of groups) {
      const op = await api.joinGroup(group.id, {
        id,
        secretKey: fakeUser.secretKey,
      });
      dispatch(addOperation(op));
    }
  };

export const reconnectFakeConnection =
  (id: string, changeProfile: boolean) =>
  async (dispatch: AppDispatch, getState) => {
    // get fakeUser by ID
    const fakeUser1 = selectConnectionById(getState(), id);

    if (!fakeUser1) {
      console.log(`Failed to get fake connection id ${id}`);
      return;
    }
    if (!fakeUser1.secretKey) {
      console.log(`Fake connection ${id} does not have a secretKey!`);
      return;
    }
    const channel = selectChannelById(
      getState(),
      getState().channels.myChannelIds[getState().channels.displayChannelType],
    );
    if (!channel) {
      Alert.alert(
        'Error',
        'No open channel. Go to MyCodeScreen before attempting fake reconnect to have an open channel.',
      );
      return;
    }

    let photo, name;
    if (changeProfile) {
      // load a new random photo
      const photoResponse = await RNFetchBlob.fetch(
        'GET',
        'https://loremflickr.com/180/180',
        {},
      );
      if (photoResponse.info().status === 200) {
        photo = `data:image/jpeg;base64,${String(photoResponse.base64())}`;
      } else {
        Alert.alert('Error', 'Unable to fetch image');
        return;
      }
      // create new name
      const { firstName, lastName } =
        names[Math.floor(Math.random() * (names.length - 1))];
      name = `${firstName} ${lastName}`;
    } else {
      // use existing photo and name
      name = fakeUser1.name;
      // retrieve photo
      photo = await retrieveImage(fakeUser1?.photo?.filename);
    }

    const dataObj = {
      id,
      photo,
      name,
      profileTimestamp: Date.now(),
      secretKey: fakeUser1.secretKey,
      notificationToken: null,
      version: PROFILE_VERSION,
    };

    const encrypted = encryptData(dataObj, channel.aesKey);
    const fakeChannel = { ...channel, myProfileId: await urlSafeRandomKey(9) };

    await fakeChannel.api.upload({
      channelId: fakeChannel.id,
      data: encrypted,
      dataId: fakeChannel.myProfileId,
    });
  };
