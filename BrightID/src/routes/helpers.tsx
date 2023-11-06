import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { navigate } from '@/NavigationService';
import { useSelector } from '@/store/hooks';
import { GRAY9, ORANGE, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { TWENTY_TWO, SIXTY } from '@/theme/sizes';
import BackArrow from '@/components/Icons/BackArrow';

export const headerTitleStyle = {
  fontFamily: 'Poppins-Bold',
  fontSize: fontSize[20],
  // color: WHITE,
  color: GRAY9,
};

export const headerOptions: StackNavigationOptions = {
  headerTitleStyle,
  // @ts-ignore
  headerStyle: {
    // backgroundColor: ORANGE,
    shadowRadius: 0,
    elevation: 0,
    shadowOffset: {
      height: 0,
    },
  },
  headerTintColor: WHITE,
  // headerTitleAlign: 'left',
  headerTitleAlign: 'center',
  headerBackTitleVisible: false,
  headerBackImage: () => (
    <View
      style={{
        width: SIXTY,
        alignItems: 'center',
      }}
    >
      {/* <BackArrow height={TWENTY_TWO} color={WHITE} /> */}
      <BackArrow height={TWENTY_TWO} color={GRAY9} />
    </View>
  ),
  headerBackTestID: 'NavBackBtn',
};

export const NavHome = () => (
  <TouchableOpacity
    testID="NavHomeBtn"
    style={{
      width: SIXTY,
      alignItems: 'center',
    }}
    onPress={() => {
      navigate('Home');
    }}
  >
    <BackArrow height={TWENTY_TWO} color={GRAY9} />
  </TouchableOpacity>
);

export const AnimatedHeaderTitle = ({ text }) => {
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
      <Text style={headerTitleStyle}>{text}</Text>
    </Animated.View>
  );
};
