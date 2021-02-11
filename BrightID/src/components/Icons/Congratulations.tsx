import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { ORANGE } from '@/theme/colors';

type Props = {
  color: string;
  width: number;
  height: number;
  strokeWidth: number;
};

const Faq = ({
  color = ORANGE,
  width = 188,
  height = 228,
  strokeWidth = 3,
}: Props) => (
  <Svg width={width} height={height} viewBox="0 0 188 228" fill="none">
    <Path
      d="M51 35L37 21"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M51 193L37 207"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M26.6174 65.8724L9.38257 56.1277"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M151 21L137 35"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M151 207L137 193"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M11 168L25 154"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M93.8994 22.799V3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M93.8994 205.201V225"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22.799 110.899H3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M161.99 155.183L178.01 166.817"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M178.522 55.9631L161.478 66.0371"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M165.201 111.101H185"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="65" cy="15" r="3" fill={color} />
    <Circle cx="40" cy="51" r="3" fill={color} />
    <Circle cx="20" cy="90" r="3" fill={color} />
    <Circle cx="23" cy="130" r="3" fill={color} />
    <Circle cx="34" cy="176" r="3" fill={color} />
    <Circle cx="71" cy="204" r="3" fill={color} />
    <Circle cx="115" cy="198" r="3" fill={color} />
    <Circle cx="154" cy="179" r="3" fill={color} />
    <Circle cx="161" cy="130" r="3" fill={color} />
    <Circle cx="160" cy="84" r="3" fill={color} />
    <Circle cx="159" cy="41" r="3" fill={color} />
    <Circle cx="118" cy="18" r="3" fill={color} />
  </Svg>
);

export default Faq;