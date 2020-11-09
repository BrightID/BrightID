// @flow

import React, { useCallback, useState } from 'react';
import { Text } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { handleFlagging } from './models/flagConnection';
import { fetchConnectionInfo } from '../../utils/fetchConnectionInfo';
import ConnectionScreen from './ConnectionScreen';

type ConnectionScreenProps = {
  route: any,
  navigation: any,
};

function ConnectionScreenController(props: ConnectionScreenProps) {
  const { route, navigation } = props;
  const { connectionId } = route.params;
  const { showActionSheetWithOptions } = useActionSheet();
  const dispatch = useDispatch();
  const connection: connection = useSelector((state: State) =>
    state.connections.connections.find((conn) => conn.id === connectionId),
  );
  const myConnections = useSelector((state) => state.connections.connections);
  const myGroups = useSelector((state) => state.groups.groups);
  const [mutualGroups, setMutualGroups] = useState<Array<group>>([]);
  const [mutualConnections, setMutualConnections] = useState<Array<connection>>(
    [],
  );
  const [verifications, setVerifications] = useState<Array<string>>([]);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async (connectionId) => {
        console.log(`fetching connection info for ${connectionId}`);
        const connectionData = await fetchConnectionInfo({
          brightId: connectionId,
          myConnections,
          myGroups,
        });
        setMutualGroups(connectionData.mutualGroups);
        setMutualConnections(connectionData.mutualConnections);
        setVerifications(connectionData.verifications);
      };
      if (connection) {
        fetchData(connection.id);
      } else {
        setMutualGroups([]);
        setMutualConnections([]);
        setVerifications([]);
      }
    }, [connection, myConnections, myGroups]),
  );

  if (!connection) {
    // connection not there anymore.
    return <Text>connection vanished.</Text>;
  }

  const brightIdVerified = verifications.includes('BrightID');

  let flaggingOptions = [
    'Flag as Spammer',
    'Flag as Duplicate',
    'Flag as Fake',
    'Flag as Deceased',
    'Join All Groups',
    'Connect to other fake connections',
    'Reconnect - changed profile',
    'Reconnect - identical profile',
    'cancel',
  ];
  if (!__DEV__) {
    // remove debug functionality
    flaggingOptions.splice(4, 4);
  }

  const handleFlagBtnClick = () => {
    showActionSheetWithOptions(
      {
        options: flaggingOptions,
        cancelButtonIndex: flaggingOptions.length - 1,
        title: 'What do you want to do?',
        message: `Flagging ${connection.name} will negatively effect their BrightID score, and this flag might be shown to other users.`,
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          fontSize: DEVICE_LARGE ? 20 : 17,
        },
        messageTextStyle: {
          fontSize: DEVICE_LARGE ? 15 : 12,
        },
      },
      handleFlagging({
        id: connection.id,
        name: connection.name,
        dispatch,
        secretKey: connection.secretKey,
        callback: () => navigation.goBack(),
      }),
    );
  };

  return (
    <ConnectionScreen
      navigation={navigation}
      brightIdVerified={brightIdVerified}
      connection={connection}
      mutualConnections={mutualConnections}
      mutualGroups={mutualGroups}
      handleFlagBtn={handleFlagBtnClick}
    />
  );
}

export default ConnectionScreenController;
