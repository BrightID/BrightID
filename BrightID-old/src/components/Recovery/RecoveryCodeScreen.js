// @flow

import * as React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { connect } from 'react-redux';
import { parseString } from 'xml2js';
import { path } from 'ramda';
import Spinner from 'react-native-spinkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import backupApi from '../../Api/BackupApi';
import { setupRecovery, recoveryQrStr, handleSigs } from './helpers';

/**
 * Recovery Code screen of BrightID
 *
 * displays a qrcode
 */

type State = {
  copied: boolean,
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

  checkIntervalId: IntervalID;

  sigs = {};

  state = {
    qrsvg: '',
    copied: false,
  };

  componentDidMount() {
    try {
      const { navigation } = this.props;
      navigation.addListener('willFocus', () => {
        setupRecovery();
        qrcode.toString(recoveryQrStr(), this.handleQrString);
      });
      navigation.addListener('willFocus', this.waitForSigs);
      navigation.addListener('willBlur', () => {
        clearInterval(this.checkIntervalId);
      });
    } catch (err) {
      console.warn(err.message);
    }
  }

  waitForSigs = () => {
    this.checkIntervalId = setInterval(() => {
      backupApi
        .getSig()
        .then(handleSigs)
        .then((ready) => {
          if (ready) this.props.navigation.navigate('Restore');
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
    Clipboard.setString(recoveryQrStr());
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

export default connect((state: state) => state)(RecoveryCodeScreen);
