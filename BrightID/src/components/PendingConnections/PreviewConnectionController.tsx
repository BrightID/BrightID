import React, { useContext } from 'react';
import { InteractionManager, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from '@/store/hooks';
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
import { connection_levels, report_sources } from '@/utils/constants';

type PreviewConnectionProps = {
  pendingConnectionId: string;
  moveToNext: () => void;
};

export const PreviewConnectionController = (props: PreviewConnectionProps) => {
  const { pendingConnectionId, moveToNext } = props;
  const dispatch = useDispatch();
  const api = useContext(NodeApiContext);
  const pendingConnection = useSelector((state) =>
    selectPendingConnectionById(state, pendingConnectionId),
  ) as PendingConnection;

  const navigation = useNavigation();

  if (!pendingConnection) {
    // pending connection has vanished. Most likely channel expired.
    // Just return null, parent components will take care of moving to a different screen.
    return null;
  }

  let isReconnect =
    !!pendingConnection.pendingConnectionData.existingConnection;
  if (pendingConnection.state !== pendingConnection_states.UNCONFIRMED) {
    // Don't display reconnect screen for connections that have just been confirmed
    isReconnect = false;
  }

  const setLevelHandler = (level: ConnectionLevel) => {
    // navigates to next view in the viewpager
    moveToNext();
    // wait until after finishes navigation before dispatching confirm action
    InteractionManager.runAfterInteractions(() => {
      dispatch(
        confirmPendingConnectionThunk(pendingConnection.profileId, level, api),
      );
    });
  };

  const abuseHandler = async () => {
    const { sharedProfile } = pendingConnection.pendingConnectionData;
    navigation.navigate('ReportReason', {
      connectionId: sharedProfile.id,
      connectionName: sharedProfile.name,
      reporting: true,
      source: isReconnect ? report_sources.RECONNECT : report_sources.PREVIEW,
      successCallback: (reason) => {
        dispatch(
          confirmPendingConnectionThunk(
            pendingConnection.profileId,
            connection_levels.REPORTED,
            api,
            reason,
          ),
        );
      },
    });
  };

  const photoTouchHandler = () => {
    navigation.navigate('FullScreenPhoto', {
      photo: pendingConnection.pendingConnectionData.sharedProfile.photo,
      base64: true,
    });
  };

  console.log(
    `rendering ${pendingConnection.pendingConnectionData.sharedProfile.name}`,
  );
  return (
    <View style={styles.previewContainer}>
      {isReconnect ? (
        <ReconnectView
          pendingConnection={pendingConnection}
          existingConnection={
            pendingConnection.pendingConnectionData.existingConnection
          }
          setLevelHandler={setLevelHandler}
          abuseHandler={abuseHandler}
        />
      ) : (
        <PreviewConnectionView
          pendingConnection={pendingConnection}
          setLevelHandler={setLevelHandler}
          photoTouchHandler={photoTouchHandler}
          abuseHandler={abuseHandler}
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
