// @flow

import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import { BLACK, ORANGE, WHITE } from '@/theme/colors';

type Props = {
  color: string,
  highlight: String,
  width: number,
  height: number,
};

const Home = ({
  color = BLACK,
  highlight = ORANGE,
  background = WHITE,
  width = 27,
  height = 25,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 27 25" fill="none">
    <Path
      d="M12 2L14.5 9.5V24.5H1V12L12 2Z"
      fill={highlight}
      stroke={highlight}
      strokeLinejoin="round"
    />
    <G clipPath="url(#clip0)">
      <Path
        d="M11.9972 22.6791V16.0745H16.9972V22.6791C16.9972 23.4056 17.5597 24 18.2472 24H21.9972C22.6847 24 23.2472 23.4056 23.2472 22.6791V13.4326H25.3721C25.9471 13.4326 26.2221 12.6797 25.7846 12.2834L15.3347 2.33684C14.8597 1.88772 14.1347 1.88772 13.6597 2.33684L3.20981 12.2834C2.78482 12.6797 3.04731 13.4326 3.62231 13.4326H5.74729V22.6791C5.74729 23.4056 6.30979 24 6.99728 24H10.7473C11.4347 24 11.9972 23.4056 11.9972 22.6791Z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0">
        <Rect
          width="24"
          height="24"
          fill={background}
          transform="translate(3)"
        />
      </ClipPath>
    </Defs>
  </Svg>
);

export default Home;
