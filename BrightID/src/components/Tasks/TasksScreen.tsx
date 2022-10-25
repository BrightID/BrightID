import React, { useCallback } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from '@/store/hooks';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/deviceConstants';
import { GREY, WHITE } from '@/theme/colors';
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
        backgroundColor: GREY,
      }}
    />
  );
};

export const TasksScreen = function () {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
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
        label={t('achievements.progress.title')}
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
    backgroundColor: WHITE,
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
