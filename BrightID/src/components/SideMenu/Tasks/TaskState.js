// @flow

import React from 'react';
import IonIcons from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE } from '@/utils/constants';

type TaskStateProps = {
  complete: boolean,
};

export const TaskState = ({ complete }: TaskStateProps) => {
  return (
    <IonIcons
      style={{ alignSelf: 'center' }}
      size={DEVICE_LARGE ? 48 : 42}
      name={complete ? 'checkmark-circle-outline' : 'radio-button-off-outline'}
      color={complete ? '#5DEC9A' : '#707070'}
    />
  );
};
