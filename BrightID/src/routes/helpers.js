import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { navigate } from '@/NavigationService';
import { ORANGE, WHITE } from '@/theme/colors';
import { TWENTY, TWENTY_TWO, SIXTY } from '@/theme/sizes';
import BackArrow from '@/components/Icons/BackArrow';

export const headerTitleStyle = {
  fontFamily: 'Poppins-Bold',
  fontSize: TWENTY,
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
        width: SIXTY,
        alignItems: 'center',
      }}
    >
      <BackArrow height={TWENTY_TWO} color={WHITE} />
    </View>
  ),
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
    <BackArrow height={TWENTY_TWO} color={WHITE} />
  </TouchableOpacity>
);
