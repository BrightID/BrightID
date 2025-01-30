import React from 'react';
import Svg, { Circle, G, Mask, Path } from 'react-native-svg';
import { DARKER_GREY, LIGHT_GREY, GREY, WHITE } from '@/theme/colors';

type Props = {
  color?: string;
  background?: string;
  addPicture?: boolean;
  width?: number;
  height?: number;
  secondary?: string;
};

const Avatar = ({
  color = GREY,
  background = LIGHT_GREY,
  addPicture = false,
  secondary = DARKER_GREY,
  width = 43,
  height = 44,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 43 44" fill="none">
    <Circle cx="21.4943" cy="21.4943" r="21.4943" fill={background} />
    <Mask
      id="mask0"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="43"
      height="43"
    >
      <Circle cx="21.4943" cy="21.4943" r="21.4943" fill={background} />
    </Mask>
    <G mask="url(#mask0)">
      <Circle cx="20.9922" cy="15.7135" r="6.20946" fill={color} />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.6868 33.3866H8.25302C8.14944 32.9298 8.0957 32.4619 8.0957 31.9854C8.0957 26.9556 14.0835 22.8782 21.4699 22.8782C28.8346 22.8782 34.809 26.9317 34.844 31.9411V32.0296C34.8408 32.4908 34.7872 32.944 34.6868 33.3866Z"
        fill={color}
      />
    </G>
    {addPicture ? (
      <>
        <Circle
          cx="34.1378"
          cy="37.6782"
          r="6.32185"
          fill={secondary}
          fillOpacity="0.8"
        />
        <Path
          d="M34.222 38.7908C34.8179 38.7908 35.3009 38.3682 35.3009 37.8468C35.3009 37.3254 34.8179 36.9027 34.222 36.9027C33.6261 36.9027 33.1431 37.3254 33.1431 37.8468C33.1431 38.3682 33.6261 38.7908 34.222 38.7908Z"
          fill={WHITE}
        />
        <Path
          d="M33.2107 34.8966L32.5937 35.4866H31.5249C31.154 35.4866 30.8506 35.7522 30.8506 36.0767V39.6169C30.8506 39.9414 31.154 40.207 31.5249 40.207H36.9196C37.2904 40.207 37.5939 39.9414 37.5939 39.6169V36.0767C37.5939 35.7522 37.2904 35.4866 36.9196 35.4866H35.8507L35.2337 34.8966H33.2107ZM34.2222 39.3219C33.2917 39.3219 32.5364 38.6611 32.5364 37.8468C32.5364 37.0325 33.2917 36.3717 34.2222 36.3717C35.1528 36.3717 35.9081 37.0325 35.9081 37.8468C35.9081 38.6611 35.1528 39.3219 34.2222 39.3219Z"
          fill={WHITE}
        />
      </>
    ) : null}
  </Svg>
);

export default Avatar;
