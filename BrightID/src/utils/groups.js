import store from '../store';

const STRANGER = {
  photo: { filename: '' },
  name: 'Stranger',
};

const findConnection = (findKey, connections) =>
  connections.find(u => u.publicKey === findKey) || STRANGER;

export const groupCirclePhotos = (group) => {
  const { photo, safePubKey, connections } = store.getState().main;
  const { knownMembers, founders } = group;

  const memberList = group.isNew ? founders : knownMembers;

  const photos = memberList.map((memberKey) => {
    let foundPhoto;
    if (safePubKey === memberKey) {
      foundPhoto = photo;
    } else {
      foundPhoto = findConnection(memberKey, connections).photo;
    }
    // If a founder isn't in knownMembers, that founder hasn't joined yet and
    // will show as faded in the list.
    const faded = group.isNew && !knownMembers.includes(memberKey);
    return { photo: foundPhoto, faded };
  });
  console.log(photos);
  return photos;
};

export const groupName = (group) => {
  const { safePubKey, name, connections } = store.getState().main;
  const memberList = group.isNew ? group.founders : group.knownMembers;
  const names = memberList.map((publicKey) =>
    publicKey === safePubKey
      ? name
      : findConnection(publicKey, connections).name,
  );
  return names.map((n) => n.substr(0, 12)).join(', ');
};
