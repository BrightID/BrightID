// @flow
import { AsyncStorage } from 'react-native';
import { setConnections } from './index';
import { defaultSort } from '../components/Connections/sortingUtility';

export const getConnections = () => async (dispatch: () => null) => {
  try {
    /**
     * obtain connection keys from async storage
     * currently everything in async storage except for `userData` is a connection
     *
     * THIS MIGHT CHANGE WHEN GROUPS ARE ADDED
     */

    const allKeys = await AsyncStorage.getAllKeys();
    const connectionKeys = allKeys.filter((val) => val !== 'userData');
    const storageValues = await AsyncStorage.multiGet(connectionKeys);
    const connections = storageValues.map((val) => JSON.parse(val[1]));
    // update redux store
    dispatch(setConnections(connections));
    // sort connections
    dispatch(defaultSort());
  } catch (err) {
    console.log(err);
  }
};
