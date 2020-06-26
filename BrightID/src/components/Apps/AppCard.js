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
import store from '@/store';
import api from '@/Api/BrightId';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logoFile
 * @prop verified
 * @prop url
 */

type State = {
  hasSponsorships: boolean,
};

class AppCard extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      hasSponsorships: false,
    };
  }

  async componentDidMount() {
    try {
      const { name } = this.props;
      const contextInfo = await api.getContext(name);
      if (contextInfo.unusedSponsorships > 0) {
        this.setState({ hasSponsorships: true });
      }
    } catch (err) {
      console.log(err);
    }
  }

  openApp = () => {
    const { url } = this.props;
    Linking.openURL(url);
  };

  linkLabel = () => {
    const { state, result } = this.props;
    if (state === 'initiated') {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.waitingMessage}>Waiting</Text>
        </View>
      );
    } else if (state === 'failed') {
      const errorMessage = result
        ? `Not linked: ${result}.`
        : `Not Linked, try again`;
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>{errorMessage}</Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  verificationLabel = () => {
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

  sponsorshipLabel = () => {
    const {
      user: { isSponsored },
    } = store.getState();
    if (!isSponsored && this.state.hasSponsorships) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.sponsorshipMessage}>Has sponsorships</Text>
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
          <this.sponsorshipLabel />
          <this.verificationLabel />
          <this.linkLabel />
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
  sponsorshipMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#4a90e2',
  },
  waitingMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#e39f2f',
  },
  errorMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
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
