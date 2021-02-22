import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RESET_STORE } from '@/actions/resetStore';
import { INVITE_ACCEPTED, INVITE_REJECTED } from '@/utils/constants';

/* ******** INITIAL STATE ************** */

export const initialState: GroupsState = {
  newGroupCoFounders: [],
  groups: [],
  invites: [],
  searchParam: '',
  searchOpen: false,
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
      if (action.payload.members.length > 2) {
        action.payload.isNew = false;
      }
      state.groups.push(action.payload);
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
  setGroupSearch,
  setGroupSearchOpen,
} = groupsSlice.actions;

// Export reducer
export default groupsSlice.reducer;
