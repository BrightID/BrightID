import React from 'react';
import { useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { DARKER_GREY } from '@/theme/colors';

const FullScreenHighlightBox = ({
  testID,
  onPress,
  br,
  innerHeight,
  innerWidth,
  innerX,
  innerY,
}) => {
  /**
   * Path for full height / width dark grey box that fills entire screen
   * drawn counter clockwise
   */

  const { width, height } = useWindowDimensions();
  const outerGreyBox = `M0 0 V${height} H${width} V0Z`;

  /**
   * Path for the transparent highlight box
   * drawn clockwise to cut a hole in the outer container
   *  For additional info on how to cut shapes out of shapes with SVG:
   * https://stackoverflow.com/questions/1983256/how-can-i-cut-one-shape-inside-another/7716523#7716523
   */
  // upper right corner border radius
  const urc = `a${br},${br} 0 0 1 ${br},${br}`;
  // lower right corner border radius
  const lrc = `a${br},${br} 0 0 1 -${br},${br}`;
  // lower left corner border radius
  const llc = `a${br},${br} 0 0 1 -${br},-${br}`;
  // lower left corner border radius
  const ulc = `a${br},${br} 0 0 1 ${br},-${br}`;

  const innerHighlightBox = `M${innerX} ${innerY} h${innerWidth} ${urc} v${innerHeight} ${lrc} h${-innerWidth} ${llc} v${-innerHeight} ${ulc} z`;

  return (
    <Svg
      testID={testID}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      onPress={onPress}
    >
      <Path
        d={`${outerGreyBox} ${innerHighlightBox}`}
        fill={DARKER_GREY}
        fillOpacity={0.8}
        fillRule="evenodd"
      />
    </Svg>
  );
};

export default FullScreenHighlightBox;
