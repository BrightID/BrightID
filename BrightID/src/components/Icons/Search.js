// @flow

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ORANGE } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
};

const Search = ({ color = ORANGE, width = 21, height = 22 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 21 22" fill="none">
    <Circle cx="8.5" cy="8.5" r="6.5" stroke={color} strokeWidth="4" />
    <Path
      d="M13 14L19 20"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
    />
  </Svg>
);

export default Search;
