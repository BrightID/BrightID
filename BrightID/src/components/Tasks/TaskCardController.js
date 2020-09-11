// @flow

import React from 'react';
import { useSelector } from 'react-redux';
import TaskCard from './TaskCard';
import { UserTasks } from './UserTasks';

/*
  Purpose: Setup required data for rendering TaskCard by
  combining static Task descriptions with current Task state from Redux
 */
type TaskCardControllerProps = {
  taskId: string,
};

function TaskCardController({ taskId }: TaskCardControllerProps) {
  const storeTask = useSelector((state: State) => state.tasks[taskId]);
  const extendedTask = {
    ...storeTask,
    ...UserTasks[taskId],
  };

  return (
    <TaskCard
      description={extendedTask.description}
      fulfilled={extendedTask.completed}
      id={extendedTask.id}
      title={extendedTask.title}
      url={extendedTask.url}
    />
  );
}

export default TaskCardController;
