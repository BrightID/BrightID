// @flow

import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { deleteApp } from './model';
import store from '@/store';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logoFile
 * @prop verified
 * @prop url
 */

class AppCard extends React.PureComponent<Props> {
  openApp = () => {
    const { url } = this.props;
    Linking.openURL(url);
  };

  setStatus = () => {
    const { state } = this.props;
    if (state === 'initiated') {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.waitingMessage}>Waiting</Text>
        </View>
      );
    } else if (state === 'failed') {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>Not Linked, try again</Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  setVerification = () => {
    const {
      user: { verifications },
    } = store.getState();
    const { verification } = this.props;
    if (!verifications.includes(verification)) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>Not verified for this app</Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  render() {
    const { logoFile, name, verified, style, handleAction } = this.props;

    return (
      <View style={{ ...styles.container, ...style }}>
        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Image
            source={{
              uri: `file://${RNFS.DocumentDirectoryPath}/photos/${logoFile}`,
            }}
            style={styles.logo}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Text style={styles.name}>{name}</Text>
          <this.setVerification />
          <this.setStatus />
        </TouchableOpacity>

        {verified && (
          <Ionicon
            size={24}
            name="ios-star"
            color="#de8"
            style={styles.verifiedIcon}
          />
        )}

        <TouchableOpacity
          style={styles.deleteIcon}
          onPress={handleAction(name)}
        >
          <Ionicon size={24} name="ios-trash" color="#cb9" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginTop: 12,
    marginBottom: 12,
  },
  logo: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    color: 'black',
    fontSize: 24,
    marginLeft: 20,
  },
  stateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 20,
  },
  waitingMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#e39f2f',
  },
  errorMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#FF0800',
  },
  verifiedIcon: {
    marginLeft: 10,
  },
  deleteIcon: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  link: {},
});

export default connect()(AppCard);
