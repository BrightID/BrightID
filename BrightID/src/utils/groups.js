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
  const { members } = group;
  const connsWithMe = [
    ...connections,
    {
      photo,
      name,
      id,
    },
  ];
  let list = members
    .map((u) => connsWithMe.find((conn) => conn.id === u))
    .filter((u) => u)
    .sort((u1, u2) => (group.admins.includes(u1) ? -1 : 1))
    .slice(0, 3);
  return list;
};

export const groupCirclePhotos = (group) => {
  return threeKnownMembers(group).map((member) => {
    return { photo: member.photo };
  });
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
    user: { name, id, photo },
  } = store.getState();

  return ids.map((_id) => {
    if (_id === id) {
      return { id, name, photo };
    }
    const conn = selectConnectionById(store.getState(), _id);
    if (conn) {
      return conn;
    } else {
      return { id: _id, name: 'Stranger' };
    }
  });
};

export const knownMemberIDs = (group) => {
  // only members that are in my connections are known
  let knownMemberIDs = group.members.filter((memberId) =>
    selectConnectionById(store.getState(), memberId),
  );
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
