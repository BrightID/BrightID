import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';
import { INVITE_ACCEPTED, INVITE_REJECTED } from '@/utils/constants';

/* ******** INITIAL STATE ************** */

const initialState: GroupsState = {
  newGroupCoFounders: [],
  groups: [],
  invites: [],
  groupsSearchParam: '',
  membersSearchParam: '',
  groupsSearchOpen: false,
  membersSearchOpen: false,
};

const groupsSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    createGroup(state, action: PayloadAction<Group>) {
      state.groups.push(action.payload);
    },
    deleteGroup(state, action: PayloadAction<Group>) {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload.id,
      );
    },
    setNewGroupCoFounders(state, action: PayloadAction<string[]>) {
      state.newGroupCoFounders = action.payload;
    },
    clearNewGroupCoFounders(state) {
      state.newGroupCoFounders = [];
    },
    setGroups(state, action: PayloadAction<Group[]>) {
      const mergeWithOld = (group: Group) => {
        const oldGroup = state.groups.find((g) => g.id === group.id);
        if (oldGroup) {
          group.name = oldGroup.name;
          group.photo = oldGroup.photo;
          group.aesKey = oldGroup.aesKey;
        }
        return group;
      };

      state.groups = action.payload.map(mergeWithOld);
    },
    joinGroup(state, action: PayloadAction<Group>) {
      const group = action.payload;
      if (group.members.length > 1) {
        // joining a group that already has 2 members, so I'm either the last founder
        // or an additional member -> the group is complete
        group.isNew = false;
      }
      state.groups.push(group);
    },
    leaveGroup(state, action: PayloadAction<Group>) {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload.id,
      );
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
    setGroupsSearch(state, action: PayloadAction<string>) {
      state.groupsSearchParam = action.payload;
    },
    setGroupsSearchOpen(state, action: PayloadAction<boolean>) {
      state.groupsSearchOpen = action.payload;
    },
    setMembersSearch(state, action: PayloadAction<string>) {
      state.membersSearchParam = action.payload;
    },
    setMembersSearchOpen(state, action: PayloadAction<boolean>) {
      state.membersSearchOpen = action.payload;
    },
  },
  extraReducers: {
    [RESET_STORE]: () => {
      return initialState;
    },
  },
});

// Export channel actions
export const {
  createGroup,
  deleteGroup,
  setNewGroupCoFounders,
  clearNewGroupCoFounders,
  setGroups,
  joinGroup,
  leaveGroup,
  dismissFromGroup,
  addAdmin,
  setInvites,
  rejectInvite,
  acceptInvite,
  setGroupsSearch,
  setGroupsSearchOpen,
  setMembersSearch,
  setMembersSearchOpen,
} = groupsSlice.actions;

// Export reducer
export default groupsSlice.reducer;
