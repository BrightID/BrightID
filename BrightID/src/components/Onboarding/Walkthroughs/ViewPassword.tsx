import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { StackScreenProps } from '@react-navigation/stack';
import { useSelector } from '@/store/hooks';
import { WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { openDrawer } from '@/NavigationService';
import FullScreenHighlightBox from '@/components/Helpers/FullScreenHighlightBox';
import Arrow from '../../Icons/Arrow';
import { RootStackParamList } from '@/routes/navigationTypes';

// border radius for edit profile box
const BR = 20;

type props = StackScreenProps<RootStackParamList, 'ViewPasswordWalkthrough'>;

const ViewPassword = ({ navigation }: props) => {
  useFocusEffect(
    useCallback(() => {
      openDrawer();
    }, []),
  );
  const { t } = useTranslation();

  const password = useSelector((state) => state.user.password);

  /**
   * dimensions of edit profile button on the side bar
   * {x, y, width, height}
   */
  const editProfileMenuLayout = useSelector(
    (state) => state.walkthrough.editProfileMenuLayout,
  );
  const editProfileTextLayout = useSelector(
    (state) => state.walkthrough.editProfileTextLayout,
  );
  const headerHeight = useSelector((state) => state.walkthrough.headerHeight);

  /**
   * Dimensions for the transparent box around Edit Profile in the side menu
   */
  // added 20 for padding, br for border radius
  const editProfileX = editProfileMenuLayout?.x + BR + 20;
  // added header height from home page
  const editProfileY = editProfileMenuLayout?.y + headerHeight;
  // use edit profile text to make sure the box fits all device sizes
  const editProfileWidth =
    editProfileTextLayout?.width + editProfileTextLayout?.x + 10 - BR * 2;
  // added 10 for padding
  const heightPadding = DEVICE_LARGE ? 10 : 18;
  const editProfileHeight =
    editProfileMenuLayout?.height + heightPadding - BR * 2;

  // subtract 120 because the arrow point is 120 px left inside the svg
  const arrowLeft = editProfileX + editProfileWidth - 105;

  const arrowTop = editProfileY + editProfileMenuLayout?.height / 2;

  /**
   * Dimensions for the box with text about the password
   */
  const infoBoxLeft = arrowLeft - 10 + 169 / 2;
  const infoBoxTop = arrowTop + 250 - 48;
  return (
    <View style={styles.container} testID="ViewPasswordWalkthrough">
      <FullScreenHighlightBox
        onPress={() => {
          navigation.goBack();
        }}
        br={BR}
        innerWidth={editProfileWidth}
        innerHeight={editProfileHeight}
        innerX={editProfileX}
        innerY={editProfileY}
      />
      <View
        style={{
          position: 'absolute',
          left: arrowLeft,
          top: arrowTop,
        }}
      >
        <Arrow color={WHITE} height={250} />
      </View>
      <View style={[styles.infoBox, { left: infoBoxLeft, top: infoBoxTop }]}>
        <Text style={styles.infoText}>
          {password
            ? t('walkthroughs.text.viewPassword')
            : t('walkthroughs.text.setPassword')}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.bottomBtn, { top: infoBoxTop + 120 }]}
        onPress={() => {
          navigation.goBack();
        }}
        testID="ViewPasswordGotIt"
      >
        <View style={styles.gotItBorder}>
          <Text style={styles.gotIt}>{t('walkthroughs.text.gotIt')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  infoBox: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 15,
  },
  infoText: {
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    fontSize: fontSize[14],
    lineHeight: 25,
  },
  bottomBtn: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    height: 100,
    alignItems: 'center',
  },
  gotIt: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[18],
    lineHeight: 25,
    color: WHITE,
  },
  gotItBorder: {
    borderBottomWidth: 2,
    borderBottomColor: WHITE,
  },
});

export default ViewPassword;
