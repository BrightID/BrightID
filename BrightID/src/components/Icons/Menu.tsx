import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK } from '@/theme/colors';

type Props = {
  color: string;
  width: number;
  height: number;
};

const Menu = ({ color = BLACK, width = 29, height = 18 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 29 18" fill="none">
    <Path
      d="M1 17.5H28.5"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 9.5H28.5"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 0.5H28.5"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Menu;