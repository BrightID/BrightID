// @flow
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { dangerouslyDeleteStorage } from '@/utils/dev';
import { bootstrapAndUpgrade } from './versions';
import { resetOperations } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';

// happens inside of the loading screen

export const bootstrap = async () => {
  let {
    user: { id, migrated },
  } = store.getState();

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
      await AsyncStorage.removeItem('persist:root');
    }
    // load redux store from async storage and upgrade async storage is necessary
    if (!id) await bootstrapAndUpgrade();
    // reset operations
    store.dispatch(resetOperations());
    // fetch user info
    if (!id) {
      id = store.getState().user.id;
      console.log('secondBootstrap', id);
    }

    // update available usertasks
    store.dispatch(syncStoreTasks());
    // Initial check for completed tasks
    store.dispatch(checkTasks());
  } catch (err) {
    console.error(err);
  }
};
