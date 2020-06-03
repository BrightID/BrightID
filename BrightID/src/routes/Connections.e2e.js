import * as React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';
import { DEVICE_TYPE } from '@/utils/constants';
import { createFakeConnection } from '@/components/Connections/models/createFakeConnection';
import { headerOptions } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions = {
  // coment out for test release
  headerRight: () => (
    <TouchableOpacity
      testID="createFakeConnectionBtn"
      style={{ marginRight: 11 }}
      onPress={createFakeConnection}
    >
      <Material name="dots-horizontal" size={32} color="#fff" />
    </TouchableOpacity>
  ),

  headerShown: true,
};

const Connections = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="Connections"
      component={ConnectionsScreen}
      options={connectionsScreenOptions}
    />
    <Stack.Screen
      name="SortingConnections"
      component={SortingConnectionsScreen}
    />
  </Stack.Navigator>
);

export default Connections;
