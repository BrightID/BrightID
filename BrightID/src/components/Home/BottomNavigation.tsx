import * as shape from 'd3-shape';

export function path() {
  const width = 400;
  const height = 100;
  const circleWidth = 50 + 16;
  const borderTopLeftRight = false;

  const line = shape
    .line()
    .x((d) => d.x)
    .y((d) => d.y)([
    { x: 0, y: 0 },
    { x: 400, y: 0 },
    { x: 400, y: 100 },
    { x: 0, y: 100 },
  ]);

  const curved = shape
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(shape.curveBumpX)([
    { x: 0, y: 0 },
    { x: 50, y: 0 },
    { x: 50, y: 50 },
    { x: 0, y: 50 },
    // { x: 0, y: 0 },
  ]);

  const path = `${curved}`;

  const pathBorderTopLeftRight = shape
    .line()
    .x((d) => d.x)
    .y((d) => d.y)
    .curve(shape.curveBasis)([
    // right
    { x: (width - circleWidth) / 2 + circleWidth + 20, y: 0 },
    { x: width - 20, y: 0 },
    { x: width - 10, y: 2 },
    { x: width - 2, y: 10 },
    { x: width, y: 20 },
    { x: width, y: height },
    { x: width, y: height },
    // bottom
    { x: width, y: height },
    { x: 0, y: height },
    // left
    { x: 0, y: height },
    { x: 0, y: height },
    { x: 0, y: 20 },
    { x: 0 + 2, y: 10 },
    { x: 0 + 10, y: 2 },
    { x: 0 + 20, y: 0 },
    { x: (width - circleWidth) / 2 - 20, y: 0 },

    { x: (width - circleWidth) / 2 - 20, y: 0 }, // border center left
    { x: (width - circleWidth) / 2 - 10, y: 2 },
    { x: (width - circleWidth) / 2 - 2, y: 10 },
    { x: (width - circleWidth) / 2, y: 17 },

    { x: width / 2 - circleWidth / 2 + 8, y: height / 2 + 2 },
    { x: width / 2 - 10, y: height / 2 + 10 },
    { x: width / 2, y: height / 2 + 10 },
    { x: width / 2 + 10, y: height / 2 + 10 },
    { x: width / 2 + circleWidth / 2 - 8, y: height / 2 + 2 },

    { x: (width - circleWidth) / 2 + circleWidth, y: 17 }, // border center right
    { x: (width - circleWidth) / 2 + circleWidth + 2, y: 10 },
    { x: (width - circleWidth) / 2 + circleWidth + 10, y: 2 },
    { x: (width - circleWidth) / 2 + circleWidth + 20, y: 0 },
  ]);

  if (borderTopLeftRight) {
    return pathBorderTopLeftRight;
  }

  return path;
}

export function arc() {
  const data = [
    { name: 'recovery', value: 2 },
    { name: 'just met', value: 2 },
    { name: 'already know', value: 2 },
    { name: 'suspicious', value: 2 },
  ];

  // create arc
  const arc = shape.arc().outerRadius(50).padAngle(0.05).innerRadius(0.6);
  const sectionAngles = shape.pie().value((d) => d.value)(data);

  return arc;
}

export const bottomNav = `<svg width="360" height="122" viewBox="0 0 360 122" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_d_2_229)">
<path d="M124.24 7H0V122H360V7H237.859C232.251 7 226.901 9.35443 223.113 13.4893L195.441 43.6924C187.443 52.4214 173.656 52.3316 165.773 43.4991L139.162 13.6826C135.367 9.431 129.939 7 124.24 7Z" fill="url(#paint0_linear_2_229)"/>
</g>
<defs>
<filter id="filter0_d_2_229" x="-6" y="0" width="370" height="125" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dx="-1" dy="-2"/>
<feGaussianBlur stdDeviation="2.5"/>
<feComposite in2="hardAlpha" operator="out"/>
<feColorMatrix type="matrix" values="0 0 0 0 0.768627 0 0 0 0 0.768627 0 0 0 0 0.768627 0 0 0 1 0"/>
<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2_229"/>
<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2_229" result="shape"/>
</filter>
<linearGradient id="paint0_linear_2_229" x1="228.104" y1="127.403" x2="71.1611" y2="-163.452" gradientUnits="userSpaceOnUse">
<stop stop-color="#ED7A5D"/>
<stop offset="0.598958" stop-color="#A099CD"/>
<stop offset="0.599058" stop-color="#999ECD"/>
<stop offset="1" stop-color="white"/>
</linearGradient>
</defs>
</svg>
`;
