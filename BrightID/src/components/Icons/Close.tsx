import { GRAY9 } from '@/theme/colors';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const Close = ({
  color = GRAY9,
  width = 24,
  height = 24,
}: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        <Path 
            d="M7.75732 16.2427L16.2426 7.75739" 
            stroke={color}
            stroke-width="1.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M16.2426 16.2426L7.75732 7.75732" 
            stroke={color}
            stroke-width="1.5" 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
    </Svg>
);

export default Close;
