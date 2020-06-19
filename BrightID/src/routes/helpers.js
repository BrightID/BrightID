import React from 'react';
import { View, StatusBar, Stylesheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ORANGE, DEVICE_IOS } from '@/utils/constants';
import backArrow from '@/static/back_arrow.svg';

const headerTitleStyle = {
  fontFamily: 'Poppins',
  fontWeight: '500',
  fontSize: 20,
};

export const headerOptions = {
  headerTitleStyle,
  // headerStyle: {
  //   backgroundColor: ORANGE,
  // },
  headerBackground: () => (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        translucent={false}
        animated={true}
      />
      <View
        style={{ width: '100%', height: '100%', backgroundColor: ORANGE }}
      />
    </>
  ),
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerBackImage: () => (
    <SvgXml
      height="20"
      xml={backArrow}
      style={{
        marginLeft: DEVICE_IOS ? 20 : 10,
      }}
    />
  ),
};
