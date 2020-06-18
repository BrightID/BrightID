import React from 'react';
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
  headerStyle: {
    backgroundColor: ORANGE,
  },
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
