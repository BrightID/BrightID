// @flow

import { Alert } from 'react-native';
import CryptoJS from 'crypto-js';
import _ from 'lodash';
import nacl from 'tweetnacl';
import stringify from 'fast-json-stable-stringify';
import i18next from 'i18next';
import {
  createImageDirectory,
  retrieveImage,
  saveImage,
} from '@/utils/filesystem';
import { encryptData, decryptData } from '@/utils/cryptoHelper';
import backupApi from '@/api/backupService';
import api from '@/api/brightId';
import store from '@/store';
import emitter from '@/emitter';
import {
  setRecoveryData,
  removeRecoveryData,
  setBackupCompleted,
  setUserData,
  setConnections,
  setPassword,
  setHashedId,
  setGroups,
  setKeypair,
  addConnection,
  createGroup,
  updateConnections,
} from '@/actions';
import {
  strToUint8Array,
  uInt8ArrayToB64,
  hash,
  randomKey,
} from '@/utils/encoding';

export const setTrustedConnections = async () => {
  const {
    connections: { trustedConnections },
  } = store.getState();
  await api.setTrusted(trustedConnections);
  return true;
};

const hashId = (id: string, password: string) => {
  const h = hash(id + password);
  store.dispatch(setHashedId(h));
  return h;
};

export const encryptAndBackup = async (key: string, data: string) => {
  let {
    user: { id, hashedId, password },
  } = store.getState();
  if (!hashedId) hashedId = hashId(id, password);
  try {
    // const cipher = createCipher('aes128', password);
    // const encrypted =
    //   cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
    const encrypted = CryptoJS.AES.encrypt(data, password).toString();
    await backupApi.putRecovery(hashedId, key, encrypted);
    emitter.emit('backupProgress', 1);
  } catch (err) {
    emitter.emit('backupProgress', 0);
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupPhoto = async (id: string, filename: string) => {
  try {
    const data = await retrieveImage(filename);
    await encryptAndBackup(id, data);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

const backupPhotos = async () => {
  try {
    const {
      connections: { connections },
      groups: { groups },
      user: { id, photo },
    } = store.getState();
    for (const item of connections) {
      if (item.photo?.filename) {
        await backupPhoto(item.id, item.photo.filename);
      }
    }
    for (const item of groups) {
      if (item.photo?.filename) {
        await backupPhoto(item.id, item.photo.filename);
      }
    }
    await backupPhoto(id, photo.filename);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupUser = async () => {
  try {
    const {
      user: { id, score, name, photo },
      connections: { connections },
      groups: { groups },
    } = store.getState();
    const userData = {
      id,
      name,
      score,
      photo,
    };
    const dataStr = JSON.stringify({
      userData,
      connections,
      groups,
    });
    await encryptAndBackup('data', dataStr);
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const backupAppData = async () => {
  try {
    // backup user
    await backupUser();
    // backup connection photos
    await backupPhotos();
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.warn(err);
  }
};

export const checkChannel = async (channelApi) => {
  let {
    recoveryData,
    connections: { connections },
    groups: { groups },
  } = store.getState();
  let { aesKey, sigs } = recoveryData;
  const channelId = hash(aesKey);
  let dataIds = await channelApi.list(channelId);

  // process signatures uploaded to the channel
  const sigDataIds = dataIds.filter(
    (dataId) => dataId.startsWith('sig_') && !sigs[dataId.replace('sig_', '')],
  );
  for (let dataId of sigDataIds) {
    let signer = dataId.replace('sig_', '');
    sigs[signer] = await channelApi.download({ channelId, dataId });
    recoveryData.id = sigs[signer].id;
    await store.dispatch(setRecoveryData(recoveryData));
    Alert.alert(
      i18next.t('common.alert.info'),
      i18next.t('common.alert.text.trustedSigned'),
    );
  }

  // process connections uploaded to the channel
  connections = _.keyBy(connections, 'id');
  const connectionDataIds = dataIds.filter(
    (dataId) =>
      dataId.startsWith('connection_') &&
      !connections[dataId.replace('connection_', '')] &&
      (dataId.replace('connection_', '') != recoveryData.id ||
        !recoveryData.name),
  );
  for (let dataId of connectionDataIds) {
    let connectionData = await downloadConnection(dataId, channelApi, aesKey);
    if (connectionData.id !== recoveryData.id) {
      await store.dispatch(addConnection(connectionData));
    } else {
      recoveryData.name = connectionData.name;
      recoveryData.photo = connectionData.photo;
      await store.dispatch(setRecoveryData(recoveryData));
    }
  }

  // process groups uploaded to the channel
  groups = _.keyBy(groups, 'id');
  const groupDataIds = dataIds.filter(
    (dataId) =>
      dataId.startsWith('group_') && !groups[dataId.replace('group_', '')],
  );
  for (let dataId of groupDataIds) {
    let groupData = await downloadGroup(dataId, channelApi, aesKey);
    store.dispatch(createGroup(groupData));
  }

  // return true if sigs loaded and no new connection/group is comming
  if (sigDataIds.length || connectionDataIds.length || groupDataIds.length) {
    recoveryData.updateTimestamp = Date.now();
    store.dispatch(setRecoveryData(recoveryData));
    return false;
  } else if (Object.keys(sigs).length < 2) {
    return false;
  } else {
    return Date.now() - recoveryData.updateTimestamp > 5000;
  }
};

const downloadConnection = async (dataId, channelApi, aesKey) => {
  const channelId = hash(aesKey);
  const encrypted = await channelApi.download({ channelId, dataId });
  const connectionData = decryptData(encrypted, aesKey);
  const filename = await saveImage({
    imageName: connectionData.id,
    base64Image: connectionData.photo,
  });
  connectionData.photo = { filename };
  return connectionData;
};

const downloadGroup = async (dataId, channelApi, aesKey) => {
  const channelId = hash(aesKey);
  const encrypted = await channelApi.download({ channelId, dataId });
  const groupData = decryptData(encrypted, aesKey);
  const filename = await saveImage({
    imageName: groupData.id,
    base64Image: groupData.photo,
  });
  groupData.photo = { filename };
  return groupData;
};

export const uploadSigRequest = async (channelApi, recoveryData) => {
  const data = {
    signingKey: recoveryData.publicKey,
    timestamp: recoveryData.timestamp,
  };
  try {
    await channelApi.upload({
      channelId: hash(recoveryData.aesKey),
      data,
      dataId: 'data',
    });
  } catch (e) {
    const msg = 'Profile data already exists in channel';
    if (!e.message.startsWith(msg)) {
      throw e;
    }
  }
};

export const uploadSig = async ({
  id,
  timestamp,
  signingKey,
  channelApi,
  aesKey,
}) => {
  try {
    let {
      keypair: { secretKey },
      user: { id: signer },
    } = store.getState();

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

    let res = await channelApi.upload({
      channelId: hash(aesKey),
      dataId: `sig_${signer}`,
      data,
    });
  } catch (err) {
    console.warn(err);
  }
};

const uploadConnection = async (conn, channelApi, aesKey) => {
  const {
    id,
    name,
    photo: { filename },
  } = conn;

  // retrieve photo
  let photo = await retrieveImage(filename);
  let profileTimestamp = Date.now();

  let dataObj = {
    id,
    photo,
    name,
    profileTimestamp,
  };

  console.log(`Encrypting profile data with key ${aesKey}`);
  let encrypted = encryptData(dataObj, aesKey);
  console.log(`Posting profile data of ${id} ...`);
  await channelApi.upload({
    channelId: hash(aesKey),
    data: encrypted,
    dataId: `connection_${id}`,
  });
};

const uploadGroup = async (group, channelApi, aesKey) => {
  const {
    id,
    name,
    photo: { filename },
    aesKey: groupKey,
  } = group;

  // retrieve photo
  let photo = await retrieveImage(filename);
  let profileTimestamp = Date.now();

  let dataObj = {
    id,
    photo,
    name,
    profileTimestamp,
    aesKey: groupKey,
  };

  console.log(`Encrypting profile data with key ${aesKey}`);
  let encrypted = encryptData(dataObj, aesKey);
  console.log(`Posting profile data of ${id} ...`);
  await channelApi.upload({
    channelId: hash(aesKey),
    data: encrypted,
    dataId: `group_${id}`,
  });
};

export const uploadMutualInfo = async (conn, channelApi, aesKey) => {
  const dataIds = await channelApi.list(hash(aesKey));
  if (!dataIds.includes(`connection_${conn.id}`)) {
    await uploadConnection(conn, channelApi, aesKey);
  }

  let {
    connections: { connections },
    groups: { groups },
    user,
    recoveryData,
  } = store.getState();
  connections = _.keyBy(connections, 'id');
  groups = _.keyBy(groups, 'id');

  let otherSideConnections = await api.getConnections(conn.id, 'inbound');
  const knownLevels = ['just met', 'already known', 'recovery'];
  let mutualConnections = otherSideConnections
    .filter(
      (c) =>
        knownLevels.includes(c.level) &&
        connections[c.id] &&
        !dataIds.includes(`connection_${c.id}`),
    )
    .map((c) => connections[c.id]);
  if (!dataIds.includes(`connection_${user.id}`)) {
    mutualConnections.push(user);
  }

  let otherSideGroups = (await api.getUserInfo(conn.id)).groups;
  let mutualGroups = otherSideGroups
    .filter((g) => groups[g.id])
    .map((g) => groups[g.id]);

  recoveryData.totalItems = mutualConnections.length + mutualGroups.length;
  store.dispatch(setRecoveryData(recoveryData));
  for (let c of mutualConnections) {
    await uploadConnection(c, channelApi, aesKey);
    recoveryData.completedItems += 1;
    store.dispatch(setRecoveryData(recoveryData));
  }
  for (let g of mutualGroups) {
    await uploadGroup(g, channelApi, aesKey);
    recoveryData.completedItems += 1;
    store.dispatch(setRecoveryData(recoveryData));
  }
};

export const setupRecovery = async () => {
  await createImageDirectory();
  const { publicKey, secretKey } = await nacl.sign.keyPair();
  const aesKey = await randomKey(16);
  recoveryData = {
    publicKey: uInt8ArrayToB64(publicKey),
    secretKey,
    id: '',
    name: '',
    photo: '',
    aesKey,
    timestamp: Date.now(),
    updateTimestamp: Date.now(),
    sigs: {},
  };
  store.dispatch(setRecoveryData(recoveryData));
  return recoveryData;
};

export const recoveryQrStr = () => {
  const { aesKey } = store.getState().recoveryData;

  return encodeURIComponent(`Recovery2_${aesKey}`);
};

export const loadRecoveryData = async (
  channelApi: any,
  aesKey: string,
): { signingKey: string, timestamp: number } => {
  try {
    let data = await channelApi.download({
      channelId: hash(aesKey),
      dataId: 'data',
    });
    if (!data.signingKey || !data.timestamp) {
      throw new Error('Bad QR Data');
    } else {
      return data;
    }
  } catch (err) {
    throw new Error('Bad QR Data');
  }
};

export const setSigningKey = async () => {
  const { recoveryData } = store.getState();
  const sigs = Object.values(recoveryData.sigs);
  console.log('setting signing key');
  try {
    await api.setSigningKey({
      id: recoveryData.id,
      signingKey: recoveryData.publicKey,
      timestamp: recoveryData.timestamp,
      id1: sigs[0].signer,
      id2: sigs[1].signer,
      sig1: sigs[0].sig,
      sig2: sigs[1].sig,
    });
  } catch (err) {
    recoveryData.sigs = {};
    store.dispatch(setRecoveryData(recoveryData));
    throw new Error('bad sigs');
  }
};

export const fetchBackupData = async (key: string, pass: string) => {
  try {
    const hashedId = hashId(store.getState().recoveryData.id, pass);
    const res = await backupApi.getRecovery(hashedId, key);
    const decrypted = CryptoJS.AES.decrypt(res.data, pass).toString(
      CryptoJS.enc.Utf8,
    );
    emitter.emit('restoreProgress', 1);
    return decrypted;
  } catch (err) {
    emitter.emit('restoreProgress', 0);
    throw new Error('bad password');
  }
};

export const restoreUserData = async (pass: string) => {
  const { id } = store.getState().recoveryData;

  const decrypted = await fetchBackupData('data', pass);

  const { userData, connections, groups = [] } = JSON.parse(decrypted);

  if (!userData || !connections) {
    throw new Error('bad password');
  }

  const groupsPhotoCount = groups.filter((group) => group.photo?.filename)
    .length;

  emitter.emit('restoreTotal', connections.length + groupsPhotoCount + 2);

  userData.id = id;

  const userPhoto = await fetchBackupData(id, pass);

  if (userPhoto) {
    const filename = await saveImage({
      imageName: id,
      base64Image: userPhoto,
    });
    userData.photo = { filename };
  }

  return { userData, connections, groups };
};

export const recoverData = async (pass: string) => {
  const {
    id,
    name,
    photo,
    publicKey,
    secretKey,
  } = store.getState().recoveryData;
  if (pass) {
    // throws if data is bad
    var { userData, connections, groups } = await restoreUserData(pass);
    store.dispatch(setConnections(connections));
    store.dispatch(setGroups(groups));
  } else {
    var userData = { id, publicKey, secretKey, name, photo };
    var connections = [];
    var groups = [];
  }
  store.dispatch(setKeypair(publicKey, secretKey));

  for (let conn of connections) {
    try {
      let decrypted = await fetchBackupData(conn.id, pass);
      const filename = await saveImage({
        imageName: conn.id,
        base64Image: decrypted,
      });
      conn.photo = { filename };
    } catch (err) {
      console.log('image not found', err.message);
      conn.photo = { filename: '' };
    }
  }

  for (const group of groups) {
    if (group.photo?.filename) {
      try {
        let decrypted = await fetchBackupData(group.id, pass);
        await saveImage({
          imageName: group.id,
          base64Image: decrypted,
        });
      } catch (err) {
        console.log('image not found', err.message);
      }
    }
  }
  const userInfo = await api.getUserInfo(id);
  await store.dispatch(setGroups(userInfo.groups));
  await store.dispatch(updateConnections(userInfo.connections));
  await store.dispatch(setUserData(userData));
  // set new signing key on the backend
  await setSigningKey();
  await store.dispatch(setBackupCompleted(pass != ''));
  // password is required to update backup when user makes new connections
  await store.dispatch(setPassword(pass));
  await store.dispatch(removeRecoveryData());
  return true;
};
