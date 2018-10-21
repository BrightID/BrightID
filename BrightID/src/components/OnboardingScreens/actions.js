// @flow

import { AsyncStorage } from 'react-native';
import { sampleConnections } from '../../actions/setUpDefault';

export const first = 1;

export const addSampleConnections = async () => {
  try {
    // save each connection with their public key as the async storage key
    const arrayToSave = sampleConnections.map((val) => [
      JSON.stringify(val.publicKey),
      JSON.stringify(val),
    ]);
    await AsyncStorage.multiSet(arrayToSave);
  } catch (err) {
    console.log(err);
  }
};
