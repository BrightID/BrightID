import { GRAY4 } from '@/theme/colors';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const Eye = ({
  color = GRAY4,
  width = 24,
  height = 24,
}: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path 
            d="M15.58 11.9999C15.58 13.9799 13.98 15.5799 12 15.5799C10.02 15.5799 8.42001 13.9799 8.42001 11.9999C8.42001 10.0199 10.02 8.41992 12 8.41992C13.98 8.41992 15.58 10.0199 15.58 11.9999Z" 
            stroke={color}
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M15.58 11.9999C15.58 13.9799 13.98 15.5799 12 15.5799C10.02 15.5799 8.42001 13.9799 8.42001 11.9999C8.42001 10.0199 10.02 8.41992 12 8.41992C13.98 8.41992 15.58 10.0199 15.58 11.9999Z" 
            stroke={color}
            stroke-opacity="0.2" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.47 3.71997 5.18 5.79997 2.89 9.39997C1.99 10.81 1.99 13.18 2.89 14.59C5.18 18.19 8.47 20.27 12 20.27Z" 
            stroke={color} 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M12 20.27C15.53 20.27 18.82 18.19 21.11 14.59C22.01 13.18 22.01 10.81 21.11 9.39997C18.82 5.79997 15.53 3.71997 12 3.71997C8.47 3.71997 5.18 5.79997 2.89 9.39997C1.99 10.81 1.99 13.18 2.89 14.59C5.18 18.19 8.47 20.27 12 20.27Z" 
            stroke={color}
            stroke-opacity="0.2" 
            stroke-width="2" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
    </Svg>

);

export default Eye;
