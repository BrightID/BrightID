// @flow

import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { BLACK, RED } from '@/theme/colors';

type Props = {
  color: string,
  alert: Boolean,
  width: number,
  height: number,
};

const NotificationBell = ({
  color = BLACK,
  alert = false,
  width = 27,
  height = 28,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 27 28" fill="none">
    <Path
      d="M13.5001 25.6666C14.7376 25.6666 15.7501 24.6166 15.7501 23.3333H11.2501C11.2501 24.6166 12.2514 25.6666 13.5001 25.6666ZM20.2501 18.6666V12.8333C20.2501 9.25163 18.4051 6.25329 15.1876 5.45996V4.66663C15.1876 3.69829 14.4339 2.91663 13.5001 2.91663C12.5664 2.91663 11.8126 3.69829 11.8126 4.66663V5.45996C8.58387 6.25329 6.75012 9.23996 6.75012 12.8333V18.6666L5.29887 20.1716C4.59012 20.9066 5.08512 22.1666 6.08637 22.1666H20.9026C21.9039 22.1666 22.4101 20.9066 21.7014 20.1716L20.2501 18.6666Z"
      fill={color}
    />
    {alert ? <Circle cx="20" cy="10" r="4" fill={RED} /> : null}
  </Svg>
);

export default NotificationBell;
