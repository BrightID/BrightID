// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import Ionicon from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import emitter from '../../emitter';
import { fakeJoinGroups } from '../../actions/fakeGroup';
import { toggleNewGroupCoFounder } from '../GroupsScreens/actions';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop trustScore
 * @prop connectionTime
 * @prop avatar
 */

type Props = {
  nameornym: string,
  avatar: string,
  trustScore: string,
  connectionDate: string,
  publicKey: string,
  style: {},
  selected: boolean,
  groups: boolean,
};

class ConnectionCard extends React.PureComponent<Props> {
  handleUserOptions = () => {
    const { nameornym, publicKey, secretKey, dispatch } = this.props;

    const buttons = [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          emitter.emit('removeConnection', publicKey);
        },
      }
    ];

    if(__DEV__){
      buttons.push({
        text: 'Join All Groups',
        onPress: () => {
          dispatch(fakeJoinGroups({ publicKey, secretKey }));
        },
      })
    }

    Alert.alert(
      `Delete Connection`,
      `Are you sure you want to remove ${nameornym} from your list of connections?`,
      buttons,
      { cancelable: true },
    );
  };

  trustScoreColor = () => {
    const { trustScore } = this.props;
    if (parseFloat(trustScore) >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  render() {
    const { avatar, nameornym, trustScore, connectionDate, style } = this.props;

    return (
      <View style={{ ...styles.container, ...style }}>
        <Image
          source={avatar || require('../../static/default_avatar.jpg')}
          style={styles.avatar}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{nameornym}</Text>
          <View style={styles.trustScoreContainer}>
            <Text style={styles.trustScoreLeft}>Score:</Text>
            <Text style={[styles.trustScoreRight, this.trustScoreColor()]}>
              {trustScore}
            </Text>
          </View>
          <Text style={styles.connectedText}>
            Connected {moment(parseInt(connectionDate, 10)).fromNow()}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.moreIcon}
          onPress={this.handleUserOptions}
        >
          <Ionicon size={48} name="ios-more" color="#ccc" />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    height: 94,
    marginBottom: 11.8,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  avatar: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: 71,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 20,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  trustScoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  trustScoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 12,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect()(ConnectionCard);
