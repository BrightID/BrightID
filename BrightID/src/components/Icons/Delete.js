// @flow

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { RED } from '@/theme/colors';

type Props = {
  color: string,
  width: number,
  height: number,
};

const Delete = ({ color = RED, width = 44, height = 44 }: Props) => (
  <Svg width={width} height={height} viewBox="0 0 44 44" fill="none">
    <Path
      d="M10.9998 34.8333C10.9998 36.85 12.6498 38.5 14.6665 38.5H29.3332C31.3498 38.5 32.9998 36.85 32.9998 34.8333V12.8333H10.9998V34.8333ZM15.5098 21.78L18.0948 19.195L21.9998 23.0817L25.8865 19.195L28.4715 21.78L24.5848 25.6667L28.4715 29.5533L25.8865 32.1383L21.9998 28.2517L18.1132 32.1383L15.5282 29.5533L19.4148 25.6667L15.5098 21.78ZM28.4165 7.33333L26.5832 5.5H17.4165L15.5832 7.33333H9.1665V11H34.8332V7.33333H28.4165Z"
      fill={color}
    />
  </Svg>
);

export default Delete;
