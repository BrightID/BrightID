import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { navigate } from '@/NavigationService';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import backArrow from '@/static/back_arrow_white.svg';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

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

export const AnimatedHeaderTitle = ({ i18key }) => {
  const { t } = useTranslation();
  const searchOpen = useSelector(
    (state) => state.connections.searchOpen || state.groups.searchOpen,
  );
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
      <Text style={headerTitleStyle}>{t(i18key)}</Text>
    </Animated.View>
  );
};
