import store from '../store';
import { hash } from './encoding';

const knownMembers = (group) => {
  const { id, photo, name, connections } = store.getState();
  const { founders, members, isNew } = group;

  const me = {
    photo,
    name,
    id,
  };

  const stranger = {
    photo: { filename: '' },
    name: 'Stranger',
  };

  const list = [];

  // Prefer founders if the user knows them. For new groups, only founders can
  // be used. Use "Stranger" if the user doesn't know the other co-founder.

  founders.forEach((founder) => {
    if (founder === id) {
      list.push(me);
    } else {
      const connection = connections.find((u) => u.id === founder);
      if (connection) {
        list.push(connection);
      } else if (isNew) {
        list.push(stranger);
      }
    }
  });

  // If the group is new we're done.

  if (!isNew) {
    // Try to find three members known to the user.

    let m = 0;
    while (list.length < 3 && m < members.length) {
      let current = members[m];
      if (!founders.includes(current)) {
        const connection = connections.find((u) => u.id === current);
        if (connection) {
          list.push(connection);
        }
      }
      m += 1;
    }

    // If the user doesn't know three members, add the user if in the group.

    if (
      list.length < 3 &&
      !founders.includes(id) &&
      members.includes(id)
    ) {
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
  const names = knownMembers(group).map((member) => member.name.substr(0, 13));

  return names.join(', ');
};

export const newGroupId = () => {
  const {
    id,
    newGroupCoFounders,
    eligibleGroups,
    currentGroups,
  } = store.getState();
  const existingGroups = [...eligibleGroups, ...currentGroups];
  const groupId = hash(
    [id, newGroupCoFounders[0], newGroupCoFounders[1]].sort().join(','),
  );
  if (existingGroups.some((el) => el.id === groupId)) {
    throw new Error('group already exists');
  }
  return groupId;
};
