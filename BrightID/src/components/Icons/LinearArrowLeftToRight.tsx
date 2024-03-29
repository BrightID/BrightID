import { WHITE } from '@/theme/colors';
import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const LinearLeftToRightArrow = ({
  color = WHITE,
  width = 24,
  height = 24,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M14.2229 5.22282C14.6134 4.8323 15.2466 4.8323 15.6371 5.22282L21.7071 11.2928C21.8946 11.4804 22 11.7347 22 11.9999C22 12.2651 21.8946 12.5195 21.7071 12.707L15.6371 18.777C15.2466 19.1676 14.6134 19.1676 14.2229 18.777C13.8324 18.3865 13.8324 17.7533 14.2229 17.3628L19.5858 11.9999L14.2229 6.63704C13.8324 6.24651 13.8324 5.61335 14.2229 5.22282Z"
      fill={color}
    />
    <Path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M3 12C3 11.4477 3.44772 11 4 11H20.83C21.3823 11 21.83 11.4477 21.83 12C21.83 12.5523 21.3823 13 20.83 13H4C3.44772 13 3 12.5523 3 12Z"
      fill={color}
    />
  </Svg>
);

export default LinearLeftToRightArrow;
