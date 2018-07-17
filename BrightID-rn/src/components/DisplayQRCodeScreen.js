// @flow

import * as React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import qrcode from 'qrcode';
import { connect } from 'react-redux';

/**
 * Connection screen of BrightID
 */

type Props = {};

type State = {
  qrsvg: string,
};

class DisplayQRCodeScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'QR Code',
    headerRight: <View />,
  };
  state = {
    qrsvgd: '',
    qrsvg: '',
  };
  componentDidMount() {
    qrcode.toString('it works!', (err, qrsvg) => {
      if (err) throw err;
      this.parseSVG(qrsvg);
      this.setState({ qrsvg });
    });
  }
  parseSVG = (qrsvg) => {
    // obtain the second path's d
    // use only what's inside the quotations
    const dinx = qrsvg.lastIndexOf('d');
    const dpath = qrsvg.substr(dinx);
    const qrsvgd = dpath.match(/"([^"]+)"/g)[0].split('"')[1];
    this.setState({ qrsvgd });
  };
  render() {
    return (
      <View style={styles.container}>
        <Text>User Key</Text>
        <Svg height="150" width="150" viewBox="0 0 29 29">
          <Path fill="#fff" d="M0 0h29v29H0z" />
          <Path stroke="#000" d={this.state.qrsvgd} />
        </Svg>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
});

export default connect((state) => state.main)(DisplayQRCodeScreen);
