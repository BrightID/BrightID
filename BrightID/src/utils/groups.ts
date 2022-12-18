import { createSelector } from '@reduxjs/toolkit';
import {
  selectAllConnections,
  selectConnectionById,
} from '@/reducer/connectionsSlice';

const threeKnownMembers = (
  state: RootState,
  group: Group,
): Array<Connection> => {
  const {
    user: { id, photo, name },
  } = state;
  const connections = selectAllConnections(state);
  const { members } = group;
  const connsWithMe = [
    ...connections,
    {
      photo,
      name,
      id,
    },
  ];
  return members
    .map((u) => connsWithMe.find((conn) => conn.id === u))
    .filter((u) => u)
    .sort((u1) => (group.admins.includes(u1.id) ? -1 : 1))
    .slice(0, 3);
};

export const groupCirclePhotos = (state: RootState, group: Group) => {
  return threeKnownMembers(state, group).map((member) => {
    return { photo: member.photo };
  });
};

export const getGroupName = (state: RootState, group: Group) => {
  return (
    group?.name ||
    threeKnownMembers(state, group)
      .map((member) => member.name.substr(0, 13))
      .join(', ')
  );
};

export const ids2connections = (
  state: RootState,
  ids: Array<string>,
): Array<Connection> => {
  const {
    user: { name, id, photo },
  } = state;

  return ids.map((_id) => {
    if (_id === id) {
      return { id, name, photo };
    }
    const conn = selectConnectionById(state, _id);
    if (conn) {
      return conn;
    } else {
      return { id: _id, name: 'Stranger' };
    }
  });
};

export const groupByIdSelector = createSelector(
  (state: RootState) => state.groups.groups,
  (_, groupId: string) => groupId,
  (groups: Group[], groupId: string) => {
    const group = groups.find((group) => group.id === groupId);
    return {
      group,
      admins: group ? group.admins : [],
      members: group ? group.members : [],
    };
  },
);
