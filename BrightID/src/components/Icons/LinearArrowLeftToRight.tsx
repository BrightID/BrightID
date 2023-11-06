import { SUCCESS } from '@/theme/colors';
import React from 'react';
import Svg, { Path, G } from 'react-native-svg';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const LinearLeftToRightArrow = ({
  color = SUCCESS,
  width = 25,
  height = 24,
}: Props) => (
    <Svg width={width} height={height} viewBox="0 0 25 24" fill="none">
        <G id="vuesax/linear/arrow-right">
            <G id="arrow-right">
                <Path 
                    id="Vector" 
                    d="M14.9299 5.92993L20.9999 11.9999L14.9299 18.0699" 
                    stroke={color} 
                    stroke-width="2" 
                    stroke-miterlimit="10" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                />
                <Path 
                    id="Vector_2" 
                    d="M4 12H20.83" 
                    stroke={color}
                    stroke-width="2" 
                    stroke-miterlimit="10" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"
                />
            </G>
        </G>
    </Svg>

);

export default LinearLeftToRightArrow;
