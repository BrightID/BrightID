import React from 'react';
import Svg, { Circle, G, Path, Mask } from 'react-native-svg';
import { DARKER_GREY, LIGHT_GREY, GREY, WHITE } from '@/theme/colors';

type Props = {
  color: string;
  background: string;
  addPicture: Boolean;
  width: number;
  height: number;
};

const GroupAvatar = ({
  color = GREY,
  background = LIGHT_GREY,
  addPicture = false,
  secondary = DARKER_GREY,
  width = 61,
  height = 62,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 61 62" fill="none">
    <Circle cx="30.2874" cy="30.2874" r="30.2874" fill={background} />
    <Mask
      id="mask0"
      maskType="alpha"
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="61"
      height="61"
    >
      <Circle cx="30.2874" cy="30.2874" r="30.2874" fill={background} />
    </Mask>
    <G mask="url(#mask0)">
      <Circle cx="30.2873" cy="26.2491" r="8.74968" fill={color} />
      <Circle cx="47.1138" cy="28.2681" r="6.73052" fill={color} />
      <Circle
        r="6.73052"
        transform="matrix(-1 0 0 1 14.5375 28.2681)"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1152 49.2661V49.0893C12.185 42.0426 20.5955 36.3448 30.9603 36.3448C41.3683 36.3448 49.8057 42.0903 49.8057 49.1777C49.8057 49.8491 49.73 50.5085 49.5841 51.152H12.3364C12.1969 50.5367 12.1216 49.907 12.1152 49.2661Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M53.1795 48.4599H62.8206C62.9373 47.945 62.9979 47.4176 62.9979 46.8804C62.9979 41.2105 56.248 36.6141 47.9215 36.6141C46.8445 36.6141 45.7938 36.691 44.7808 36.8372C49.6288 37.8166 53.2722 41.9057 53.306 46.8117V46.9492C53.3024 47.4626 53.2594 47.967 53.1795 48.4599Z"
        fill={color}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.47239 48.4598H-1.16881C-1.28326 47.9551 -1.34373 47.4382 -1.34607 46.9121V46.8486C-1.32092 41.1932 5.41933 36.614 13.7302 36.614C14.8073 36.614 15.858 36.6909 16.8711 36.8371C12.0119 37.8188 8.36298 41.9244 8.34579 46.8454V46.9152C8.34762 47.4403 8.3908 47.9561 8.47239 48.4598Z"
        fill={color}
      />
    </G>
    {addPicture ? (
      <>
        <Circle
          cx="48.1034"
          cy="53.092"
          r="8.90805"
          fill={secondary}
          fillOpacity="0.8"
        />
        <Path
          d="M48.222 54.6598C49.0616 54.6598 49.7423 54.0642 49.7423 53.3295C49.7423 52.5948 49.0616 51.9993 48.222 51.9993C47.3823 51.9993 46.7017 52.5948 46.7017 53.3295C46.7017 54.0642 47.3823 54.6598 48.222 54.6598Z"
          fill={WHITE}
        />
        <Path
          d="M46.7969 49.1724L45.9274 50.0038H44.4214C43.8988 50.0038 43.4712 50.3779 43.4712 50.8352V55.8237C43.4712 56.281 43.8988 56.6551 44.4214 56.6551H52.0229C52.5455 56.6551 52.9731 56.281 52.9731 55.8237V50.8352C52.9731 50.3779 52.5455 50.0038 52.0229 50.0038H50.5169L49.6474 49.1724H46.7969ZM48.2222 55.408C46.9109 55.408 45.8467 54.4768 45.8467 53.3295C45.8467 52.1821 46.9109 51.2509 48.2222 51.2509C49.5334 51.2509 50.5976 52.1821 50.5976 53.3295C50.5976 54.4768 49.5334 55.408 48.2222 55.408Z"
          fill={WHITE}
        />
      </>
    ) : null}
  </Svg>
);

export default GroupAvatar;