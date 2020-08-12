import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ORANGE, DEVICE_IOS, DEVICE_LARGE } from '@/utils/constants';
import backArrow from '@/static/back_arrow_white.svg';
import { navigate } from '@/NavigationService';

export const headerTitleStyle = {
  fontFamily: 'Poppins',
  fontWeight: 'bold',
  fontSize: DEVICE_LARGE ? 20 : 18,
  color: '#fff',
};

export const headerOptions = {
  headerTitleStyle,
  headerStyle: {
    backgroundColor: ORANGE,
    shadowRadius: 0,
    shadowOffset: {
      height: 0,
    },
    elevation: 0,
  },
  headerTintColor: '#fff',
  headerTitleAlign: 'left',
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
