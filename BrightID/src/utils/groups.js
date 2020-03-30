import store from '@/store';
import CryptoJS from 'crypto-js';

const knownMembers = (group) => {
  const { id, photo, name, connections } = store.getState();
  const { founders, members, isNew } = group;
  const me = {
    photo,
    name,
    id,
  };

  let list = [];

  // Prefer founders if the user knows them. For new groups, only founders can
  // be used. Use "Stranger" if the user doesn't know the other co-founder.

  founders.forEach((founder) => {
    if (founder === id) {
      list.push(me);
    } else {
      const connection = connections.find((u) => u.id === founder);
      if (connection) {
        list.push(connection);
      }
    }
  });

  // If the group is new we're done.

  if (!isNew) {
    // Try to find three members known to the user.

    const connIds = connections.map((u) => u.id);
    list = list.concat(
      members
        .filter((u) => !founders.includes(u) && connIds.includes(u))
        .map((u) => connections.find((conn) => conn.id === u)),
    );

    // let m = 0;
    // while (list.length < 3 && m < members.length) {
    //   let current = members[m];
    //   if (!founders.includes(current)) {
    //     const connection = connections.find((u) => u.id === current);
    //     if (connection) {
    //       list.push(connection);
    //     }
    //   }
    //   m += 1;
    // }

    // If the user doesn't know three members, add the user if in the group.

    if (list.length < 3 && !founders.includes(id) && members.includes(id)) {
      list.push(me);
    }
  }

  return list;
};

export const groupCirclePhotos = (group) => {
  const { members } = group;

  const photos = knownMembers(group).map((member) => {
    // If a founder isn't in members, that founder hasn't joined yet and
    // their photo will be faded.

    const faded = group.isNew && !members.includes(member.id);

    return { photo: member.photo, faded };
  });
  return photos;
};

export const getGroupName = (group) => {
  return (
    group.name ||
    knownMembers(group)
      .map((member) => member.name.substr(0, 13))
      .join(', ')
  );
};

export const getInviteInfo = async (invite) => {
  console.log('getting invite info');
  const { connections } = store.getState();
  const conn = connections.find((conn) => conn.id === invite.inviter);
  if (!conn.aesKey) {
    return {};
  }
  const groupAesKey = CryptoJS.AES.decrypt(invite.data, conn.aesKey).toString(
    CryptoJS.enc.Utf8,
  );
  // const uuidKey = invite.url.split('/').pop();
  const res = await fetch(invite.url);
  const data = await res.text();
  let info = CryptoJS.AES.decrypt(data, groupAesKey).toString(
    CryptoJS.enc.Utf8,
  );
  info = JSON.parse(info);
  console.log(`invited group name is ${info.name}`);
  return info;
};

export const ids2connections = (ids) => {
  const { connections, name, id, photo, score } = store.getState();
  return ids.map((_id) => {
    if (_id === id) {
      return { id, name, photo, score };
    }
    const conn = connections.find((conn) => conn.id === _id);
    if (conn) {
      return conn;
    } else {
      return { id: _id, name: 'Stranger', score: 0 };
    }
  });
};
