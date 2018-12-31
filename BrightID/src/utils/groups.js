import store from '../store';

const STRANGER = {
  avatar: { filename: '' },
  nameornym: 'Stranger',
};

const findConnection = (findKey, connections) =>
  connections.find(u => u.publicKey === findKey) || STRANGER;

export const groupCirclePhotos = (group) => {
  const { avatar, safePubKey, connections } = store.getState().main;
  const { knownMembers, founders } = group;

  const memberList = group.isNew ? founders : knownMembers;

  const photos = memberList.map((memberKey) => {
    let foundAvatar;
    if (safePubKey === memberKey) {
      foundAvatar = avatar;
    } else {
      foundAvatar = findConnection(memberKey, connections).avatar;
    }
    // If a founder isn't in knownMembers, that founder hasn't joined yet and
    // will show as faded in the list.
    const faded = group.isNew && !knownMembers.includes(memberKey);
    return { avatar: foundAvatar, faded };
  });
  console.log(photos);
  return photos;
};

export const groupName = (group) => {
  const { safePubKey, nameornym, connections } = store.getState().main;
  const memberList = group.isNew ? group.founders : group.knownMembers;
  const names = memberList.map((publicKey) =>
    publicKey === safePubKey
      ? nameornym
      : findConnection(publicKey, connections).nameornym,
  );
  return names.map((n) => n.substr(0, 12)).join(', ');
};
