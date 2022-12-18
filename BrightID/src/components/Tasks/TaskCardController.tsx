import React from 'react';
import { useDispatch, useSelector } from '@/store/hooks';
import TaskCard from './TaskCard';
import { UserTasks } from './UserTasks';
import { resetTask } from './TasksSlice';

/*
  Purpose: Setup required data for rendering TaskCard by
  combining static Task descriptions with current Task state from Redux
 */
type TaskCardControllerProps = {
  taskId: string;
};

function TaskCardController({ taskId }: TaskCardControllerProps) {
  const dispatch = useDispatch();
  const storeTask = useSelector((state) => state.tasks[taskId]);
  const combinedTask: CombinedTask = {
    ...storeTask,
    ...UserTasks[taskId],
  };

  const reset = () => {
    dispatch(resetTask(taskId));
  };

  return (
    <TaskCard
      description={combinedTask.description}
      fulfilled={combinedTask.completed}
      id={combinedTask.id}
      title={combinedTask.title}
      url={combinedTask.url}
      navigationTarget={combinedTask.navigationTarget}
      onClick={__DEV__ ? reset : null}
    />
  );
}

export default TaskCardController;
