// @flow

import { assoc, indexOf, update } from 'ramda';
import {
  CREATE_GROUP,
  SET_NEW_GROUP_CO_FOUNDERS,
  CLEAR_NEW_GROUP_CO_FOUNDERS,
  SET_GROUPS,
  SET_INVITES,
  DELETE_GROUP,
  ACCEPT_INVITE,
  REJECT_INVITE,
  JOIN_GROUP,
  LEAVE_GROUP,
  DISMISS_FROM_GROUP,
} from '@/actions';
import { INVITE_ACCEPTED, INVITE_REJECTED } from '@/utils/constants';

export const initialState = {
  newGroupCoFounders: [],
  groups: [],
  invites: [],
};

export const reducer = (state: GroupsState = initialState, action: action) => {
  switch (action.type) {
    case CREATE_GROUP: {
      return {
        ...state,
        groups: [action.group, ...state.groups.slice(0)],
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
      const groups = action.groups.map((group) => {
        const oldGroup = state.groups.find((g) => g.id === group.id);
        if (oldGroup) {
          group.name = oldGroup.name;
          group.photo = oldGroup.photo;
          group.aesKey = oldGroup.aesKey;
        }
        return group;
      });
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
            invite.state = INVITE_ACCEPTED;
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
            invite.state = INVITE_REJECTED;
          }
          return invite;
        }),
      };
    }
    case JOIN_GROUP: {
      if (action.group.members.length === 3) {
        action.group.isNew = false;
      }
      return {
        ...state,
        groups: [action.group, ...state.groups],
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
        return { ...state };
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
    default: {
      return state;
    }
  }
};

export default reducer;
