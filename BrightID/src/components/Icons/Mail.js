// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/utils/colors';

type Props = {
  color: string,
  highlight: String,
  width: number,
  height: number,
};

const Mail = ({
  color = BLACK,
  highlight = ORANGE,
  width = 26,
  height = 24,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 26 24" fill="none">
    <Path
      d="M1 11L3 12L13 18L23 12L25 11V22H1V11Z"
      fill={highlight}
      stroke={highlight}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M21 4H5C3.9 4 3.01 4.9 3.01 6L3 18C3 19.1 3.9 20 5 20H21C22.1 20 23 19.1 23 18V6C23 4.9 22.1 4 21 4ZM21 8L13 13L5 8V6L13 11L21 6V8Z"
      fill={color}
    />
  </Svg>
);

export default Mail;
