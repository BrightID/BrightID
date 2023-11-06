import React from 'react';
import Svg, { Circle, G, Path, Mask, Rect, Defs, ClipPath } from 'react-native-svg';
import { DARKER_GREY, LIGHT_GREY, GREY, WHITE } from '@/theme/colors';

type Props = {
  color?: string;
  background?: string;
  addPicture?: boolean;
  width?: number;
  height?: number;
  secondary?: string;
};


const AvatarRedesigned = ({
  color = GREY,
  background = LIGHT_GREY,
  addPicture = true,
  secondary = DARKER_GREY,
  width = 120,
  height = 120,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 120 120" fill="none">
    {/* <Rect width="120" height="120" fill="#E5E5E5"/>
        <G id="After">
            <G id="Create_Create_Name" clip-path="url(#clip0_2119_264)">
                <Rect width="360" height="800" transform="translate(-120 -131)" fill="#F8F8F8"/>
                <G id="Group 20">
                    <G id="choose profile pic">
                        <G id="Group 13">
                            <Path id="Vector" d="M61.0037 72.9953C60.3714 72.9233 59.6594 72.9271 59.0083 72.9958C46.7389 72.5004 37 62.4223 37 50.0382C37 37.3191 47.2395 27 60 27C72.6863 27 82.9968 37.3199 83 50.0323C82.9273 62.4287 73.2551 72.4943 61.0037 72.9953Z" fill="#CCCCCC" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <Path id="Vector_2" d="M98.2319 103.424C88.0097 112.454 74.645 117.906 59.9529 117.906C45.2608 117.906 31.896 112.454 21.6738 103.424C22.4906 98.8389 25.6158 94.1981 31.2679 90.3933C39.0847 85.203 49.4965 82.5471 59.9978 82.5471C70.5013 82.5471 80.8814 85.2039 88.6356 90.3918C94.2891 94.1969 97.4151 98.8383 98.2319 103.424Z" fill="#CCCCCC" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <Path id="Vector_3" d="M117.906 59.9528C117.906 91.9593 91.9593 117.906 59.9528 117.906C27.9464 117.906 2 91.9593 2 59.9528C2 27.9464 27.9464 2 59.9528 2C91.9593 2 117.906 27.9464 117.906 59.9528Z" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </G>
                        <G id="Change Group Photo Button">
                            <Circle id="Ellipse 18" cx="102.367" cy="102.367" r="17.6332" fill="#666666"/>
                            <Circle id="Ellipse 19" cx="102.367" cy="102.367" r="17.1332" fill="#666666" stroke="#E6E6E6"/>
                            <G id="vuesax/linear/add">
                                <G id="vuesax/linear/add_2">
                                    <G id="add">
                                        <Path id="Vector_4" d="M95.9999 101.991H108" stroke="#E6E6E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <Path id="Vector_5" d="M102.273 108V96" stroke="#E6E6E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        </G>
                                    </G>
                                </G>
                            </G>
                        </G>
                    </G>
                </G>
                <Path d="M-1531 -344H3251V-352H-1531V-344ZM3249 -346V2798H3257V-346H3249ZM3251 2796H-1531V2804H3251V2796ZM-1529 2798V-346H-1537V2798H-1529ZM-1531 2796C-1529.9 2796 -1529 2796.9 -1529 2798H-1537C-1537 2801.31 -1534.31 2804 -1531 2804V2796ZM3249 2798C3249 2796.9 3249.9 2796 3251 2796V2804C3254.31 2804 3257 2801.31 3257 2798H3249ZM3251 -344C3249.9 -344 3249 -344.895 3249 -346H3257C3257 -349.314 3254.31 -352 3251 -352V-344ZM-1531 -352C-1534.31 -352 -1537 -349.314 -1537 -346H-1529C-1529 -344.895 -1529.9 -344 -1531 -344V-352Z" fill="black"/>
            </G>
    <Defs>
    <ClipPath id="clip0_2119_264">
        <Rect width="360" height="800" fill="white" transform="translate(-120 -131)"/>
    </ClipPath>
    </Defs> */}
    <Path d="M61.0037 72.9953C60.3714 72.9233 59.6594 72.9271 59.0083 72.9958C46.7389 72.5004 37 62.4223 37 50.0382C37 37.3191 47.2395 27 60 27C72.6863 27 82.9968 37.3199 83 50.0323C82.9273 62.4287 73.2551 72.4943 61.0037 72.9953Z" fill="#CCCCCC" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <Path d="M98.2319 103.424C88.0097 112.454 74.645 117.906 59.9529 117.906C45.2608 117.906 31.896 112.454 21.6738 103.424C22.4906 98.8389 25.6158 94.1981 31.2679 90.3933C39.0847 85.203 49.4965 82.5471 59.9978 82.5471C70.5013 82.5471 80.8814 85.2039 88.6356 90.3918C94.2891 94.1969 97.4151 98.8383 98.2319 103.424Z" fill="#CCCCCC" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <Path d="M117.906 59.9528C117.906 91.9593 91.9593 117.906 59.9528 117.906C27.9464 117.906 2 91.9593 2 59.9528C2 27.9464 27.9464 2 59.9528 2C91.9593 2 117.906 27.9464 117.906 59.9528Z" stroke="#999999" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <Circle cx="102.367" cy="102.367" r="17.6332" fill="#666666"/>
    <Circle cx="102.367" cy="102.367" r="17.1332" fill="#666666" stroke="#E6E6E6"/>
    <Path d="M95.9999 101.991H108" stroke="#E6E6E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <Path d="M102.273 108V96" stroke="#E6E6E6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </Svg>
);

export default AvatarRedesigned;
