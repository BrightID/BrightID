// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { ORANGE, WHITE } from '@/theme/colors';

type Props = {
  color: string,
  background: string,
  width: number,
  height: number,
};

const VerifiedBadge = ({
  color = ORANGE,
  background = WHITE,
  width = 48,
  height = 48,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
    <Path
      d="M24 0L29.0679 4.40267L35.7557 3.81966L37.2679 10.3603L43.0211 13.8197L40.4 20L43.0211 26.1803L37.2679 29.6397L35.7557 36.1803L29.0679 35.5973L24 40L18.9321 35.5973L12.2443 36.1803L10.7321 29.6397L4.97887 26.1803L7.6 20L4.97887 13.8197L10.7321 10.3603L12.2443 3.81966L18.9321 4.40267L24 0Z"
      fill={color}
    />
    <Path
      d="M16.3076 20L21.4358 24.6154L31.6922 15.3846"
      stroke={background}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default VerifiedBadge;
