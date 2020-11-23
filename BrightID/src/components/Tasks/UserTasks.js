export const UserTasks = {
  make_first_connection: {
    id: 'make_first_connection',
    title: 'Make your first connection',
    description: 'Connect with another BrightID user',
    sortValue: 10,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 0;
    },
  },
  join_connection_party: {
    id: 'join_connection_party',
    title: 'Join a connection party',
    description: 'Join a BrightID connection party',
    sortValue: 20,
    url: 'https://www.brightid.org/meet',
    checkFn(state) {
      return state.user.verifications.includes('SeedConnected');
    },
  },
  link_app: {
    id: 'link_app',
    title: 'Register for an app',
    description: 'Register your BrightID for an app',
    sortValue: 30,
    url: 'https://apps.brightid.org/',
    checkFn(state) {
      // is there at least one linked context?
      const linkedContexts = state.apps.linkedContexts.filter(
        (linkedContext) => linkedContext.state === 'applied',
      );
      return linkedContexts.length > 0;
    },
  },
  setup_trusted_connections: {
    id: 'setup_trusted_connections',
    title: 'Setup social recovery',
    description:
      'Setup your trusted connections to enable social account recovery',
    sortValue: 40,
    url: 'https://brightid.gitbook.io/brightid/#backup-your-brightid',
    checkFn(state) {
      return (
        state.connections.trustedConnections.length > 2 &&
        state.user.backupCompleted
      );
    },
  },
};
