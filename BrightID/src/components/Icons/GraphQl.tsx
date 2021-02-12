import React from 'react';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/theme/colors';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const GraphQl = ({
  color = BLACK,
  highlight = ORANGE,
  width = 23,
  height = 25,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 23 25" fill="none">
    <Circle cx="2.5" cy="16.5" r="2.5" fill={highlight} />
    <Circle cx="20.5" cy="16.5" r="2.5" fill={highlight} />
    <Ellipse cx="20.5" cy="8" rx="2.5" ry="3" fill={highlight} />
    <Circle cx="11.5" cy="2.5" r="2.5" fill={highlight} />
    <Ellipse cx="11.5" cy="22" rx="2.5" ry="3" fill={highlight} />
    <Ellipse cx="2.5" cy="8" rx="2.5" ry="3" fill={highlight} />
    <Path
      d="M11.5 3L3 17H20L11.5 3Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3 8.18182L11.5 3L20 8.18182V16.8182L11.5 22L3 16.8182V8.18182Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default GraphQl;
