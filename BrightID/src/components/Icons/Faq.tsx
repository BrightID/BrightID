import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK, ORANGE } from '@/theme/colors';

type Props = {
  color: string;
  highlight: String;
  width: number;
  height: number;
};

const Faq = ({
  color = BLACK,
  highlight = ORANGE,
  width = 24,
  height = 26,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 26" fill="none">
    <Path
      d="M18 25V13.0769L1 10V23L9.5 24L18 25Z"
      fill={highlight}
      stroke={highlight}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M19 2H5C3.89 2 3 2.9 3 4V18C3 19.1 3.89 20 5 20H9L12 23L15 20H19C20.1 20 21 19.1 21 18V4C21 2.9 20.1 2 19 2ZM13 18H11V16H13V18ZM15.07 10.25L14.17 11.17C13.45 11.9 13 12.5 13 14H11V13.5C11 12.4 11.45 11.4 12.17 10.67L13.41 9.41C13.78 9.05 14 8.55 14 8C14 6.9 13.1 6 12 6C10.9 6 10 6.9 10 8H8C8 5.79 9.79 4 12 4C14.21 4 16 5.79 16 8C16 8.88 15.64 9.68 15.07 10.25Z"
      fill={color}
    />
  </Svg>
);

export default Faq;