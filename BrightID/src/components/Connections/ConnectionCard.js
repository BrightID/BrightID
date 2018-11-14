// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import moment from 'moment';
import Ionicon from 'react-native-vector-icons/Ionicons';

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
  renderActionComponent: () => React.Component,
  publicKey: string,
  style: {},
};

class ConnectionCard extends React.Component<Props> {
  render() {
    const {
      avatar,
      nameornym,
      trustScore,
      connectionDate,
      publicKey,
      style,
    } = this.props;
    const image = avatar
      ? { uri: avatar }
      : require('../../static/default_avatar.jpg');
    return (
      <View style={{ ...styles.container, ...style }}>
        <Image source={image} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{nameornym}</Text>
          <Text style={styles.trustScore}>{trustScore}% Trusted</Text>
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
  trustScore: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: 'green',
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
  },
  moreIcon: {
    marginRight: 16,
  },
});

export default connect(null)(ConnectionCard);
