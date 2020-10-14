import i18next from 'i18next';

export const UserTasks = {
  create_your_brightid: {
    id: 'create_your_brightid',
    title: i18next.t('tasks.title.createYourBrightId'),
    description: i18next.t('tasks.text.createYourBrightId'),
    sortValue: 10,
    url: 'https://brightid.gitbook.io/brightid/#create-your-brightid',
    checkFn(state) {
      return !!state.user.publicKey;
    },
  },
  add_a_picture: {
    id: 'add_a_picture',
    title: i18next.t('tasks.title.addPicture'),
    description: i18next.t('tasks.text.addPicture'),
    sortValue: 20,
    url: 'https://brightid.gitbook.io/brightid/#create-your-brightid',
    checkFn(state) {
      const { filename } = state.user.photo;
      return filename && filename !== '';
    },
  },
  make_first_connection: {
    id: 'make_first_connection',
    title: i18next.t('tasks.title.makeFirstConnection'),
    description: i18next.t('tasks.text.makeFirstConnection'),
    sortValue: 30,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 0;
    },
  },
  make_second_connection: {
    id: 'make_second_connection',
    title: i18next.t('tasks.title.makeSecondConnection'),
    description: i18next.t('tasks.text.makeSecondConnection'),
    sortValue: 40,
    url: 'https://brightid.gitbook.io/brightid/#making-connections',
    checkFn(state) {
      return state.connections.connections.length > 1;
    },
  },
  create_group: {
    id: 'create_group',
    title: i18next.t('tasks.title.createGroup'),
    description: i18next.t('tasks.text.createGroup'),
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
    title: i18next.t('tasks.title.getVerified'),
    description: i18next.t('tasks.text.getVerified'),
    sortValue: 70,
    url: 'https://brightid.gitbook.io/brightid/#verify-your-brightid',
    checkFn(state) {
      return state.user.verifications.includes('BrightID');
    },
  },
  setup_trusted_connections: {
    id: 'setup_trusted_connections',
    title: i18next.t('tasks.title.setupTrusteConnections'),
    description: i18next.t('tasks.text.setupTrusteConnections'),
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
    title: i18next.t('tasks.title.linkApp'),
    description: i18next.t('tasks.text.linkApp'),
    sortValue: 90,
    checkFn(state) {
      // is there at least one app that is linked?
      const linkedApps = state.apps.apps.filter((app) => app.linked === true);
      return linkedApps.length > 0;
    },
  },
};
