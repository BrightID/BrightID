import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { GRAY8 } from '@/theme/colors';

type Props = {
  color?: string;
  width?: number;
  height?: number;
};

const NewInfo = ({ color = GRAY8, width = 16, height = 16 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 16 16" fill="none">
    <G clip-path="url(#clip0_3827_150)">
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M0.833374 7.99992C0.833374 4.05711 4.05723 0.833252 8.00004 0.833252C11.9428 0.833252 15.1667 4.05711 15.1667 7.99992C15.1667 11.9427 11.9428 15.1666 8.00004 15.1666C4.05723 15.1666 0.833374 11.9427 0.833374 7.99992ZM8.00004 1.83325C4.60952 1.83325 1.83337 4.60939 1.83337 7.99992C1.83337 11.3904 4.60952 14.1666 8.00004 14.1666C11.3906 14.1666 14.1667 11.3904 14.1667 7.99992C14.1667 4.60939 11.3906 1.83325 8.00004 1.83325Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M8 4.83325C8.27614 4.83325 8.5 5.05711 8.5 5.33325V8.66658C8.5 8.94273 8.27614 9.16658 8 9.16658C7.72386 9.16658 7.5 8.94273 7.5 8.66658V5.33325C7.5 5.05711 7.72386 4.83325 8 4.83325Z"
        fill={color}
      />
      <Path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M7.49634 10.6667C7.49634 10.3906 7.7202 10.1667 7.99634 10.1667H8.00233C8.27847 10.1667 8.50233 10.3906 8.50233 10.6667C8.50233 10.9429 8.27847 11.1667 8.00233 11.1667H7.99634C7.7202 11.1667 7.49634 10.9429 7.49634 10.6667Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_3827_150">
        <Rect width="16" height="16" fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default NewInfo;
