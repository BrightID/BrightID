// @flow

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { DARK_GREY } from '@/utils/colors';
import {
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from './pendingConnectionSlice';
import { ReconnectView } from './ReconnectView';
import { PreviewConnectionView } from './PreviewConnectionView';
import BackArrow from '../Icons/BackArrow';

type PreviewConnectionProps = {
  pendingConnectionId: any,
  ratingHandler: (...args: Array<any>) => any,
  index: number,
};

export const PreviewConnectionController = (props: PreviewConnectionProps) => {
  const { pendingConnectionId, ratingHandler, index } = props;
  const dispatch = useDispatch();

  const pendingConnection = useSelector(
    (state) =>
      selectPendingConnectionById(state, pendingConnectionId) ?? {
        state: pendingConnection_states.EXPIRED,
      },
    (a, b) => a?.state === b?.state,
  );

  const existingConnection = useSelector((state) => {
    if (pendingConnection.state === pendingConnection_states.UNCONFIRMED) {
      return state.connections.connections.find(
        (conn) => conn.id === pendingConnection.brightId,
      );
    } else {
      return undefined;
    }
  });

  const navigation = useNavigation();

  const brightidVerified = pendingConnection.verifications?.includes(
    'BrightID',
  );

  const setLevelHandler = (level: ConnectionLevel) => {
    ratingHandler(pendingConnection.id, level, index);
  };

  const abuseHandler = () => {
    if (existingConnection) {
      navigation.navigate('ReportReason', {
        connectionId: existingConnection.id,
        successCallback: () => {
          // Set pending connection to "CONFIRMED" to indicate it has been handled by the user
          dispatch(
            updatePendingConnection({
              id: pendingConnection.id,
              changes: {
                state: pendingConnection_states.CONFIRMED,
              },
            }),
          );
        },
      });
    }
  };

  const photoTouchHandler = () => {
    navigation.navigate('FullScreenPhoto', {
      photo: pendingConnection.photo,
      base64: true,
    });
  };

  return (
    <View style={styles.previewContainer}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <BackArrow height={DEVICE_LARGE ? '22' : '20'} color={DARK_GREY} />
      </TouchableOpacity>
      {existingConnection ? (
        <ReconnectView
          pendingConnection={pendingConnection}
          existingConnection={existingConnection}
          brightIdVerified={brightidVerified}
          setLevelHandler={setLevelHandler}
          abuseHandler={abuseHandler}
        />
      ) : (
        <PreviewConnectionView
          index={index}
          pendingConnection={pendingConnection}
          brightIdVerified={brightidVerified}
          setLevelHandler={setLevelHandler}
          photoTouchHandler={photoTouchHandler}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: 10,
  },
  cancelButton: {
    position: 'absolute',
    left: -10,
    top: DEVICE_LARGE ? 20 : 12,
    zIndex: 20,
    width: DEVICE_LARGE ? 60 : 50,
    alignItems: 'center',
  },
});
