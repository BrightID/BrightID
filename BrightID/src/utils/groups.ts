import { createSelector } from '@reduxjs/toolkit';

export const groupCirclePhotos = (threeMembers) =>
  threeMembers.map((member) => ({ photo: member.photo }));

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
