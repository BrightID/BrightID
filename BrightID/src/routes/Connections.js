import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';

const Stack = createStackNavigator();

const Connections = () => (
  <Stack.Navigator>
    <Stack.Screen name="Connections" component={ConnectionsScreen} />
    <Stack.Screen
      name="SortingConnections"
      component={SortingConnectionsScreen}
    />
  </Stack.Navigator>
);

export default Connections;
