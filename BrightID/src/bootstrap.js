// @flow
import { Alert } from 'react-native';
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
        `We've lost the BrightID keypair from the device`,
        `Please create a new BrightID or try recovering your previous BrightID`,
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
