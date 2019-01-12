import store from '../store';

const memberList = (group) => {

  const { safePubKey, photo, name, connections } = store.getState().main;
  const { founders, knownMembers, isNew } = group;

  const me = {
    photo,
    name,
  };

  const stranger = {
    photo: { filename: '' },
    name: 'Stranger',
  };

  const memberList = [];

  // Prefer founders if the user knows them. For new groups, only founders can
  // be used. Use "Stranger" if the user doesn't know the other co-founder.

  founders.forEach((founder) => {
    if (founder === safePubKey) {
      memberList.push(me);
    } else {
      const connection = connections.find(u => u.publicKey === founder);
      if (connection) {
        memberList.push(connection);
      } else if (isNew) {
        memberList.push(stranger);
      }
    }
  });

  // If the group is new we're done.

  if (!isNew) {

    // Try to find three members known to the user.

    let m = 0;
    while (memberList.length < 3 && m < knownMembers.length) {
      let currentKey = knownMembers[m];
      if (!founders.includes(currentKey)) {
        const connection = connections.find(u => u.publicKey === currentKey);
        if (connection) {
          memberList.push(connection);
        }
      }
      ++m;
    }

    // If the user doesn't know three members, add the user if in the group.

    if (memberList.length < 3 && !founders.includes(safePubKey) && knownMembers.includes(safePubKey)) {
      memberList.push(me);
    }
  }

  return memberList;
};

export const groupCirclePhotos = (group) => {

  const { knownMembers } = group;

  const photos = memberList(group).map((member) => {

    // If a founder isn't in knownMembers, that founder hasn't joined yet and
    // their photo will be faded.

    const faded = group.isNew && !knownMembers.includes(member.publicKey);

    return { photo: member.photo, faded };
  });
  return photos;
};

export const getGroupName = (group) => {

  const names = memberList(group).map(member =>
    member.name.substr(0, 13),
  );

  return names.join(', ');
};

