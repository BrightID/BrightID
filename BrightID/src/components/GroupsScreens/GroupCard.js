// @flow

import * as React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import RNFS from 'react-native-fs';
import { connect } from 'react-redux';
import moment from 'moment';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_TYPE } from '@/utils/constants';
import { getGroupName } from '@/utils/groups';
import GroupPhoto from './GroupPhoto';
/**
 * Group Card in the Groups Screen
 */

const ICON_SIZE = DEVICE_TYPE === 'large' ? 36 : 32;

class GroupCard extends React.PureComponent<Props> {
  
  setStatus = () => {
    const { group } = this.props;
    const status = group.status;
    console.log(group.aesKey, 22);
    if (status === 'initiated') {
      return (
        <View style={styles.membersContainer}>
          <Text style={styles.waitingMessage}>Waiting</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.membersContainer}>
          <Text style={styles.membersLeft}>Members: {group.members.length}</Text>
        </View>
      );
    }
  };

  render() {
    const { group } = this.props;
    return (
      <View style={styles.container}>
        <GroupPhoto group={group}/>
        <View style={styles.info}>
          <Text style={styles.name}>{getGroupName(group)}</Text>
          <this.setStatus />
        </View>
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
  membersContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  membersLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#9b9b9b',
    marginRight: 3,
    paddingTop: 1.5,
  },
  membersRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
  },
  waitingMessage: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 16,
    color: '#e39f2f',
  },
});

export default connect()(GroupCard);
