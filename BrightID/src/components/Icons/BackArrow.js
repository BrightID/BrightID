// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK } from '@/utils/colors';

type Props = {
  color: string,
  width: number,
  height: number,
  strokeWidth: number,
};

const BackArrow = ({
  color = BLACK,
  width = 15,
  height = 29,
  strokeWidth = 3,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 15 29" fill="none">
    <Path
      d="M13 2L2 14.5L13 27"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BackArrow;
