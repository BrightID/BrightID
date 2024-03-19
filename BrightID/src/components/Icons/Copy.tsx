import { DARK_PRIMARY } from '@/theme/colors';
import React from 'react';
import Svg, { Path } from 'react-native-svg';

type Props = {
  color?: string;
  highlight?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
};

const Copy = ({
  color = DARK_PRIMARY,
  width = 24,
  height = 24,
  strokeWidth = 3,
}: Props) => (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none">
        {/* <Path 
            d="M17 13.4V16.4C17 20.4 15.4 22 11.4 22H7.6C3.6 22 2 20.4 2 16.4V12.6C2 8.6 3.6 7 7.6 7H10.6" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"
            
        />
        <Path 
            d="M17 13.4H13.8C11.4 13.4 10.6 12.6 10.6 10.2V7L17 13.4Z" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"/>
        <Path 
            d="M11.6 2H15.6" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M7 5C7 3.34 8.34 2 10 2H12.62" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M22 8V14.19C22 15.74 20.74 17 19.19 17" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"
        />
        <Path 
            d="M22 8H19C16.75 8 16 7.25 16 5V2L22 8Z" 
            stroke={color} 
            stroke-width={strokeWidth} 
            stroke-linecap="round" 
            stroke-linejoin="round"
        /> */}
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M4.00711 9.00711C3.3864 9.62782 3 10.6986 3 12.6V16.4C3 18.3014 3.3864 19.3722 4.00711 19.9929C4.62782 20.6136 5.69863 21 7.6 21H11.4C13.3014 21 14.3722 20.6136 14.9929 19.9929C15.6136 19.3722 16 18.3014 16 16.4V13.4C16 12.8477 16.4477 12.4 17 12.4C17.5523 12.4 18 12.8477 18 13.4V16.4C18 18.4986 17.5864 20.2278 16.4071 21.4071C15.2278 22.5864 13.4986 23 11.4 23H7.6C5.50137 23 3.77218 22.5864 2.59289 21.4071C1.4136 20.2278 1 18.4986 1 16.4V12.6C1 10.5014 1.4136 8.77219 2.59289 7.59289C3.77218 6.4136 5.50137 6 7.6 6H10.6C11.1523 6 11.6 6.44772 11.6 7C11.6 7.55228 11.1523 8 10.6 8H7.6C5.69863 8 4.62782 8.3864 4.00711 9.00711Z" fill="#B64B32"/>
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M10.2173 6.07615C10.591 5.92137 11.0211 6.00692 11.3071 6.29292L17.7071 12.6929C17.9931 12.9789 18.0786 13.409 17.9239 13.7827C17.7691 14.1564 17.4044 14.4 17 14.4H13.8C12.5446 14.4 11.3894 14.2037 10.5929 13.4071C9.79631 12.6106 9.59998 11.4554 9.59998 10.2V7.00003C9.59998 6.59557 9.84362 6.23093 10.2173 6.07615ZM11.6 9.41424V10.2C11.6 11.3446 11.8036 11.7895 12.0071 11.9929C12.2105 12.1964 12.6554 12.4 13.8 12.4H14.5858L11.6 9.41424Z" fill="#B64B32"/>
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M10.6 2C10.6 1.44772 11.0477 1 11.6 1H15.6C16.1523 1 16.6 1.44772 16.6 2C16.6 2.55228 16.1523 3 15.6 3H11.6C11.0477 3 10.6 2.55228 10.6 2Z" fill="#B64B32"/>
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M10 3C8.89228 3 8 3.89228 8 5C8 5.55228 7.55228 6 7 6C6.44772 6 6 5.55228 6 5C6 2.78772 7.78772 1 10 1H12.62C13.1723 1 13.62 1.44772 13.62 2C13.62 2.55228 13.1723 3 12.62 3H10Z" fill="#B64B32"/>
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M22 7C22.5523 7 23 7.44772 23 8V14.19C23 16.2923 21.2923 18 19.19 18C18.6377 18 18.19 17.5523 18.19 17C18.19 16.4477 18.6377 16 19.19 16C20.1877 16 21 15.1877 21 14.19V8C21 7.44772 21.4477 7 22 7Z" fill="#B64B32"/>
        <Path fill-rule="evenodd" clip-rule="evenodd" d="M15.6173 1.07615C15.991 0.921369 16.4211 1.00692 16.7071 1.29292L22.7071 7.29292C22.9931 7.57892 23.0787 8.00904 22.9239 8.38271C22.7691 8.75639 22.4045 9.00003 22 9.00003H19C17.8196 9.00003 16.7145 8.8162 15.9491 8.05089C15.1838 7.28557 15 6.18043 15 5.00003V2.00003C15 1.59557 15.2436 1.23093 15.6173 1.07615ZM17 4.41424V5.00003C17 6.06963 17.1912 6.46448 17.3634 6.63667C17.5355 6.80886 17.9304 7.00003 19 7.00003H19.5858L17 4.41424Z" fill="#B64B32"/>

    </Svg>

);

export default Copy;
