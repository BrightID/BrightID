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
import { uInt8ArrayToB64, objToUint8 } from '../../utils/encoding';
import api from '../../Api/BrightId';
import backupApi from '../../Api/BackupApi';

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


  state = {
    qrsvg: '',
    copied: false,
    checkIntervalId: 0,
  };

  async componentDidMount() {
    const recoveryKeys = await AsyncStorage.getItem('recoveryKeys');
    if (recoveryKeys !== null) {
      var { publicKey, secretKey } = JSON.parse(recoveryKeys);
      secretKey = objToUint8(secretKey);
      qrcode.toString("Recovery_" + publicKey, this.handleQrString);
    } else {
      var { publicKey, secretKey } = nacl.sign.keyPair();
      publicKey = uInt8ArrayToB64(publicKey);
      AsyncStorage.setItem(
        'recoveryKeys',
        JSON.stringify({ publicKey, secretKey })
      );
      qrcode.toString("Recovery_" + publicKey, this.handleQrString);
    }
    this.waitForRecovery(publicKey, secretKey);
  }

  componentWillUnmount() {
    clearInterval(this.state.checkIntervalId);
  }

  waitForRecovery(publicKey, secretKey) {
    const { navigation } = this.props;
    const checkIntervalId = setInterval(() => {
      api.getUserInfo(publicKey, secretKey).then((res) => {
        clearInterval(checkIntervalId);
        navigation.navigate('Restore', {
          oldKeys: res.oldKeys, 
          publicKey: publicKey, 
          secretKey: secretKey
        });
      });
    }, 3000);
    this.setState({ checkIntervalId });
  }

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
      recoveryKeys: { publicKey },
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
