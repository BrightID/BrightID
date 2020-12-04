// @flow
import { Alert } from 'react-native';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dangerouslyDeleteStorage } from '@/utils/dev';
import { resetOperations } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';

// happens inside of the loading screen

export const bootstrap = async () => {
  let {
    user: { id, migrated },
  } = store.getState();

  // reset operations
  store.dispatch(resetOperations());
  // update available usertasks
  store.dispatch(syncStoreTasks());
  // Initial check for completed tasks
  store.dispatch(checkTasks());

  try {
    // delete all storage if brightid is empty
    if (id === 'empty') {
      await dangerouslyDeleteStorage();
      Alert.alert(
        i18next.t('common.alert.title.lostKeys'),
        i18next.t('common.alert.text.lostKeys'),
      );
      throw new Error('id is empty');
    }

    // delete old async storage is storage is successfully migrated
    if (!migrated) {
      AsyncStorage.getItem('persist:root').then((data) => {
        if (data) {
          AsyncStorage.removeItem('persist:root').catch((err) => {
            console.log(err.message);
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
  }
};
