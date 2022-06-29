import { createSelector } from '@reduxjs/toolkit';
import store from '@/store';
import {
  selectAllConnections,
  selectConnectionById,
} from '@/reducer/connectionsSlice';

const threeKnownMembers = (group: Group): Array<Connection> => {
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
  return members
    .map((u) => connsWithMe.find((conn) => conn.id === u))
    .filter((u) => u)
    .sort((u1) => (group.admins.includes(u1.id) ? -1 : 1))
    .slice(0, 3);
};

export const groupCirclePhotos = (group: Group) => {
  return threeKnownMembers(group).map((member) => {
    return { photo: member.photo };
  });
};

export const getGroupName = (group: Group) => {
  return (
    group?.name ||
    threeKnownMembers(group)
      .map((member) => member.name.substr(0, 13))
      .join(', ')
  );
};

export const ids2connections = (ids: Array<string>): Array<Connection> => {
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

export const knownMemberIDs = (group: Group) => {
  // only members that are in my connections are known
  return group.members.filter((memberId) =>
    selectConnectionById(store.getState(), memberId),
  );
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
