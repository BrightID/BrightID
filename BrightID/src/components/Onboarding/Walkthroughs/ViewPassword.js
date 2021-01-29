// @flow

import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { DARKER_GREY, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { openDrawer } from '@/NavigationService';
import { useTranslation } from 'react-i18next';
import Arrow from '../../Icons/Arrow';

/**
 * For additional info on how to cut shapes out of shapes with SVG:
 * https://stackoverflow.com/questions/1983256/how-can-i-cut-one-shape-inside-another/7716523#7716523
 */

// border radius for edit profile box
const br = 20;
// upper right corner
const urc = `a${br},${br} 0 0 1 ${br},${br}`;
// lower right corner
const lrc = `a${br},${br} 0 0 1 -${br},${br}`;
// lower left corner
const llc = `a${br},${br} 0 0 1 -${br},-${br}`;
// lower left corner
const ulc = `a${br},${br} 0 0 1 ${br},-${br}`;

const ViewPassword = ({ navigation }) => {
  useFocusEffect(
    useCallback(() => {
      openDrawer();
    }, []),
  );
  const { t } = useTranslation();

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
  const { width, height } = useWindowDimensions();

  /**
   * Dimensions for the transparent box around Edit Profile in the side menu
   */

  // added 20 for padding, br for border radius
  const editProfileX = editProfileMenuLayout?.x + br + 20;
  // added header height from home page
  const editProfileY = editProfileMenuLayout?.y + headerHeight;
  // use edit profile text to make sure the box fits all device sizes
  const editProfileWidth =
    editProfileTextLayout?.width + editProfileTextLayout?.x + 10 - br * 2;
  // added 10 for padding
  const heightPadding = DEVICE_LARGE ? 10 : 18;
  const editProfileHeight =
    editProfileMenuLayout?.height + heightPadding - br * 2;

  // subtract 120 because the arrow point is 120 px left inside the svg
  const arrowLeft = editProfileX + editProfileWidth - 105;

  const arrowTop = editProfileY + editProfileMenuLayout?.height / 2;

  /**
   * Dimensions for the box with text about the password
   */

  const infoBoxLeft = arrowLeft - 10 + 169 / 2;
  const infoBoxTop = arrowTop + 250 - 48;
  return (
    <View style={styles.container}>
      <Svg
        testID="ViewPasswordWalkthrough"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        onPress={() => {
          navigation.goBack();
        }}
      >
        <Path
          d={`M0 0 V${height} H${width} V0Z M${editProfileX} ${editProfileY} h${editProfileWidth} ${urc} v${editProfileHeight} ${lrc} h${-editProfileWidth} ${llc} v${-editProfileHeight} ${ulc} z`}
          fill={DARKER_GREY}
          fillOpacity={0.8}
          fillRule="evenodd"
        />
      </Svg>
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
          {t('walkthroughs.text.viewPassword')}
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
