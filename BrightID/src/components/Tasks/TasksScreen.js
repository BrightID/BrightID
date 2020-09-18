// @flow

import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { DEVICE_LARGE } from '@/utils/constants';
import TaskCardController from './TaskCardController';
import { TasksProgress } from './TasksProgress';
import {
  selectTaskIds,
  selectCompletedTaskIds,
  checkTasks,
} from './TasksSlice';

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
  const dispatch = useDispatch();
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);
  const headerHeight = useHeaderHeight();
  const isDrawerOpen = useIsDrawerOpen();

  const refreshTasks = useCallback(() => {
    dispatch(checkTasks());
  }, [dispatch]);

  useFocusEffect(refreshTasks);

  const renderItem = ({ item }) => <TaskCardController taskId={item} />;

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="tasksScreen"
    >
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
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={refreshTasks} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingLeft: 42,
    paddingRight: 18,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
});

export default TasksScreen;
