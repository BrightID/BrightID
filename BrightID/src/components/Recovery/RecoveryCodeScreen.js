// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
  AsyncStorage
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import emitter from '../../emitter';
import store from '../../store';
import nacl from 'tweetnacl';
import { uInt8ArrayToB64 } from '../../utils/encoding';
import api from '../../Api/BrightId';

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
  checkIntervalId: number,
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

class RecoveryCodeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'Recovery Code',
  };

  checkIntervalId = 0;
  sigs = {};

  state = {
    qrsvg: '',
    copied: false,
  };

  async componentDidMount() {
    const recoveryData = await AsyncStorage.getItem('recoveryData');
    if (recoveryData !== null) {
      var { publicKey, secretKey, timestamp, sigs } = JSON.parse(recoveryData);
      this.sigs = sigs;
    } else {
      const timestamp = Date.now();
      var { publicKey, secretKey } = nacl.sign.keyPair();
      publicKey = uInt8ArrayToB64(publicKey);
      secretKey = uInt8ArrayToB64(secretKey);
      AsyncStorage.setItem(
        'recoveryData',
        JSON.stringify({ publicKey, secretKey, timestamp, sigs: {} })
      );
    }
    const qrStr = "Recovery_" + JSON.stringify({ publicKey, timestamp });
    qrcode.toString(qrStr, this.handleQrString);
    this.waitForSigs(publicKey);
  }

  componentWillUnmount() {
    clearInterval(this.checkIntervalId);
  }

  processSigs = async () => {
    let recoveryData = await AsyncStorage.getItem('recoveryData');
    recoveryData = JSON.parse(recoveryData);
    const sigs = Object.values(this.sigs).map((sig) => {
      return { id: sig.signer, sig: sig.sig}
    });
    try {
      await api.setSigningKey(recoveryData.id, recoveryData.publicKey, sigs, recoveryData.timestamp);
      navigation.navigate('Restore', recoveryData);
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  waitForSigs = async (publicKey) => {
    const { navigation } = this.props;
    const ipAddress = await api.ip();
    let recoveryData = await AsyncStorage.getItem('recoveryData');
    recoveryData = JSON.parse(recoveryData);
    this.checkIntervalId = setInterval(() => {
      fetch(`http://${ipAddress}/profile/download/${publicKey}`).then((res) => {
        if (res.status === 200 && res.json()) {
          const data = res.json();
          if (this.sigs[data.signer] &&
              this.sigs[data.signer].sig == data.sig &&
              this.sigs[data.signer].id == data.id) {
            return;
          }
          this.sigs[data.signer] = data;
          recoveryData.sigs = this.sigs;
          recoveryData.id = data.id;
          AsyncStorage.setItem('recoveryData', JSON.stringify(recoveryData));
          if (Object.keys(this.sigs).length > 1) {
            this.processSigs();
          } else {
            Alert.alert('Info', 'One of your trusted connection signed your request');
          }
        }
      }).catch((err) => {
        console.log(err);
      });
    }, 3000);
  };

  handleQrString = (err, qr) => {
    if (err) return console.log(err);
    parseString(qr, this.parseQrString);
  };

  parseQrString = (err, qrsvg) => {
    if (err) return console.log(err);
    this.setState({ qrsvg });
  };

  copyQr = () => {
    const {
      recoveryData: { publicKey },
    } = store.getState().main;
    Clipboard.setString('Recovery_' + publicKey);
    this.setState({ copied: true });
  };

  renderCopyQr = () => (
    <TouchableOpacity style={styles.copyContainer} onPress={this.copyQr}>
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

  renderQrCode = () => (
    <View style={[styles.qrsvgContainer]}>
      <Svg
        height="212"
        width="212"
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
          <Text style={styles.recoveryCodeInfoText}>
            Ask your trusted connections to scan this code.
          </Text>
        </View>
        <View style={styles.bottomHalf}>
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
    height: '25%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomHalf: {
    height: '75%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recoveryCodeInfoText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#4a4a4a',
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
});

export default connect((state: state) => state.main)(RecoveryCodeScreen);
