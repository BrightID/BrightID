// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/theme/colors';

type Props = {
  color: string,
  highlight: String,
  width: number,
  height: number,
};

const Pencil = ({
  color = BLACK,
  highlight = ORANGE,
  width = 24,
  height = 24,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 9L17.5 5.5L7 16L12.5 17.5L21 9Z"
      fill={highlight}
      stroke={highlight}
      strokeLinejoin="round"
    />
    <Path
      d="M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
      fill={color}
    />
  </Svg>
);

export default Pencil;
