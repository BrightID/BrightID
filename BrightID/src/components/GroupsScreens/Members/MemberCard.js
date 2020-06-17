// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import moment from 'moment';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { DEVICE_TYPE } from '@/utils/constants';
import store from '@/store';

/**
 * Connection Card in the Connections Screen
 * is created from an array of connections
 * each connection should have:
 * @prop name
 * @prop score
 * @prop connectionTime
 * @prop photo
 */

class MemberCard extends React.PureComponent<Props> {
  scoreColor = () => {
    const { score } = this.props;
    if (score >= 85) {
      return { color: '#139c60' };
    } else {
      return { color: '#e39f2f' };
    }
  };

  render() {
    const {
      id,
      photo,
      name,
      score,
      connectionDate,
      style,
      menuHandler,
      isAdmin,
      flaggers,
    } = this.props;
    const { user } = store.getState();
    console.log('flaggers', flaggers);
    const flags = flaggers && Object.keys(flaggers);
    const flagged = isAdmin && flaggers && flags.length > 0;
    return (
      <View style={{ ...styles.container, ...style }}>
        <Image
          source={{
            uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
          }}
          style={styles.photo}
        />
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLeft}>Score:</Text>
            <Text style={[styles.scoreRight, this.scoreColor()]}>{score}</Text>
            {flagged && <Text style={styles.flagged}> (flagged)</Text>}
          </View>
          {connectionDate && (
            <Text style={styles.connectedText}>
              Connected {moment(parseInt(connectionDate, 10)).fromNow()}
            </Text>
          )}
        </View>
        {isAdmin && user.id != id && (
          <TouchableOpacity
            style={styles.moreIcon}
            onPress={() => menuHandler(this.props)}
          >
            <Ionicon size={48} name="ios-close" color="#ccc" />
          </TouchableOpacity>
        )}
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
    height: DEVICE_TYPE === 'large' ? 94 : 80,
    marginBottom: DEVICE_TYPE === 'large' ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  photo: {
    borderRadius: 30,
    width: 60,
    height: 60,
    marginLeft: 14,
  },
  info: {
    marginLeft: 25,
    flex: 1,
    height: DEVICE_TYPE === 'large' ? 71 : 65,
    flexDirection: 'column',
    justifyContent: 'space-evenly',
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: DEVICE_TYPE === 'large' ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  flagged: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 14,
    color: 'red',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  scoreRight: {
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

export default connect()(MemberCard);
