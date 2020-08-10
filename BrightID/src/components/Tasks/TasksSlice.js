// @flow

import { createSlice } from '@reduxjs/toolkit';

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
});

export const { addTask, completeTask } = tasksSlice.actions;

export default tasksSlice.reducer;
