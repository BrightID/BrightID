// @flow
/* eslint-disable */

import { AsyncStorage } from 'react-native';
import { sampleConnections } from '../../actions/setUpDefault';
import RNFetchBlob from 'rn-fetch-blob';

export const first = 1;

export const addSampleConnections = async () => {
  try {
    // save each connection with their public key as the async storage key
    // for (let index in sampleConnections) {
    //   let res = await RNFetchBlob.fetch(
    //     'GET',
    //     sampleConnections[index].avatar,
    //     {},
    //   );
    //   let status = res.info().status;
    //   if (status === 200) {
    //     sampleConnections[
    //       index
    //     ].avatar = `data:image/jpeg;base64,${res.base64()}`;
    //   } else {
    //     let res = await RNFetchBlob.fetch(
    //       'GET',
    //       sampleConnections[index].avatar,
    //       {},
    //     );
    //     let status = res.info().status;
    //     if (status === 200) {
    //       sampleConnections[
    //         index
    //       ].avatar = `data:image/jpeg;base64,${res.base64()}`;
    //     } else {
    //       let res = await RNFetchBlob.fetch(
    //         'GET',
    //         sampleConnections[index].avatar,
    //         {},
    //       );
    //       let status = res.info().status;
    //       if (status === 200) {
    //         sampleConnections[
    //           index
    //         ].avatar = `data:image/jpeg;base64,${res.base64()}`;
    //       }
    //     }
    //   }
    // }

    const arrayToSave = sampleConnections.map((val) => [
      JSON.stringify(val.publicKey),
      JSON.stringify(val),
    ]);

    await AsyncStorage.multiSet(arrayToSave);
  } catch (err) {
    console.log(err);
  }
};

/* eslint-disable */
