// @flow

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ORANGE } from '@/utils/constants';
import { useSelector } from 'react-redux';
import TaskCardController from './TaskCardController';
import { TasksProgress } from './TasksProgress';
import { selectTaskIds, selectCompletedTaskIds } from './TasksSlice';

const FlatListItemSeparator = () => {
  return (
    <View
      style={{
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#C4C4C4',
      }}
    />
  );
};

export const TasksScreen = function () {
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);

  const renderItem = ({ item }) => <TaskCardController taskId={item} />;

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="tasksScreen">
        <TasksProgress
          currentSteps={completedTaskIds.length}
          totalSteps={taskIds.length}
          label="Completion:"
        />
        <FlatList
          data={taskIds}
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={FlatListItemSeparator}
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
    paddingLeft: 42,
    paddingRight: 18,
  },
});

export default TasksScreen;
