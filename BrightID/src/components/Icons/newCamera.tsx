import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { GRAY4 } from '@/theme/colors';

type Props = {
  color?: string;
  width?: number;
  height?: number;
};

const Camera = ({ color = GRAY4, width = 20, height = 20 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 20 20" fill="none">
    <Path
      d="M5.63339 18.3334H14.3667C16.6667 18.3334 17.5834 16.9251 17.6917 15.2084L18.1251 8.32508C18.2417 6.52508 16.8084 5.00008 15.0001 5.00008C14.4917 5.00008 14.0251 4.70841 13.7917 4.25841L13.1917 3.05008C12.8084 2.29175 11.8084 1.66675 10.9584 1.66675H9.05006C8.19172 1.66675 7.19172 2.29175 6.80839 3.05008L6.20839 4.25841C5.97506 4.70841 5.50839 5.00008 5.00006 5.00008C3.19172 5.00008 1.75839 6.52508 1.87506 8.32508L2.30839 15.2084C2.40839 16.9251 3.33339 18.3334 5.63339 18.3334Z"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M8.75 6.66675H11.25"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <Path
      d="M9.99996 14.9999C11.4916 14.9999 12.7083 13.7833 12.7083 12.2916C12.7083 10.7999 11.4916 9.58325 9.99996 9.58325C8.50829 9.58325 7.29163 10.7999 7.29163 12.2916C7.29163 13.7833 8.50829 14.9999 9.99996 14.9999Z"
      stroke={color}
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </Svg>
);

export default Camera;
