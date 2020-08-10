// @flow

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ORANGE } from '@/utils/constants';
import { useSelector } from 'react-redux';
import TaskCardController from './TaskCardController';

export const TasksScreen = function () {
  const taskIds = useSelector((state: State) => {
    debugger;
    return Object.keys(state.tasks);
  });

  console.log(taskIds);

  const renderItem = ({ item }) => <TaskCardController taskId={item} />;

  return (
    <>
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="tasksScreen">
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
