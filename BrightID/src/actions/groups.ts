export const CREATE_GROUP = 'CREATE_GROUP';
export const DELETE_GROUP = 'DELETE_GROUP';
export const SET_NEW_GROUP_CO_FOUNDERS = 'SET_NEW_GROUP_CO_FOUNDERS';
export const CLEAR_NEW_GROUP_CO_FOUNDERS = 'CLEAR_NEW_GROUP_CO_FOUNDERS';
export const SET_GROUPS = 'SET_GROUPS';
export const SET_INVITES = 'SET_INVITES';
export const ACCEPT_INVITE = 'ACCEPT_INVITE';
export const REJECT_INVITE = 'REJECT_INVITE';
export const JOIN_GROUP = 'JOIN_GROUP';
export const LEAVE_GROUP = 'LEAVE_GROUP';
export const DISMISS_FROM_GROUP = 'DISMISS_FROM_GROUP';
export const ADD_ADMIN = 'ADD_ADMIN';
export const SET_GROUP_SEARCH = 'SET_GROUP_SEARCH';
export const SET_GROUP_SEARCH_OPEN = 'SET_GROUPS_SEARCH_OPEN';

/**
 * redux action creator for create new group
 * @param group: new group
 */
export const createGroup = (group: group) => ({
  type: CREATE_GROUP,
  group,
});

export const deleteGroup = (group: group) => ({
  type: DELETE_GROUP,
  group,
});

/**
 * redux action creator for set co-founders of new group
 * @param coFounders: an array contain two ids of co-founders of new group.
 */
export const setNewGroupCoFounders = (newGroupCoFounders: string[]) => ({
  type: SET_NEW_GROUP_CO_FOUNDERS,
  newGroupCoFounders,
});

/**
 * redux action creator for clear co-founders of new group
 */
export const clearNewGroupCoFounders = () => ({
  type: CLEAR_NEW_GROUP_CO_FOUNDERS,
});

/**
 * redux action creator for set groups
 * @param groups: list of user groups
 */
export const setGroups = (groups: group[]) => ({
  type: SET_GROUPS,
  groups,
});

/**
 * redux action creator for set user invites
 * @param invites: list of user invites
 */
export const setInvites = (invites: invite[]) => ({
  type: SET_INVITES,
  invites,
});

export const joinGroup = (group: group) => ({
  type: JOIN_GROUP,
  group,
});

export const leaveGroup = (group: group) => ({
  type: LEAVE_GROUP,
  group,
});

export const dismissFromGroup = (member: string, group: group) => ({
  type: DISMISS_FROM_GROUP,
  group,
  member,
});

export const addAdmin = (member: string, group: group) => ({
  type: ADD_ADMIN,
  group,
  member,
});

export const rejectInvite = (inviteId: string) => ({
  type: REJECT_INVITE,
  inviteId,
});

export const acceptInvite = (inviteId: string) => ({
  type: ACCEPT_INVITE,
  inviteId,
});

/**
 * redux action creator for setting the search string used to filter groups
 * @param searchParam string used to filter groups
 */
export const setGroupSearch = (searchParam: string) => ({
  type: SET_GROUP_SEARCH,
  searchParam,
});

export const setGroupSearchOpen = (searchOpen: boolean) => ({
  type: SET_GROUP_SEARCH_OPEN,
  searchOpen,
});