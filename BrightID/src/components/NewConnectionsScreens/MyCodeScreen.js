// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from '@/emitter';
import { DEVICE_LARGE } from '@/utils/constants';
import { qrCodeToSvg } from '@/utils/qrCodes';
import { startConnecting, stopConnecting } from './actions/connecting';

/**
 * My Code screen of BrightID
 *
 * USERA represents this user
 * ==================================================================
 * displays a qrcode
 *
 */

type State = {
  copied: boolean,
  countdown: number,
  qrsvg:
    | string
    | {
        svg: {
          $: {
            viewBox: string,
          },
        },
      },
};

const COPIED_TIMEOUT = 500;

export class MyCodeScreen extends React.Component<Props, State> {
  timer: IntervalID;

  constructor(props: Props) {
    super(props);
    this.state = {
      qrsvg: '',
      copied: false,
      countdown: 0,
    };
  }

  componentDidMount() {
    // we need to reload the QR code every mount
    const { dispatch } = this.props;
    dispatch(stopConnecting());
    dispatch(startConnecting());
    // start local timer to display countdown
    this.timer = setInterval(() => {
      this.timerTick();
    }, 100);

    // For now directly jump to preview when a profile is received.
    // Needs to be replaced by notification system.
    // Or maybe leave it like that, so as long as the MyCode screen is open the first responder
    // directly to the preview contact. Any subsequent responders will end up in the
    // notification area.
    emitter.on('connectDataReady', this.navigateToPreview);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const currentQrString = this.props.myQrData
      ? this.props.myQrData.qrString
      : undefined;
    const prevQrString = prevProps.myQrData
      ? prevProps.myQrData.qrString
      : undefined;
    if (currentQrString !== prevQrString) {
      this.checkQrCode();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timer);
    emitter.off('connectDataReady', this.navigateToPreview);
  }

  checkQrCode = () => {
    if (!this.props.myQrData) {
      const { dispatch } = this.props;
      console.log(`Triggering generation of new QRCodeData`);
      dispatch(startConnecting());
    } else {
      // qrData is available, now create actual qrCode image
      const { qrString } = this.props.myQrData;
      console.log(`Using QRCodeData (${qrString})`);
      qrCodeToSvg(qrString, (qrsvg) => this.setState({ qrsvg }));
    }
  };

  timerTick = () => {
    if (this.props.myQrData) {
      let countdown =
        this.props.myQrData.ttl - (Date.now() - this.props.myQrData.timestamp);
      if (countdown < 0) countdown = 0;
      this.setState((prevState) => ({
        countdown,
      }));
    }
  };

  navigateToPreview = () => {
    this.props.navigation.navigate('PreviewConnection');
  };

  navigateToHome = () => {
    this.props.navigation.navigate('Home');
  };

  displayTime = () => {
    const { countdown } = this.state;
    const minutes = Math.floor(countdown / 60000);
    let seconds = Math.trunc((countdown % 60000) / 1000);
    if (seconds < 10) {
      seconds = `0${seconds}`;
    }
    return `${minutes}:${seconds}`;
  };

  copyQr = () => {
    const {
      myQrData: { qrString },
    } = this.props;
    Clipboard.setString(qrString);
    this.setState({ copied: true }, () =>
      setTimeout(() => this.setState({ copied: false }), COPIED_TIMEOUT),
    );
  };

  renderCopyQr = () => (
    <TouchableOpacity
      testID="copyQrButton"
      style={styles.copyContainer}
      onPress={this.copyQr}
    >
      <Material
        size={24}
        name="content-copy"
        color="#333"
        style={{ width: 24, height: 24 }}
      />
      <Text style={styles.copyText}> Copy</Text>
    </TouchableOpacity>
  );

  renderSpinner = () => (
    <View style={styles.qrsvgContainer}>
      <Spinner
        // style={styles.spinner}
        isVisible={true}
        size={47}
        type="9CubeGrid"
        color="#4990e2"
      />
    </View>
  );

  renderTimer = () => (
    <View style={styles.timerContainer}>
      <Text style={styles.timerTextLeft}>Expires in: </Text>
      <Text style={styles.timerTextRight}>{this.displayTime()}</Text>
    </View>
  );

  renderQrCode = () => (
    <View style={[styles.qrsvgContainer]}>
      <Svg
        height={DEVICE_LARGE ? '212' : '180'}
        width={DEVICE_LARGE ? '212' : '180'}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={path(['svg', '$', 'viewBox'], this.state.qrsvg)}
        shape-rendering="crispEdges"
      >
        <Path
          fill={this.state.copied ? 'lightblue' : '#fff'}
          d={path(['svg', 'path', '0', '$', 'd'], this.state.qrsvg)}
        />
        <Path
          stroke="#000"
          d={path(['svg', 'path', '1', '$', 'd'], this.state.qrsvg)}
        />
      </Svg>
    </View>
  );

  render() {
    const { photo, name } = this.props;
    const { qrsvg } = this.state;
    return (
      <View style={styles.container}>
        <View style={styles.topHalf}>
          <View style={styles.myCodeInfoContainer}>
            <Text style={styles.myCodeInfoText}>
              To make a new connection, you will share your
            </Text>
            <Text style={styles.myCodeInfoText}>
              name, your photo, your score
            </Text>
          </View>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
              }}
              style={styles.photo}
              resizeMode="cover"
              onError={(e) => {
                console.log(e);
              }}
              accessible={true}
              accessibilityLabel="user photo"
            />
            {DEVICE_LARGE && <Text style={styles.name}>{name}</Text>}
          </View>
        </View>
        <View style={styles.bottomHalf} testID="qrCode">
          {qrsvg ? this.renderTimer() : <View />}
          {qrsvg ? this.renderQrCode() : this.renderSpinner()}
          {qrsvg ? this.renderCopyQr() : <View />}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
  },
  topHalf: {
    height: '45%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalf: {
    height: '55%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myCodeInfoContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 36,
  },
  myCodeInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  photoContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  photo: {
    width: 102,
    height: 102,
    borderRadius: 51,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    marginTop: 12,
    fontSize: 20,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  qrsvgContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 25,
    minWidth: 100,
  },
  copyText: {
    color: '#333',
    fontFamily: 'ApexNew-Book',
  },
  timerContainer: {
    flexDirection: 'row',
  },
  timerTextLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
  timerTextRight: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_LARGE ? 16 : 14,
  },
});

const mapStateToProps = (state) => {
  const props = {
    ...state.user,
    myQrData: state.connectQrData.myQrData,
  };
  return props;
};

export default connect(mapStateToProps)(MyCodeScreen);
