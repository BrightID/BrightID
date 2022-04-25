import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

const Devices = (props) => (
  <Svg
    width={16}
    height={21}
    viewBox="0 0 16 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M14.6538 8H10.3462C9.60308 8 9 8.66182 9 9.47727V19.5227C9 20.3382 9.60308 21 10.3462 21H14.6538C15.3969 21 16 20.3382 16 19.5227V9.47727C16 8.66182 15.3969 8 14.6538 8ZM12.5 20.4091C12.0531 20.4091 11.6923 20.0132 11.6923 19.5227C11.6923 19.0323 12.0531 18.6364 12.5 18.6364C12.9469 18.6364 13.3077 19.0323 13.3077 19.5227C13.3077 20.0132 12.9469 20.4091 12.5 20.4091ZM14.9231 18.0455H10.0769V9.77273H14.9231V18.0455Z"
      fill="black"
    />
    <Path
      d="M6 20H2C1.44772 20 1 19.5523 1 19V2C1 1.44771 1.44772 1 2 1H12C12.5523 1 13 1.44772 13 2V6"
      stroke="#ED7A5D"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 18H6C6.55228 18 7 18.4477 7 19V20H2C1.44772 20 1 19.5523 1 19V18Z"
      fill="#ED7A5D"
      stroke="#ED7A5D"
      strokeWidth="2"
    />
  </Svg>
);

export default Devices;
