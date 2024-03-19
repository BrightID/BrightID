import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import { GRAY2, GRAY8 } from '@/theme/colors';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
  backgroundColor?: string;
};

const PencilCircle = ({
  color = GRAY2,
  backgroundColor = GRAY8,
  width = 36,
  height = 37,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 36 37" fill="none">
    <Circle 
        cx="18.3668" 
        cy="18.3669" 
        r="17.6332" 
        fill={backgroundColor}
    />

    <Circle 
        cx="18.3668" 
        cy="18.6332" 
        r="17.1332" 
        fill={backgroundColor} 
        stroke={color}
    />
    <Path 
        d="M18.8125 12.2137L11.8883 19.5427C11.6269 19.821 11.3738 20.3693 11.3232 20.7488L11.0112 23.4813C10.9016 24.4681 11.61 25.1428 12.5883 24.9741L15.304 24.5103C15.6836 24.4428 16.2149 24.1645 16.4763 23.8777L23.4005 16.5487C24.5981 15.2836 25.1379 13.8414 23.274 12.0788C21.4186 10.333 20.0101 10.9486 18.8125 12.2137Z" 
        stroke={color} 
        stroke-width="2" 
        stroke-miterlimit="10" 
        stroke-linecap="round" 
        stroke-linejoin="round"
    />
    <Path 
        d="M17.6571 13.4368C18.0198 15.7645 19.9089 17.5441 22.2536 17.7802" 
        stroke={color} 
        stroke-width="2" 
        stroke-miterlimit="10" 
        stroke-linecap="round" 
        stroke-linejoin="round"
    />
  </Svg>
  
);

export default PencilCircle;
