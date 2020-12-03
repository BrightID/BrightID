// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  direction: 'up' | 'down',
  color: string,
  width: number,
  height: number,
  strokeWidth: number,
};

const pathDown = 'M2 2L8 8L14 2';
const pathUp = 'M14 9L8 3L2 9';

const Chevron = ({
  direction = 'down',
  color = '#000',
  width = 16,
  height = 11,
  strokeWidth = 3,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 16 11" fill="none">
    <Path
      d={direction === 'down' ? pathDown : pathUp}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </Svg>
);

export default Chevron;
