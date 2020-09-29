// @flow

import { Alert } from 'react-native';
import api from '@/api/brightId';
import { deleteConnection } from '@/actions';
import { fakeJoinGroups } from '@/actions/fakeGroup';
import { backupUser } from '@/components//Recovery/helpers';
import { connectWithOtherFakeConnections } from '@/actions/fakeContact';
import { defaultSort } from './sortingUtility';

const flagMap = ['duplicate', 'fake', 'deceased'];

export const handleFlagging = ({ name, id, dispatch, secretKey }) => (
  index,
) => {
  if (__DEV__) {
    switch (index) {
      case 3: {
        console.log('joining all groups');
        dispatch(fakeJoinGroups({ id, secretKey }));
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
    const { backupCompleted } = getState().user;
    console.log('backupCompleted', backupCompleted);

    await api.removeConnection(id, flag);
    // hide connection in redux
    dispatch(deleteConnection(id));
    dispatch(defaultSort());
    if (backupCompleted) {
      await backupUser();
    }
  } catch (err) {
    err instanceof Error ? console.warn(err.message) : console.log(err);
  }
};
