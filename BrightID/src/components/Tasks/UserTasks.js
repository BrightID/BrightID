/*
Task ideas:

create your brightid
Add a picture
Make your first connection
Make your second connection
Join a group
get verified
create a group (and successfully invite founders)
Make your third connection
Setup trusted connections
Link an app
 */

export const UserTasks = {
  task1: {
    id: 'task1',
    title: 'Create your BrightID',
    description: 'Complete the Signup process',
    checkFn(state) {
      // TODO: Derive task fulfillment state from app state
      return false;
    },
  },
  task2: {
    id: 'task2',
    title: 'Add a picture',
    description: 'Add a picture to your BrightID',
    checkFn(state) {
      // TODO: Derive task fulfillment state from app state
      return false;
    },
  },
  task3: {
    id: 'task3',
    title: 'Make your first connection',
    description: 'Create one confirmed connection',
    checkFn(state) {
      // TODO: Derive task fulfillment state from app state
      return false;
    },
  },
};
