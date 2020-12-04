// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLACK } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
};

const ChatBox = ({ color = BLACK, width = 21, height = 21 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 21 21" fill="none">
    <Path
      d="M15.3 0H1.7C0.765 0 0 0.72 0 1.6V16L3.4 12.8H15.3C16.235 12.8 17 12.08 17 11.2V1.6C17 0.72 16.235 0 15.3 0Z"
      fill={color}
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M4 14.8H5.4H17.3C18.235 14.8 19 14.08 19 13.2V5H19.3C20.235 5 21 5.72 21 6.6V21L17.6 17.8H5.7C4.765 17.8 4 17.08 4 16.2V14.8Z"
      fill={color}
    />
  </Svg>
);

export default ChatBox;
