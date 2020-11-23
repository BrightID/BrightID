import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { navigate } from '@/NavigationService';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import backArrow from '@/static/back_arrow_white.svg';

export const headerTitleStyle = {
  fontFamily: 'Poppins-Bold',
  fontSize: DEVICE_LARGE ? 20 : 17,
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
    <View
      style={{
        width: DEVICE_LARGE ? 60 : 50,
        alignItems: 'center',
      }}
    >
      <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
    </View>
  ),
};

export const NavHome = () => (
  <TouchableOpacity
    testID="NavHomeBtn"
    style={{
      width: DEVICE_LARGE ? 60 : 50,
      alignItems: 'center',
    }}
    onPress={() => {
      navigate('Home');
    }}
  >
    <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
  </TouchableOpacity>
);
