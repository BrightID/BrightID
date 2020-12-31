// @flow

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { BLACK } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
};

const Filter = ({ color = BLACK, width = 52, height = 40 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 52 40" fill="none">
    <Circle cx="39.7275" cy="5" r="5" fill={color} />
    <Circle cx="39.75" cy="35" r="5" fill={color} />
    <Circle cx="12.75" cy="21" r="5" fill={color} />
    <Path
      d="M2 34.7273H49.75"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 20.8363H49.75"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 5.20911H49.75"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Filter;
