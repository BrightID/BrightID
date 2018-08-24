// @flow

import * as React from 'react';
import {
  Alert,
  AsyncStorage,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import Touchable from 'react-native-platform-touchable';
import Ionicon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import { removeConnection } from '../actions';

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
  dispatch: Function,
};

class ConnectionCard extends React.Component<Props> {
  handleUserOptions = () => {
    const { nameornym } = this.props;
    Alert.alert(
      'Delete connection',
      `Are you sure you want to remove ${nameornym} from your list of connections? Your decision is irreversable.`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: this.removeUser },
      ],
      { cancelable: true },
    );
  };

  removeUser = async () => {
    try {
      const { publicKey, dispatch } = this.props;
      // update redux store
      dispatch(removeConnection(publicKey));
      // remove connection from async storage
      await AsyncStorage.removeItem(publicKey.toString());
    } catch (err) {
      console.log(err);
    }
  };

  render() {
    const { avatar, nameornym, trustScore, connectionDate } = this.props;
    const image = avatar
      ? { uri: avatar }
      : require('../static/default_avatar.jpg');
    return (
      <View style={styles.container}>
        <Image source={image} style={styles.avatar} />
        <View style={styles.info}>
          <Text style={styles.name}>{nameornym}</Text>
          <Text style={styles.trustScore}>{trustScore}% Trusted</Text>
          <Text style={styles.connectedText}>
            Connected {moment.unix(parseInt(connectionDate, 10)).fromNow()}
          </Text>
        </View>
        <Touchable style={styles.moreIcon} onPress={this.handleUserOptions}>
          <Ionicon size={48} name="ios-more" color="#ccc" />
        </Touchable>
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
    // width: "50%"
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
