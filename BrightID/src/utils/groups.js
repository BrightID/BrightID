import { uInt8ArrayToUrlSafeB64 } from './encoding';
import store from '../store';

const STRANGER = {
  avatar: { uri: '' },
  nameornym: 'Stranger',
};

const findConnection = (findKey, connections) =>
  connections.find(
    (connection) =>
      uInt8ArrayToUrlSafeB64(connection.publicKey) === findKey,
  ) || STRANGER;



export const groupPhotos = (group) => {
  const {avatar, publicKey, connections} = store.getState().main;
  const { knownMembers, founders } = group;
  const userPk = uInt8ArrayToUrlSafeB64(publicKey);

  const memberList = group.isNew ? founders : knownMembers;

  const photos = memberList.map((publicKey) => {
    let foundAvatar;
    if (userPk === publicKey) {
      foundAvatar = avatar;
    } else {
      foundAvatar = findConnection(publicKey, connections).avatar
    }
    // knownMembers has the founders that have joined. If a founder isn't in
    // knownMembers, that founder hasn't joined yet and will still show in the
    // list, but be faded.
    const faded = group.isNew && !knownMembers.includes(publicKey);
    return { avatar: foundAvatar , faded};
  });

  console.log(photos);
  return photos;
};

export const groupName = (group) => {
  const {publicKey, nameornym, connections} = store.getState().main;
  const userPk = uInt8ArrayToUrlSafeB64(publicKey);
  const memberList = group.isNew ? group.founders : group.knownMembers;
  const names = memberList.map((publicKey) =>
    publicKey === userPk ? nameornym : findConnection(publicKey, connections).nameornym,
  );
  return names.map( n => n.substr(0,12)).join(', ');
};
