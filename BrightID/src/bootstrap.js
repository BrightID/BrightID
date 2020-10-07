// @flow
import { bootstrapAndUpgrade } from './versions';
import { resetOperations } from './actions';
import { store } from './store';
import { checkTasks, syncStoreTasks } from './components/Tasks/TasksSlice';

// happens inside of the loading screen

export const bootstrap = async () => {
  try {
    let {
      user: { id },
    } = store.getState();
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

    // once everything is set up
    // this.props.navigation.navigate(publicKey ? 'App' : 'Onboarding');
  } catch (err) {
    console.log(err);
  }
};
