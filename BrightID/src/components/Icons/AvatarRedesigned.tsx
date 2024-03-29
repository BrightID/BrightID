import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

type Props = {
  color?: string;
  background?: string;
  addPicture?: boolean;
  width?: number;
  height?: number;
  secondary?: string;
};

const AvatarRedesigned = ({ width = 120, height = 120 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    <Path
      d="M61.0037 72.9953C60.3714 72.9233 59.6594 72.9271 59.0083 72.9958C46.7389 72.5004 37 62.4223 37 50.0382C37 37.3191 47.2395 27 60 27C72.6863 27 82.9968 37.3199 83 50.0323C82.9273 62.4287 73.2551 72.4943 61.0037 72.9953Z"
      fill="#CCCCCC"
      stroke="#999999"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M98.2319 103.424C88.0097 112.454 74.645 117.906 59.9529 117.906C45.2608 117.906 31.896 112.454 21.6738 103.424C22.4906 98.8389 25.6158 94.1981 31.2679 90.3933C39.0847 85.203 49.4965 82.5471 59.9978 82.5471C70.5013 82.5471 80.8814 85.2039 88.6356 90.3918C94.2891 94.1969 97.4151 98.8383 98.2319 103.424Z"
      fill="#CCCCCC"
      stroke="#999999"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M117.906 59.9528C117.906 91.9593 91.9593 117.906 59.9528 117.906C27.9464 117.906 2 91.9593 2 59.9528C2 27.9464 27.9464 2 59.9528 2C91.9593 2 117.906 27.9464 117.906 59.9528Z"
      stroke="#999999"
      stroke-width="4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Circle cx="102.367" cy="102.367" r="17.6332" fill="#666666" />
    <Circle
      cx="102.367"
      cy="102.367"
      r="17.1332"
      fill="#666666"
      stroke="#E6E6E6"
    />
    <Path
      d="M95.9999 101.991H108"
      stroke="#E6E6E6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M102.273 108V96"
      stroke="#E6E6E6"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default AvatarRedesigned;
