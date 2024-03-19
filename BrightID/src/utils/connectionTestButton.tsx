import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch } from '@/store/hooks';
import { BLUE, WHITE } from '@/theme/colors';
import { NodeApiContext } from '@/components/NodeApiGate';
import {
  connectWithOtherFakeConnections,
  joinAllGroups,
  reconnectFakeConnection,
} from '../actions/fakeContact';
import { connection_levels } from '@/utils/constants';
import { getConnectionLevelString } from '@/utils/connectionLevelStrings';

/*
Return a button that opens actionsheet with test methods
 */
const btnOptions = [
  'Accept all group invites',
  'Reconnect with changed profile',
  'Reconnect with identical profile',
  `Connect with all other fake connections - ${getConnectionLevelString(
    connection_levels.JUST_MET,
  )}`,
  `Connect with all other fake connections - ${getConnectionLevelString(
    connection_levels.ALREADY_KNOWN,
  )}`,
  `Connect with all other fake connections - ${getConnectionLevelString(
    connection_levels.RECOVERY,
  )}`,
  'cancel',
];

const ConnectionTestButton = ({ connectionId }: { connectionId: string }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const dispatch = useDispatch();
  const api = useContext(NodeApiContext);

  const performAction = (index: number) => {
    switch (index) {
      case 0:
        console.log(`Joining all groups`);
        dispatch(joinAllGroups(connectionId, api));
        break;
      case 1:
        console.log(`Reconnecting with different profile`);
        dispatch(reconnectFakeConnection(connectionId, true));
        break;
      case 2:
        console.log(`Reconnecting with same profile`);
        dispatch(reconnectFakeConnection(connectionId, false));
        break;
      case 3:
        console.log(`Connecting to other fake connections - JUST MET`);
        dispatch(
          connectWithOtherFakeConnections(
            connectionId,
            api,
            connection_levels.JUST_MET,
          ),
        );
        break;
      case 4:
        console.log(`Connecting to other fake connections - ALREADY KNOWN`);
        dispatch(
          connectWithOtherFakeConnections(
            connectionId,
            api,
            connection_levels.ALREADY_KNOWN,
          ),
        );
        break;
      case 5:
        console.log(`Connecting to other fake connections - RECOVERY`);
        dispatch(
          connectWithOtherFakeConnections(
            connectionId,
            api,
            connection_levels.RECOVERY,
          ),
        );
        break;
      case 6:
        console.log(`Cancelled`);
        break;
      default:
        console.log(`Unhandled action index ${index}`);
    }
  };

  const handleButton = () => {
    showActionSheetWithOptions(
      {
        options: btnOptions,
        cancelButtonIndex: btnOptions.length - 1,
        title: `Connection Test options`,
        showSeparators: true,
        textStyle: {
          color: BLUE,
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          textAlign: 'center',
          width: '100%',
        },
      },
      performAction,
    );
  };

  return (
    <TouchableOpacity
      testID="connectionTestBtn"
      style={{ marginRight: 11 }}
      onPress={handleButton}
    >
      <Material name="ghost" size={30} color={WHITE} />
    </TouchableOpacity>
  );
};

export default ConnectionTestButton;
