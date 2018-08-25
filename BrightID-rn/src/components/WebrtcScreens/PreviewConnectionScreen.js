// @flow

import * as React from 'react';
import {
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import { addConnection, resetWebrtc, resetPreview } from '../../actions';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

type Props = {
  dispatch: Function,
  previewNameornym: string,
  previewTimestamp: number,
  previewPublicKey: Uint8Array,
  previewTrustScore: string,
  previewAvatar: string,
  navigation: { goBack: Function, navigate: (string) => null },
};

type State = {};

class PreviewConnectionScreen extends React.Component<Props, State> {
  static navigationOptions = {
    title: 'New Connection',
    headerRight: <View />,
  };

  addNewConnection = async () => {
    /**
     * Add connection in async storage  &&
     * Clear the redux store of all leftoverwebrtc data
     */
    try {
      const {
        dispatch,
        previewPublicKey,
        previewNameornym,
        previewAvatar,
        previewTrustScore,
        previewTimestamp,
      } = this.props;

      // TODO formalize spec for this
      // create a new connection object
      const connection = {
        publicKey: previewPublicKey,
        nameornym: previewNameornym,
        avatar: previewAvatar,
        trustScore: previewTrustScore,
        connectionDate: previewTimestamp / 1000, // hack for moment,
      };
      // add connection inside of async storage
      await AsyncStorage.setItem(
        connectPublicKey.toString(),
        JSON.stringify(connection),
      );
      // reset Preview
      dispatch(resetPreview());
      // clear webrtc data
      dispatch(resetWebrtc());
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { previewNameornym, navigation, previewAvatar } = this.props;
    const image = previewAvatar || require('../../static/default_avatar.jpg');
    return (
      <View style={styles.container}>
        <View style={styles.questionTextContainer}>
          <Text style={styles.questionText}>Is this who you are trying</Text>
          <Text style={styles.questionText}>to connect with?</Text>
        </View>
        <View style={styles.userContainer}>
          <Image
            source={image}
            style={styles.userAvatar}
            resizeMode="cover"
            onError={(e) => {
              console.log(e.error);
            }}
            accessible={true}
            accessibilityLabel="user avatar image"
          />
          <Text style={styles.connectNameornym}>{previewNameornym}</Text>
        </View>
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            onPress={async () => {
              await this.addNewConnection();
              navigation.navigate('ConnectSuccess');
            }}
            style={styles.confirmButton}
          >
            <Text style={styles.confirmButtonText}>Confirm Connection</Text>
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
  questionTextContainer: {
    // flex: 1,
    marginTop: 83,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    // flex: 1,
    // marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatar: {
    width: 148,
    height: 148,
    borderRadius: 74,
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
    height: 51,
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

export default connect((state) => state.main)(PreviewConnectionScreen);
