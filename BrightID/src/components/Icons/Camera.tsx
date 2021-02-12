import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK } from '@/theme/colors';

type Props = {
  color?: string;
  width?: number;
  height?: number;
};

const Camera = ({ color = BLACK, width = 33, height = 30 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 33 30" fill="none">
    <Path
      d="M16.5 19C18.9301 19 20.9 17.2091 20.9 15C20.9 12.7909 18.9301 11 16.5 11C14.07 11 12.1 12.7909 12.1 15C12.1 17.2091 14.07 19 16.5 19Z"
      fill={color}
    />
    <Path
      d="M12.375 2.5L9.85876 5H5.50001C3.98751 5 2.75001 6.125 2.75001 7.5V22.5C2.75001 23.875 3.98751 25 5.50001 25H27.5C29.0125 25 30.25 23.875 30.25 22.5V7.5C30.25 6.125 29.0125 5 27.5 5H23.1413L20.625 2.5H12.375ZM16.5 21.25C12.705 21.25 9.62501 18.45 9.62501 15C9.62501 11.55 12.705 8.75 16.5 8.75C20.295 8.75 23.375 11.55 23.375 15C23.375 18.45 20.295 21.25 16.5 21.25Z"
      fill={color}
    />
  </Svg>
);

export default Camera;
