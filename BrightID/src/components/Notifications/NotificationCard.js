// @flow

import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { DEVICE_LARGE } from '@/utils/constants';

/**
 * Notification Card in the Notifications Screen
 * each Notification should have:
 * @prop msg
 * @prop icon
 */

const NotificationCard = (props) => {
  const { navigation, msg, icon } = props;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        navigation.navigate('TrustedConnections');
      }}
    >
      <View style={styles.photoContainer} />
      <View style={styles.info}>
        <Text style={styles.name}>Backup BrightID</Text>
        <Text style={styles.invitationMsg}>
          Choose your trusted connections
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    backgroundColor: '#fff',
    borderBottomColor: '#e3e0e4',
    borderBottomWidth: 1,
    paddingBottom: 10,
    paddingTop: 10,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: 85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 15 : 12,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 71 : 65,
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 18 : 15,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#B64B32',
  },
});

export default connect()(NotificationCard);
