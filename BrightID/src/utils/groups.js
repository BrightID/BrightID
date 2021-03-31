import store from '@/store';
import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllConnections,
  selectConnectionById,
} from '@/reducer/connectionsSlice';

const threeKnownMembers = (group) => {
  const {
    user: { id, photo, name },
  } = store.getState();
  const connections = selectAllConnections(store.getState());
  const { founders, members, isNew } = group;
  const connsWithMe = [
    ...connections,
    {
      photo,
      name,
      id,
    },
  ];
  let list = (isNew ? founders : members)
    .map((u) => connsWithMe.find((conn) => conn.id === u))
    .filter((u) => u)
    .sort((u1, u2) => (founders.includes(u1) ? -1 : 1))
    .slice(0, 3);

  return list;
};

export const groupCirclePhotos = (group) => {
  const { members } = group;

  const photos = threeKnownMembers(group).map((member) => {
    // If a founder isn't in members, that founder hasn't joined yet and
    // their photo will be faded.

    const faded = group?.isNew && !members.includes(member.id);

    return { photo: member.photo, faded };
  });
  return photos;
};

export const getGroupName = (group) => {
  return (
    group?.name ||
    threeKnownMembers(group)
      .map((member) => member.name.substr(0, 13))
      .join(', ')
  );
};

export const ids2connections = (ids) => {
  const {
    user: { name, id, photo, score },
  } = store.getState();

  return ids.map((_id) => {
    if (_id === id) {
      return { id, name, photo, score };
    }
    const conn = selectConnectionById(store.getState(), _id);
    if (conn) {
      return conn;
    } else {
      return { id: _id, name: 'Stranger', score: 0 };
    }
  });
};

export const knownMemberIDs = (group) => {
  // only members that are in my connections are known
  let knownMemberIDs = group.members.filter((memberId) =>
    selectConnectionById(store.getState(), memberId),
  );
  if (group.isNew) {
    // explicitly add founderIDs as they might not have joined yet
    knownMemberIDs = knownMemberIDs.concat(group.founders);
    // make sure array is unique
    knownMemberIDs = [...new Set(knownMemberIDs)];
  }
  return knownMemberIDs;
};

export const groupByIdSelector = createSelector(
  (state) => state.groups.groups,
  (_, groupId) => groupId,
  (groups, groupId) => {
    const group = groups.find((group) => group.id === groupId);
    return {
      group,
      admins: group ? group.admins : [],
      members: group ? group.members : [],
    };
  },
);
