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
import api from '@/api/brightId';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logo
 * @prop url
 */

class AppCard extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
  }

  openApp = () => {
    const { url } = this.props;
    Linking.openURL(url);
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
    if (!isSponsored && this.props.unusedSponsorships > 0) {
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
    const { id, logo, name, isLinked, style } = this.props;
    const linkedId = `Linked_${id}`;

    return (
      <View style={{ ...styles.container, ...style }}>
        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Image
            source={{
              uri: `${logo}`,
            }}
            style={styles.logo}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.link} onPress={this.openApp}>
          <Text style={styles.name}>{name}</Text>
          <this.sponsorshipLabel />
          <this.verificationLabel />
        </TouchableOpacity>

        {isLinked && (
          <View style={styles.linkedContainer}>
            <Ionicon
              size={48}
              name="md-checkmark"
              color="#4a90e2"
            />
            <Text
              testID={linkedId}
              style={styles.linkedMessage}
            >Linked</Text>
          </View>
        )}
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
  linkedMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#4a90e2',
  },
  errorMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: '#FF0800',
  },
  linkedContainer: {
    marginLeft: 'auto',
    marginRight: 20,
  },
  link: {},
});

export default connect()(AppCard);
