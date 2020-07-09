import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import ConnectionsScreen from '@/components/Connections/ConnectionsScreen';
import SortingConnectionsScreen from '@/components/Connections/SortingConnectionsScreen';
import SearchConnections from '@/components/Helpers/SearchConnections';
import { DEVICE_IOS } from '@/utils/constants';
import { createFakeConnection } from '@/components/Connections/models/createFakeConnection';
import { navigate } from '@/NavigationService';
import backArrow from '@/static/back_arrow.svg';
import { SvgXml } from 'react-native-svg';
import { store } from '@/store';
import { useSelector } from 'react-redux';
import { headerOptions, headerTitleStyle } from './helpers';

const Stack = createStackNavigator();

const HeaderTitle = () => {
  const searchOpen = useSelector((state) => state.connections.searchOpen);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: searchOpen ? 0 : 1,
      useNativeDriver: true,
      duration: 600,
    }).start();
  }, [fadeAnim, searchOpen]);
  console.log('renderingTitle');
  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <Text style={headerTitleStyle}>Connections</Text>
    </Animated.View>
  );
};

const connectionsScreenOptions = {
  ...headerOptions,
  headerRight: () => <SearchConnections sortable={true} />,
  headerLeft: () => (
    <TouchableOpacity
      testID="connections-header-back"
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
      }}
      onPress={() => {
        navigate('Home');
      }}
    >
      <SvgXml height="20" xml={backArrow} />
    </TouchableOpacity>
  ),
  headerTitle: () => <HeaderTitle />,
  headerTitleAlign: 'left',
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
    </>
  );
};

export default Connections;
