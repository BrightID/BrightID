// @flow
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dangerouslyDeleteStorage } from '@/utils/dev';
import { bootstrapAndUpgrade } from './versions';
import { resetOperations } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';
// import { fakeData } from './fakeData';

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

    // fake data

    // store.dispatch(
    //   setConnections(
    //     fakeData.map((data) => {
    //       data.status = 'verified';
    //       data.verifications = [data.verifications.list, 'BrightID'];
    //       return data;
    //     }),
    //   ),
    // );

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
