import React, { useContext } from 'react';
import { useDispatch, useSelector } from '@/store';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WHITE } from '@/theme/colors';
import { NodeApiContext } from '@/components/NodeApiGate';
import { confirmPendingConnectionThunk } from './actions/pendingConnectionThunks';
import {
  pendingConnection_states,
  selectPendingConnectionById,
  updatePendingConnection,
} from './pendingConnectionSlice';
import { ReconnectView } from './ReconnectView';
import { PreviewConnectionView } from './PreviewConnectionView';

type PreviewConnectionProps = {
  pendingConnectionId: string;
  moveToNext: () => void;
};

export const PreviewConnectionController = (props: PreviewConnectionProps) => {
  const { pendingConnectionId, moveToNext } = props;
  const dispatch = useDispatch();
  const api = useContext(NodeApiContext);
  const pendingConnection = useSelector((state: State) =>
    selectPendingConnectionById(state, pendingConnectionId),
  ) as PendingConnection;

  const navigation = useNavigation();

  if (!pendingConnection) {
    // pending connection has vanished. Most likely channel expired.
    // Just return null, parent components will take care of moving to a different screen.
    return null;
  }

  let isReconnect = !!pendingConnection.existingConnection;
  if (pendingConnection.state !== pendingConnection_states.UNCONFIRMED) {
    // Don't display reconnect screen for connections that have just been confirmed
    isReconnect = false;
  }

  const setLevelHandler = (level: ConnectionLevel) => {
    // navigates to next view in the viewpager
    moveToNext();
    // wait until after finishes navigation before dispatching confirm action
    InteractionManager.runAfterInteractions(() => {
      dispatch(confirmPendingConnectionThunk(pendingConnection.id, level, api));
    });
  };

  const abuseHandler = () => {
    if (isReconnect) {
      navigation.navigate('ReportReason', {
        connectionId: pendingConnection.existingConnection.id,
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
      {isReconnect ? (
        <ReconnectView
          pendingConnection={pendingConnection}
          existingConnection={pendingConnection.existingConnection}
          setLevelHandler={setLevelHandler}
          abuseHandler={abuseHandler}
        />
      ) : (
        <PreviewConnectionView
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
