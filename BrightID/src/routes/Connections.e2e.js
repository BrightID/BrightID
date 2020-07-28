import * as React from 'react';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';
import SearchConnections from '@/components/Connections/SearchConnections';
import { store } from '@/store';
import { headerOptions, NavHome } from './helpers';

const Stack = createStackNavigator();

const connectionsScreenOptions = {
  ...headerOptions,
  headerLeft: () => <NavHome />,
  headerTitle: () => {
    const { connections } = store.getState().connections;
    return connections.length ? (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <SearchConnections sortable={true} />
      </View>
    ) : null;
  },
};

const Connections = () => (
  <>
    <Stack.Screen
      name="Connections"
      component={ConnectionsScreen}
      options={connectionsScreenOptions}
    />
    <Stack.Screen
      name="SortingConnections"
      component={SortingConnectionsScreen}
      options={headerOptions}
    />
  </>
);

export default Connections;
