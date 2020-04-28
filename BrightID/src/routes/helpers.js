import * as React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export const icon = (active, passive) => ({ focused, color, size }) => (
  <MaterialCommunityIcons
    name={focused ? active : passive}
    size={size}
    color={color}
  />
);

const headerTitleStyle = {
  fontFamily: 'EurostileRegular',
  fontWeight: '200',
  fontSize: 24,
};

const headerBackground = () => (
  <LinearGradient
    colors={['#F52828', '#F76B1C']}
    style={{ flex: 1, width: '100%' }}
  />
);

export const headerOptions = () => ({
  headerTitleStyle,
  headerBackground,
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
});
