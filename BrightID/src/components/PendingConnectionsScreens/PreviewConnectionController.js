// @flow

import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WHITE } from '@/theme/colors';
import { confirmPendingConnectionThunk } from './actions/pendingConnectionThunks';
import {
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from './pendingConnectionSlice';
import { ReconnectView } from './ReconnectView';
import { PreviewConnectionView } from './PreviewConnectionView';

const selectAllConnections = (state) => state.connections.connections;

const makeConnectionByBrightIDSelector = () =>
  createSelector(
    selectAllConnections,
    (_, brightID: string) => brightID,
    (allConnections, brightID) => {
      if (brightID) {
        // console.log(`Looking for connection ${brightID}`);
        return allConnections.find((conn) => conn.id === brightID);
      } else {
        return undefined;
      }
    },
  );

type PreviewConnectionProps = {
  pendingConnectionId: any,
  ratingHandler: (...args: Array<any>) => any,
  index: number,
};

export const PreviewConnectionController = (props: PreviewConnectionProps) => {
  const { pendingConnectionId, moveToNext, index } = props;
  const dispatch = useDispatch();

  const pendingConnection = useSelector((state) =>
    selectPendingConnectionById(state, pendingConnectionId),
  );

  // Make sure each instance of PreviewConnectionController has it's own selector. Otherwise they would
  // invalidate each others cache. See https://react-redux.js.org/next/api/hooks#using-memoizing-selectors
  const selectConnectionByBrightID = useMemo(
    makeConnectionByBrightIDSelector,
    [],
  );

  let existingConnection = useSelector((state) =>
    selectConnectionByBrightID(state, pendingConnection?.brightId),
  );

  const navigation = useNavigation();

  if (!pendingConnection) {
    // pending connection has vanished. Most likely channel expired.
    // Just return null, parent components will take care of moving to a different screen.
    return null;
  }

  if (pendingConnection.state !== pendingConnection_states.UNCONFIRMED) {
    // Don't display reconnect screen for connections that have just been confirmed
    existingConnection = undefined;
  }

  const setLevelHandler = (level: ConnectionLevel) => {
    // navigates to next view in the viewpager
    moveToNext();
    // wait until after finishes navigation before dispatching confirm action
    InteractionManager.runAfterInteractions(() => {
      dispatch(confirmPendingConnectionThunk(pendingConnection.id, level));
    });
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

  console.log(`rendering ${pendingConnection.name}`);

  return (
    <View style={styles.previewContainer}>
      {existingConnection ? (
        <ReconnectView
          pendingConnection={pendingConnection}
          existingConnection={existingConnection}
          setLevelHandler={setLevelHandler}
          abuseHandler={abuseHandler}
        />
      ) : (
        <PreviewConnectionView
          index={index}
          pendingConnection={pendingConnection}
          setLevelHandler={setLevelHandler}
          photoTouchHandler={photoTouchHandler}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  previewContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    paddingVertical: 10,
  },
});
