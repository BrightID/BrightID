/*
  Note:
  Task titles and descriptions are loaded from translations, with keys
  "achievements.<taskId>.title" and "achievements.<taskId>.description"
 */

export const UserTasks = {
  make_first_connection: {
    id: 'make_first_connection',
    sortValue: 10,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 0;
    },
  },
  link_app: {
    id: 'link_app',
    sortValue: 20,
    url: 'https://apps.brightid.org/',
    checkFn(state) {
      // is there at least one linked context?
      const linkedContexts = state.apps.linkedContexts.filter(
        (linkedContext) => linkedContext.state === 'applied',
      );
      return linkedContexts.length > 0;
    },
  },
  get_sponsored: {
    id: 'get_sponsored',
    sortValue: 30,
    url: 'https://apps.brightid.org/',
    checkFn(state) {
      return state.user.isSponsored;
    },
  },
  make_two_connection: {
    id: 'make_two_connection',
    sortValue: 50,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 1;
    },
  },
  make_three_connection: {
    id: 'make_three_connection',
    sortValue: 60,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 2;
    },
  },
  setup_trusted_connections: {
    id: 'setup_trusted_connections',
    sortValue: 70,
    url: 'https://brightid.gitbook.io/brightid/#backup-your-brightid',
    checkFn(state) {
      return (
        state.connections.trustedConnections.length > 2 &&
        state.user.backupCompleted
      );
    },
  },
  join_connection_party: {
    id: 'join_connection_party',
    sortValue: 110,
    url: 'https://www.brightid.org/meet',
    checkFn(state) {
      return state.user.verifications.includes('SeedConnected');
    },
  },
  join_connection_party_with_friend: {
    id: 'join_connection_party_with_friend',
    sortValue: 120,
    url: 'https://www.brightid.org/meet',
    checkFn(state) {
      return state.user.verifications.includes('SeedConnectedWithFriend');
    },
  },
};
