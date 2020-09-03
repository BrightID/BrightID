// @flow
import { fetchApps } from '@/actions/apps';
import { bootstrapAndUpgrade } from './versions';
import { resetOperations } from './actions';
import { store } from './store';

// happens inside of the loading screen

export const bootstrap = async () => {
  try {
    let {
      user: { publicKey },
    } = store.getState();
    // load redux store from async storage and upgrade async storage is necessary
    if (!publicKey) await bootstrapAndUpgrade();
    // reset operations
    store.dispatch(resetOperations());
    // fetch user info
    if (!publicKey) {
      publicKey = store.getState().user.publicKey;
      console.log('secondBootstrap', publicKey);
    }
    store.dispatch(fetchApps());
    // once everything is set up
    // this.props.navigation.navigate(publicKey ? 'App' : 'Onboarding');
  } catch (err) {
    console.log(err);
  }
};
