// @flow
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { dangerouslyDeleteStorage } from '@/utils/dev';
import { bootstrapAndUpgrade } from './versions';
import { resetOperations, setAppVersion } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';
import codePush from 'react-native-code-push';

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
    }

    // update available usertasks
    store.dispatch(syncStoreTasks());
    // Initial check for completed tasks
    store.dispatch(checkTasks());
    // check for codepush version and update the app's local version
    codePush
      .getUpdateMetadata(codePush.UpdateState.RUNNING)
      .then((metaData) => {
        console.log('updateMetaData', metaData);
        if (metaData.label && metaData.appVersion)
          store.dispatch(setAppVersion(metaData.appVersion, metaData.label));
      });

    // delete old async storage is storage is successfully migrated
    if (!migrated) {
      await AsyncStorage.removeItem('persist:root');
    }
  } catch (err) {
    console.error(err);
  }
};
