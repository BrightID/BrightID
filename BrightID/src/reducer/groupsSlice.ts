import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@brightid/redux/actions';
import {
  group_states,
  INVITE_ACCEPTED,
  INVITE_REJECTED,
} from '@/utils/constants';
import { toSearchString } from '@/utils/strings';
import { compareCreatedDesc } from '@/components/Groups/models/sortingUtility';
import {
  selectAllConnections,
  selectConnectionById,
} from '@/reducer/connectionsSlice';

/* ******** INITIAL STATE ************** */

const initialState: GroupsState = {
  groups: [],
  invites: [],
  searchParam: '',
  searchOpen: false,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    createGroup(state, action: PayloadAction<JoinedGroup>) {
      state.groups.push(action.payload);
    },
    updateGroup(state, action: PayloadAction<GroupInfo>) {
      const group = state.groups.find(
        (group) => group.id === action.payload.id,
      );
      Object.assign(group, action.payload);
    },
    upsertGroup(state, action: PayloadAction<GroupInfo>) {
      const groupInfo = action.payload;
      const group = state.groups.find((group) => group.id === groupInfo.id);
      if (group) {
        Object.assign(group, groupInfo);
      } else {
        state.groups.push({
          ...groupInfo,
          state: group_states.VERIFIED,
          joined: Date.now(),
        });
      }
    },
    deleteGroup(state, action: PayloadAction<Group>) {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload.id,
      );
    },
    setGroups(state, action: PayloadAction<JoinedGroup[]>) {
      state.groups = action.payload;
    },
    updateMemberships(state, action: PayloadAction<MembershipInfo[]>) {
      state.groups.forEach((group) => {
        const membership = action.payload.find(
          (membership) => membership.id === group.id,
        );
        if (!membership && group.state === group_states.VERIFIED) {
          group.state = group_states.DISMISSED;
        }
      });
      action.payload.forEach((membership) => {
        const group = state.groups.find((group) => group.id === membership.id);
        if (group) {
          group.state = group_states.VERIFIED;
          group.joined = membership.timestamp;
        } else {
          state.groups.push({
            id: membership.id,
            state: group_states.VERIFIED,
            joined: membership.timestamp,
            members: [],
            admins: [],
            invites: [],
            timestamp: Date.now(),
            type: 'general',
            url: '',
          });
        }
      });
    },
    joinGroup(state, action: PayloadAction<JoinedGroup>) {
      const newGroup = action.payload;
      const existingGroup = state.groups.find(
        (group) => group.id === newGroup.id,
      );
      if (existingGroup) {
        // replace existing group with new group
        Object.assign(existingGroup, action.payload);
      } else {
        state.groups.push(action.payload);
      }
    },
    leaveGroup(state, action: PayloadAction<Group>) {
      // get group to leave (and all potential duplicates, see below)
      const groupsToLeave = state.groups.filter(
        (group) => group.id === action.payload.id,
      );
      for (const group of groupsToLeave) {
        group.state = group_states.DISMISSED;
      }
      if (groupsToLeave.length > 1) {
        // There was a bug that could result in users having the same group multiple times in state.
        // To clean this up: When leaving a group we look for duplicates and only keep the first matching group in
        // state "dismissed". The duplicates will be completely removed from state.
        const groupsWithoutDuplicates = state.groups.filter(
          (group) => group.id !== action.payload.id,
        );
        // only keep first of the duplicates
        groupsWithoutDuplicates.push(groupsToLeave[0]);
        state.groups = groupsWithoutDuplicates;
      }
    },
    dismissFromGroup(
      state,
      action: PayloadAction<{ member: string; group: Group }>,
    ) {
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.group.id,
      );
      if (index !== -1) {
        state.groups[index].members = state.groups[index].members.filter(
          (member) => member !== action.payload.member,
        );
      }
    },
    addAdmin(state, action: PayloadAction<{ member: string; group: Group }>) {
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.group.id,
      );
      if (index !== -1) {
        const { member } = action.payload;
        const { members, admins } = state.groups[index];

        if (members.includes(member) && !admins.includes(member)) {
          state.groups[index].admins.push(member);
        }
      }
    },
    setInvites(state, action: PayloadAction<Invite[]>) {
      state.invites = action.payload;
    },
    acceptInvite(state, action: PayloadAction<string>) {
      const index = state.invites.findIndex(
        (invite) => invite.id === action.payload,
      );
      if (index !== -1) state.invites[index].state = INVITE_ACCEPTED;
    },
    rejectInvite(state, action: PayloadAction<string>) {
      const index = state.invites.findIndex(
        (invite) => invite.id === action.payload,
      );
      if (index !== -1) state.invites[index].state = INVITE_REJECTED;
    },
    setGroupSearch(state, action: PayloadAction<string>) {
      state.searchParam = action.payload;
    },
    setGroupSearchOpen(state, action: PayloadAction<boolean>) {
      state.searchOpen = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

export const allGroupsSelector = (state: RootState) => state.groups.groups;

export const activeGroupsSelector = (state: RootState) =>
  state.groups.groups.filter(
    (group) =>
      group.state === group_states.INITIATED ||
      group.state === group_states.VERIFIED,
  );

export const searchParamSelector = (state: RootState) =>
  state.groups.searchParam;

export const filteredGroupsSelector = createSelector(
  (state) => state,
  activeGroupsSelector,
  searchParamSelector,
  (state, allGroups, searchParam) => {
    let filteredGroups: Array<Group>;
    if (searchParam !== '') {
      const searchString = toSearchString(searchParam);
      filteredGroups = allGroups.filter((group) => {
        if (
          toSearchString(selectGroupName(state, group)).includes(searchString)
        ) {
          // direct group name match
          return true;
        } else {
          // check group members
          const allMemberNames = selectConnectionsByIDs(
            state,
            group.members,
          ).map((member) => toSearchString(member.name));
          for (const name of allMemberNames) {
            if (name.includes(searchString)) {
              // stop looking if a match is found
              return true;
            }
          }
          return false;
        }
      });
    } else {
      filteredGroups = allGroups;
    }
    return filteredGroups.sort(compareCreatedDesc);
  },
);

export const selectConnectionsByIDs = (
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

export const selectGroupName = (state: RootState, group: Group) => {
  return (
    group?.name ||
    selectThreeKnownMembers(state, group)
      .map((member) => member.name.substr(0, 13))
      .join(', ')
  );
};

export const selectThreeKnownMembers = (
  state: RootState,
  group: Group,
): Array<Connection> => {
  const {
    user: { id, photo, name },
  } = state;
  const connections = selectAllConnections(state);
  let members = [];

  if (group) {
    members = group?.members || [];
  }

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

export const selectGroupById = createSelector(
  allGroupsSelector,
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

export const {
  createGroup,
  updateGroup,
  upsertGroup,
  deleteGroup,
  setGroups,
  updateMemberships,
  joinGroup,
  leaveGroup,
  dismissFromGroup,
  addAdmin,
  setInvites,
  rejectInvite,
  acceptInvite,
  setGroupSearch,
  setGroupSearchOpen,
} = groupsSlice.actions;

// Export reducer
export default groupsSlice.reducer;
