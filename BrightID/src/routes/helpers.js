import * as React from 'react';

import LinearGradient from 'react-native-linear-gradient';

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
