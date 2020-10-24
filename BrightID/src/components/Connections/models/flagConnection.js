// @flow

import { Alert } from 'react-native';
import api from '@/api/brightId';
import { deleteConnection } from '@/actions';
import { backupUser } from '@/components//Recovery/helpers';
import {
  connectWithOtherFakeConnections,
  joinAllGroups,
} from '@/actions/fakeContact';
import { connection_levels } from '../../../utils/constants';
import { defaultSort } from './sortingUtility';

const flagMap = ['duplicate', 'fake', 'deceased'];

export const handleFlagging = ({ name, id, dispatch, callback }) => (index) => {
  if (__DEV__) {
    switch (index) {
      case 3: {
        console.log('joining all groups');
        dispatch(joinAllGroups(id));
        return;
      }
      case 4: {
        console.log('connecting fake connections');
        dispatch(connectWithOtherFakeConnections(id));
        return;
      }
    }
  }

  // sanity check
  if (index > 2) {
    console.log(`Unhandled flag index ${index}!`);
    return;
  }

  const flag = flagMap[index];
  const buttons = [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    {
      text: 'OK',
      onPress: () => {
        dispatch(flagConnection(id, flag));
        if (callback) {
          callback();
        }
      },
    },
  ];
  Alert.alert(
    'Flag and Delete Connection',
    `Are you sure you want to flag ${name} as ${flag}?`,
    buttons,
    { cancelable: true },
  );
};

export const flagConnection = (id, flag) => async (dispatch, getState) => {
  try {
    const {
      user: { id: brightId, backupCompleted },
    } = getState();
    console.log('backupCompleted', backupCompleted);

    // Change connection to SPAM level
    await api.addConnection(
      brightId,
      id,
      connection_levels.SPAM,
      flag,
      Date.now(),
    );
    // remove connection from local storage
    dispatch(deleteConnection(id));
    dispatch(defaultSort());
    if (backupCompleted) {
      await backupUser();
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
