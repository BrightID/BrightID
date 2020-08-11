export const UserTasks = {
  task1: {
    id: 'task1',
    title: 'Create your BrightID',
    description: 'Complete the Signup process',
    sortValue: 10,
    checkFn(state) {
      return !!state.user.publicKey;
    },
  },
  task2: {
    id: 'task2',
    title: 'Add a picture',
    description: 'Add a picture to your BrightID',
    sortValue: 20,
    checkFn(state) {
      const { filename } = state.user.photo;
      return filename && filename !== '';
    },
  },
  task3: {
    id: 'task3',
    title: 'Make your first connection',
    description: 'Create one confirmed connection',
    sortValue: 30,
    checkFn(state) {
      return state.connections.connections.length > 0;
    },
  },
  task4: {
    id: 'task4',
    title: 'Make your second connection',
    description: 'Create 2 confirmed connections',
    sortValue: 40,
    checkFn(state) {
      return state.connections.connections.length > 1;
    },
  },
  task5: {
    id: 'task5',
    title: 'Join a group',
    description: 'Be invited to a group where you are not founder',
    sortValue: 50,
    checkFn(state) {
      // is there a group where I am not the founder?
      const joinedGroups = state.groups.groups.filter(
        (group) => !group.founders.includes(state.user.id),
      );
      return joinedGroups.length > 0;
    },
  },
  task6: {
    id: 'task6',
    title: 'Create a group',
    description: 'Successfully create a group with at least 2 founders',
    sortValue: 60,
    checkFn(state) {
      // is there a group where I am the founder and at least 2 other founders have joined?
      const createdGroups = state.groups.groups.filter(
        (group) =>
          group.founders.includes(state.user.id) && group.members.length > 2,
      );
      return createdGroups.length > 0;
    },
  },
  task7: {
    id: 'task7',
    title: 'Get verified',
    description: 'Become a verified BrightID identity',
    sortValue: 70,
    checkFn(state) {
      return state.user.verifications.includes('BrightID');
    },
  },
  task8: {
    id: 'task8',
    title: 'Enable social recovery',
    description: 'Setup trusted connections to enable social account recovery',
    sortValue: 80,
    checkFn(state) {
      // Are my trusted connections set up correctly?
      // TODO Not sure if this is the correct condition
      return state.user.backupCompleted;
    },
  },
  task9: {
    id: 'task9',
    title: 'Link an app',
    description: 'Link your brightID to an app context',
    sortValue: 90,
    checkFn(state) {
      // is there at least one app that is linked?
      const linkedApps = state.apps.apps.filter((app) => app.linked === true);
      return linkedApps.length > 0;
    },
  },
};
