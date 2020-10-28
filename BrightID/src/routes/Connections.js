import React, { useEffect, useRef } from 'react';
import { Animated, Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import TrustedConnectionsScreen from '@/components/Recovery/TrustedConnectionsScreen';
import { useSelector } from 'react-redux';
import { headerOptions, headerTitleStyle, NavHome } from './helpers';

const Stack = createStackNavigator();

const HeaderTitle = ({ title }) => {
  const searchOpen = useSelector((state) => state.connections.searchOpen);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searchOpen ? 0 : 1,
      useNativeDriver: true,
      duration: 600,
    }).start();
  }, [fadeAnim, searchOpen]);

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={headerTitleStyle}>{title}</Text>
    </Animated.View>
  );
};

const connectionsScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerLeft: () => <NavHome />,
  headerTitle: () => <HeaderTitle title="Connections" />,
};

const trustedScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerTitle: () => <HeaderTitle title="Trusted Connections" />,
};

const Connections = () => {
  return (
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
      <Stack.Screen
        name="TrustedConnections"
        component={TrustedConnectionsScreen}
        options={trustedScreenOptions}
      />
    </>
  );
};

export default Connections;
