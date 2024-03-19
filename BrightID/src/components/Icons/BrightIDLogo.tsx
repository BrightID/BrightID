import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { PRIMARY } from '@/theme/colors';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
};

const BrightIDLogo = ({
  color = PRIMARY,
  width = 50,
  height = 50,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 50 50" fill="none">
    <Path 
        d="M17.2686 17.5469V25.681C17.2686 30.1739 20.902 33.8159 25.384 33.8159C29.866 33.8159 33.4991 30.1739 33.4991 25.681C33.4991 21.1884 29.866 17.5464 25.384 17.5464C25.374 17.5464 25.3642 17.5472 25.3542 17.5472V17.5469H17.2686Z" 
        fill="#ED7A5D"
    />
    <Path 
        d="M26.6649 0H23.3941H17.2689V9.4119H25.3545V9.41267C25.3645 9.41267 25.3743 9.4119 25.3843 9.4119C34.348 9.4119 41.615 16.6956 41.615 25.6814C41.615 34.667 34.348 41.9507 25.3843 41.9507C16.4203 41.9507 9.15332 34.667 9.15332 25.6814V17.5471H0V24.9913H0.0597736C0.0708048 38.8053 11.2459 50 25.0295 50C38.82 50 50 38.794 50 24.9704C50 11.698 39.6925 0.845248 26.6649 0Z" 
        fill="#ED7A5D"
    />
    <Path 
        d="M9.12763 0H0.0574341V9.48081H9.12763V0Z" 
        fill="#ED7A5D"
    />
    
  </Svg>
);

export default BrightIDLogo;
