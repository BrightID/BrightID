import { Alert } from 'react-native';
import i18next from 'i18next';
import { dangerouslyDeleteStorage } from '@/utils/dev';
import { resetOperations } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';

// happens inside of the loading screen

export const bootstrap = async () => {
  const {
    user: { id },
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
  } catch (err) {
    console.error(err);
  }
};
