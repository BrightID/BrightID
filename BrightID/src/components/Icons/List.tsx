import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/theme/colors';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const List = ({
  color = BLACK,
  highlight = ORANGE,
  width = 24,
  height = 23,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 23" fill="none">
    <Circle cx="2.5" cy="13.5" r="1.5" fill={highlight} />
    <Circle cx="2.5" cy="21.5" r="1.5" fill={highlight} />
    <Path
      d="M1 4.81818L1.7875 6.25L3.625 1"
      stroke={highlight}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7.25 6.25L23 6.25"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M7.25 14.125L23 14.125"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M7.25 22L23 22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default List;
