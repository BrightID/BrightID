// @flow

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import TaskCard from './TaskCard';
import { UserTasks } from './UserTasks';
import { resetTask } from './TasksSlice';

/*
  Purpose: Setup required data for rendering TaskCard by
  combining static Task descriptions with current Task state from Redux
 */
type TaskCardControllerProps = {
  taskId: string,
};

function TaskCardController({ taskId }: TaskCardControllerProps) {
  const dispatch = useDispatch();
  const storeTask = useSelector((state: State) => state.tasks[taskId]);
  const extendedTask = {
    ...storeTask,
    ...UserTasks[taskId],
  };

  const reset = () => {
    dispatch(resetTask(taskId));
  };

  return (
    <TaskCard
      description={extendedTask.description}
      fulfilled={extendedTask.completed}
      id={extendedTask.id}
      title={extendedTask.title}
      url={extendedTask.url}
      onClick={__DEV__ ? reset : null}
    />
  );
}

export default TaskCardController;
