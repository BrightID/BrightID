// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { GREEN } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
  strokeWidth: number,
};

const Check = ({
  color = GREEN,
  width = 17,
  height = 12,
  strokeWidth = 2,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 17 12" fill="none">
    <Path
      d="M1 5.5L6 10.5L15.5 1"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export default Check;
