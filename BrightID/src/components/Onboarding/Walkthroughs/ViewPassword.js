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
import { openDrawer } from '@/NavigationService';
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

  /**
   * dimensions of edit profile button on the side bar
   * {x, y, width, height}
   */

  const editProfileLayout = useSelector(
    (state) => state.walkthrough.editProfileLayout,
  );
  const headerHeight = useSelector((state) => state.walkthrough.headerHeight);
  const { width, height } = useWindowDimensions();

  // added 20 for padding
  const editProfileX = editProfileLayout?.x + br + 20;
  const editProfileY = editProfileLayout?.y + headerHeight;
  // subtracted 160 padding
  const editProfileWidth = editProfileLayout?.width - 160 - br * 2;
  // added 10 for padding
  const editProfileHeight = editProfileLayout?.height + 10 - br * 2;

  // subtract 120 because the arrow point is 120 px left inside the svg
  const arrowLeft = editProfileX + editProfileWidth - 120;
  // 209 + 105
  const arrowTop = editProfileY + editProfileLayout?.height / 2;

  // arrow width = 169, height = 316
  const infoBoxLeft = arrowLeft + 169 / 2;
  const infoBoxTop = arrowTop + 316 - 48;
  return (
    <View style={styles.container}>
      <Svg
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
        <Arrow color={WHITE} />
      </View>
      <View style={[styles.infoBox, { left: infoBoxLeft, top: infoBoxTop }]}>
        <Text style={styles.infoText}>
          {'You can always see your\nBrightID password in here'}
        </Text>
      </View>
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
    fontSize: fontSize[15],
    lineHeight: 25,
  },
});

export default ViewPassword;
