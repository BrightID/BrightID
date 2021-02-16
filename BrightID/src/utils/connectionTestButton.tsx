import React from 'react';
import { TouchableOpacity } from 'react-native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch } from 'react-redux';
import { BLUE, WHITE } from '@/theme/colors';
import {
  connectWithOtherFakeConnections,
  joinAllGroups,
  reconnectFakeConnection,
} from '../actions/fakeContact';

/*
Return a button that opens actionsheet with test methods
 */
const btnOptions = [
  'Accept all group invites',
  'Connect with all other fake connections',
  'Reconnect with changed profile',
  'Reconnect with identical profile',
  'cancel',
];

const ConnectionTestButton = ({ connectionId }: { connectionId: string }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const dispatch = useDispatch();

  const performAction = (index: number) => {
    switch (index) {
      case 0:
        console.log(`Joining all groups`);
        dispatch(joinAllGroups(connectionId));
        break;
      case 1:
        console.log(`Connecting to other fake connections`);
        dispatch(connectWithOtherFakeConnections(connectionId));
        break;
      case 2:
        console.log(`Reconnecting with different profile`);
        dispatch(reconnectFakeConnection(connectionId, true));
        break;
      case 3:
        console.log(`Reconnecting with same profile`);
        dispatch(reconnectFakeConnection(connectionId, false));
        break;
      case 4:
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
