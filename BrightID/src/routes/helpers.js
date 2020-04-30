import * as React from 'react';
import { Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

export const Icon = (active, passive) => ({ focused, color, size }) => (
  <MaterialCommunityIcons
    name={focused ? active : passive}
    size={size}
    color={color}
  />
);

export const IconWithBadge = (active, passive, badgeCount) => ({
  focused,
  color,
  size,
}) => {
  return (
    <View style={{ width: 24, height: 24, margin: 5 }}>
      <MaterialCommunityIcons
        name={focused ? active : passive}
        size={size}
        color={color}
      />
      {badgeCount > 0 && (
        <View style={badgeStyle}>
          <Text style={badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
};

const badgeStyle = {
  // On React Native < 0.57 overflow outside of parent will not work on Android, see https://git.io/fhLJ8
  position: 'absolute',
  right: -2,
  top: -1,
  backgroundColor: 'red',
  borderRadius: 7,
  width: 12,
  height: 12,
  justifyContent: 'center',
  alignItems: 'center',
};

const badgeText = {
  color: 'white',
  fontSize: 10,
  fontWeight: 'bold',
};

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
