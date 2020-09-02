// @flow

import { assoc, indexOf, update } from 'ramda';
import {
  CREATE_GROUP,
  DELETE_GROUP,
  SET_NEW_GROUP_CO_FOUNDERS,
  CLEAR_NEW_GROUP_CO_FOUNDERS,
  SET_GROUPS,
  SET_GROUP_SEARCH,
  SET_GROUP_SEARCH_OPEN,
  SET_INVITES,
  ACCEPT_INVITE,
  REJECT_INVITE,
  JOIN_GROUP,
  LEAVE_GROUP,
  DISMISS_FROM_GROUP,
  RESET_STORE,
} from '@/actions';
import { INVITE_ACCEPTED, INVITE_REJECTED } from '@/utils/constants';
import { ADD_ADMIN } from '@/actions/groups';

/* ******** INITIAL STATE ************** */

export const initialState = {
  newGroupCoFounders: [],
  groups: [],
  invites: [],
  searchParam: '',
};

/* ******** REDUCER ****************** */

export const reducer = (state: GroupsState = initialState, action: action) => {
  switch (action.type) {
    case SET_GROUP_SEARCH: {
      return {
        ...state,
        searchParam: action.searchParam,
      };
    }
    case SET_GROUP_SEARCH_OPEN: {
      return {
        ...state,
        searchOpen: action.searchOpen,
      };
    }
    case CREATE_GROUP: {
      const groups: group[] = state.groups.concat(action.group);
      return {
        ...state,
        groups,
      };
    }
    case DELETE_GROUP: {
      const groups: group[] = state.groups.filter(
        (group) => group.id !== action.group.id,
      );
      return {
        ...state,
        groups,
      };
    }
    case SET_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: action.newGroupCoFounders,
      };
    }
    case CLEAR_NEW_GROUP_CO_FOUNDERS: {
      return {
        ...state,
        newGroupCoFounders: [],
      };
    }
    case SET_GROUPS: {
      const mergeWithOld = (group) => {
        const oldGroup = state.groups.find((g) => g.id === group.id);
        if (oldGroup) {
          group.name = oldGroup.name;
          group.photo = oldGroup.photo;
          group.aesKey = oldGroup.aesKey;
        }
        return group;
      };

      const groups = action.groups.map(mergeWithOld);
      return {
        ...state,
        groups,
      };
    }
    case SET_INVITES: {
      return {
        ...state,
        invites: action.invites,
      };
    }
    case ACCEPT_INVITE: {
      return {
        ...state,
        invites: state.invites.map<invite>((invite) => {
          if (invite.inviteId === action.inviteId) {
            return { ...invite, state: INVITE_ACCEPTED };
          }
          return invite;
        }),
      };
    }
    case REJECT_INVITE: {
      return {
        ...state,
        invites: state.invites.map<invite>((invite) => {
          if (invite.inviteId === action.inviteId) {
            return { ...invite, state: INVITE_REJECTED };
          }
          return invite;
        }),
      };
    }
    case JOIN_GROUP: {
      if (action.group.members.length === 3) {
        action.group.isNew = false;
      }

      const groups: group[] = state.groups.concat(action.group);

      return {
        ...state,
        groups,
      };
    }
    case LEAVE_GROUP: {
      const groups: group[] = state.groups.filter(
        (group): boolean => group.id !== action.group.id,
      );
      return {
        ...state,
        groups,
      };
    }
    case DISMISS_FROM_GROUP: {
      const index = indexOf(action.group, state.groups);

      if (index === -1) {
        return state;
      }

      const group = state.groups[index];

      const members: string[] = group.members.filter(
        (member) => member !== action.member,
      );

      const updatedGroup = assoc('members', members, group);

      return {
        ...state,
        groups: update(index, updatedGroup, state.groups),
      };
    }
    case ADD_ADMIN: {
      // find group to update
      const groupIndex = indexOf(action.group, state.groups);
      if (groupIndex === -1) {
        return state;
      }
      const group = state.groups[groupIndex];

      // check if member to promote is member of group
      const isMember = group.members.includes(action.member);
      if (!isMember) {
        return state;
      }

      // check if member to promote is already admin
      const isAdmin = group.admins.includes(action.member);
      if (isAdmin) {
        return state;
      }

      // add member to promote to 'admins' array
      const updatedAdmins = group.admins.concat([action.member]);
      const updatedGroup = assoc('admins', updatedAdmins, group);

      return {
        ...state,
        groups: update(groupIndex, updatedGroup, state.groups),
      };
    }
    case RESET_STORE: {
      return { ...initialState };
    }
    default: {
      return state;
    }
  }
};

export default reducer;
