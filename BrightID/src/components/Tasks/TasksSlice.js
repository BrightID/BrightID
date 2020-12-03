// @flow

import { setActiveNotification } from '@/actions';
import { MISC_TYPE } from '@/utils/constants';
import { createSlice, createSelector } from '@reduxjs/toolkit';
import certificate from '@/static/certificate.svg';
import i18next from 'i18next';
import { UserTasks } from './UserTasks';

/*
  Reducer tracking tasks completion. Stores taskID, completion status and timestamp of completion.

  The actual task definitions (id, title, description and validation method) are located in
  file UserTasks.js. At app startup (bootstrap.js) the ids of new tasks are loaded from
  UserTasks.js and added to the redux store.

  Example for two tasks:
   - task with ID 'taskID1' that has been completed on August 10th (timestamp 1597064209249)
   - task with ID 'taskID2' is not yet completed

  state = {
    'taskID1': {
      id: 'taskID1',
      completed: true,
      timestamp: 1597064209249
    }
    'taskID2': {
      id: 'taskID2',
      completed: false,
      timestamp: 0,
    }
  }

 */

const initialState: TasksState = {};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    addTask(state, action) {
      const taskId = action.payload;
      // only add tasks that are not yet known
      if (!(taskId in state)) {
        state[taskId] = {
          id: taskId,
          completed: false,
          timestamp: 0,
        };
      }
    },
    removeTask(state, action) {
      const taskId = action.payload;
      if (taskId in state) {
        delete state[taskId];
      }
    },
    resetTask(state, action) {
      const taskId = action.payload;
      if (taskId in state) {
        state[taskId].completed = false;
        state[taskId].timestamp = 0;
      }
    },
    completeTask(state, action) {
      const taskId = action.payload;
      let task = state[taskId];
      if (task) {
        task.completed = true;
        task.timestamp = Date.now();
      } else {
        console.log(`completeTask() called for unknown task ${taskId}`);
      }
    },
  },
  extraReducers: {
    RESET_STORE: (state, action) => {
      for (const task of Object.values(state)) {
        task.completed = false;
        task.timestamp = 0;
      }
    },
  },
});

export const {
  addTask,
  removeTask,
  completeTask,
  resetTask,
} = tasksSlice.actions;

// UserTasks.js may have tasks added or removed with an app update. This action takes care
// that the persisted store always is up to date with the available tasks.
export const syncStoreTasks = () => {
  return (dispatch: dispatch, getState: getState) => {
    const userTaskIds = Object.keys(UserTasks);
    const storeTaskIds = Object.keys(getState().tasks);
    const idsToRemove = storeTaskIds.filter((id) => !userTaskIds.includes(id));
    const idsToAdd = userTaskIds.filter((id) => !storeTaskIds.includes(id));
    for (const id of idsToRemove) {
      console.log(`Removing task ${id} from store`);
      if (id !== '_persist') {
        dispatch(removeTask(id));
      }
    }
    for (const id of idsToAdd) {
      console.log(`Adding task ${id} to store`);
      dispatch(addTask(id));
    }
  };
};

export const checkTasks = () => {
  return (dispatch: dispatch, getState: getState) => {
    const state = getState();
    // get pending tasks
    const pendingTasks = Object.values(state.tasks).filter(
      (task: TasksStateEntry) => task.completed === false,
    );
    // for each pending task call checkFn and dispatch completeTask() on success.
    for (const task of pendingTasks) {
      try {
        if (UserTasks[task.id].checkFn(state)) {
          const title = i18next.t(`achievements.${task.id}.title`);
          console.log(`Task '${title}' completed."`);
          dispatch(completeTask(task.id));
          dispatch(
            setActiveNotification({
              type: MISC_TYPE,
              title: i18next.t('achievements.notification.title'),
              message: i18next.t('achievements.notification.message', {
                title,
              }),
              navigationTarget: null,
              xmlIcon: certificate,
            }),
          );
        }
      } catch (err) {
        console.log(`Error while checking task ${task.id}: ${err.message}`);
      }
    }
  };
};

export default tasksSlice.reducer;

export const selectTaskIds = createSelector(
  (state) => state.tasks,
  (tasks) => {
    return Object.keys(tasks)
      .filter((id) => id !== '_persist')
      .sort((a, b) => UserTasks[a].sortValue - UserTasks[b].sortValue);
  },
);

export const selectCompletedTaskIds = createSelector(
  selectTaskIds,
  (state) => state.tasks,
  (taskIds, tasks) =>
    taskIds.filter((taskId: string) => tasks[taskId].completed),
);
