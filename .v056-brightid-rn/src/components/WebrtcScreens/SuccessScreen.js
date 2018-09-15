// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';

/**
 * Successfly Added Connection Confirmation Screen of BrightID
 *
==================================================================
 *
 */

type Props = {
  publicKey: Uint8Array,
  trustScore: string,
  userAvatar: string,
  nameornym: string,
  dispatch: Function,
  navigation: { goBack: Function, navigate: (string) => null },
};

type State = {};

class SuccessScreen extends React.Component<Props, State> {
  static navigationOptions = {
    headerBackTitle: ' ',
    header: null,
  };

  componentDidMount() {
    console.log('Success Screen Mounting');
  }

  componentWillUnmount() {
    console.log('Success Screen Unmounting');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.successTextContainer}>
          <Text style={styles.successText}>Connection Successful!</Text>
          <Image
            source={require('../../static/success.png')}
            style={styles.successImage}
            resizeMode="cover"
            onError={(e) => {
              console.log(e.error);
            }}
            accessible={true}
            accessibilityLabel="user avatar image"
          />
        </View>

        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              const { navigation } = this.props;
              navigation.navigate('Home');
            }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  successTextContainer: {
    // flex: 1,
    marginTop: 131,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  successImageContainer: {
    // flex: 1,
    // marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successImage: {
    width: 170,
    height: 170,
    marginTop: 42,
  },
  connectNameornym: {
    fontFamily: 'ApexNew-Book',
    marginTop: 15,
    fontSize: 30,
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
  confirmButtonContainer: {
    // flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: '82%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  confirmButtonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
});

export default connect((state) => state.main)(SuccessScreen);
