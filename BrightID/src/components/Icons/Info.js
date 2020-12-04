// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { BLUE } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
};

console.log('BLUE', BLUE);

const Info = ({ color = BLUE, width = 43, height = 43 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 43 43" fill="none">
    <Path
      d="M21.25 0C9.52 0 0 9.52 0 21.25C0 32.98 9.52 42.5 21.25 42.5C32.98 42.5 42.5 32.98 42.5 21.25C42.5 9.52 32.98 0 21.25 0ZM21.25 31.875C20.0812 31.875 19.125 30.9188 19.125 29.75V21.25C19.125 20.0812 20.0812 19.125 21.25 19.125C22.4188 19.125 23.375 20.0812 23.375 21.25V29.75C23.375 30.9188 22.4188 31.875 21.25 31.875ZM23.375 14.875H19.125V10.625H23.375V14.875Z"
      fill={color}
    />
  </Svg>
);

export default Info;
