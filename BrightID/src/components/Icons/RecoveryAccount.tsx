import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/theme/colors';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const RecoveryAccount = ({
  color = BLACK,
  highlight = ORANGE,
  width = 24,
  height = 24,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 26V1H22V26H15Z"
      fill={highlight}
      stroke={highlight}
      strokeLinejoin="round"
    />
    <Path
      d="M19 2H9C7.9 2 7 2.9 7 4V7H9V5H19V21H9V19H7V22C7 23.1 7.9 24 9 24H19C20.1 24 21 23.1 21 22V4C21 2.9 20.1 2 19 2ZM10.8 12V10.5C10.8 9.1 9.4 8 8 8C6.6 8 5.2 9.1 5.2 10.5V12C4.6 12 4 12.6 4 13.2V16.7C4 17.4 4.6 18 5.2 18H10.7C11.4 18 12 17.4 12 16.8V13.3C12 12.6 11.4 12 10.8 12ZM9.5 12H6.5V10.5C6.5 9.7 7.2 9.2 8 9.2C8.8 9.2 9.5 9.7 9.5 10.5V12Z"
      fill={color}
    />
  </Svg>
);

export default RecoveryAccount;
