// @flow

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ORANGE } from '@/utils/constants';
import { useSelector } from 'react-redux';
import TaskCardController from './TaskCardController';
import { UserTasks } from './UserTasks';
import { TasksProgress } from './TasksProgress';

export const TasksScreen = function () {
  const taskIds = useSelector((state: State) =>
    Object.keys(state.tasks).sort(
      (a, b) => UserTasks[a].sortValue - UserTasks[b].sortValue,
    ),
  );
  const completedTaskIds = useSelector((state: State) => {
    return taskIds.filter((taskId: string) => state.tasks[taskId].completed);
  });

  const renderItem = ({ item }) => <TaskCardController taskId={item} />;

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="tasksScreen">
        <TasksProgress
          currentSteps={completedTaskIds.length}
          totalSteps={taskIds.length}
          label="Completion: "
        />
        <FlatList
          data={taskIds}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          renderItem={renderItem}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: 70,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 10,
    overflow: 'hidden',
  },
});

export default TasksScreen;
