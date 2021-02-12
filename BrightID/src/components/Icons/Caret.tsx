import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK } from '@/theme/colors';

type Props = {
  direction?: 'down';
  color?: string;
  width?: number;
  height?: number;
};

// TODO: Add pathUp
const pathDown = 'M1 1L5.5 6L10 1';

const Caret = ({
  direction = 'down',
  color = BLACK,
  width = 11,
  height = 7,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 11 7" fill="none">
    <Path
      d={direction === 'down' ? pathDown : pathDown}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default Caret;
