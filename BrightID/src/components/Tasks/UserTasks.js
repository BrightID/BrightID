export const UserTasks = {
  create_your_brightid: {
    id: 'create_your_brightid',
    title: 'Create your BrightID',
    description: 'Complete the Signup process',
    sortValue: 10,
    url: 'https://brightid.gitbook.io/brightid/#create-your-brightid',
    checkFn(state) {
      return !!state.user.id;
    },
  },
  add_a_picture: {
    id: 'add_a_picture',
    title: 'Add a picture',
    description: 'Add a picture to your BrightID',
    sortValue: 20,
    url: 'https://brightid.gitbook.io/brightid/#create-your-brightid',
    checkFn(state) {
      const { filename } = state.user.photo;
      return filename && filename !== '';
    },
  },
  make_first_connection: {
    id: 'make_first_connection',
    title: 'Make your first connection',
    description: 'Create one confirmed connection',
    sortValue: 30,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 0;
    },
  },
  make_second_connection: {
    id: 'make_second_connection',
    title: 'Make your second connection',
    description: 'Create 2 confirmed connections',
    sortValue: 40,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 1;
    },
  },
  create_group: {
    id: 'create_group',
    title: 'Create a group',
    description: 'Successfully create a group',
    sortValue: 60,
    url: 'https://brightid.gitbook.io/brightid/#creating-groups',
    checkFn(state) {
      // is there a group where I am the founder and at least 2 other founders have joined?
      const createdGroups = state.groups.groups.filter(
        (group) =>
          group.founders.includes(state.user.id) && group.members.length > 2,
      );
      return createdGroups.length > 0;
    },
  },
  get_verified: {
    id: 'get_verified',
    title: 'Get verified',
    description: 'Become a verified BrightID identity',
    sortValue: 70,
    url: 'https://brightid.gitbook.io/brightid/#verify-your-brightid',
    checkFn(state) {
      return state.user.verifications.includes('BrightID');
    },
  },
  setup_trusted_connections: {
    id: 'setup_trusted_connections',
    title: 'Setup trusted connections',
    description:
      'Setup your trusted connections to enable social account recovery',
    sortValue: 80,
    url: 'https://brightid.gitbook.io/brightid/#backup-your-brightid',
    checkFn(state) {
      // TODO Not sure if this is the correct condition
      // I need at least 3 trusted connections
      return state.connections.trustedConnections.length > 2;
    },
  },
  link_app: {
    id: 'link_app',
    title: 'Link an app',
    description: 'Link your brightID to an app context',
    sortValue: 90,
    checkFn(state) {
      // is there at least one linked context?
      const linkedContexts = state.apps.linkedContexts.filter(
        (linkedContext) => linkedContext.state === 'applied',
      );
      return linkedContexts.length > 0;
    },
  },
};
