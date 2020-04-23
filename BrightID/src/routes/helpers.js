import * as React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const icon = (active, passive) => ({ focused, color, size }) => (
  <MaterialCommunityIcons
    name={focused ? active : passive}
    size={size}
    color={color}
  />
);
