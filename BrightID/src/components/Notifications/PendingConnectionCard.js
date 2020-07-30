// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { DEVICE_LARGE } from '@/utils/constants';
import checkGreen from '@/static/check_green.svg';
import xGrey from '@/static/x_grey.svg';

export const PendingConnectionCard = ({ pendingConnection }) => {
  return (
    <View style={styles.container}>
      <View style={styles.photoContainer}>
        <Image
          source={{ uri: pendingConnection.photo }}
          style={styles.photo}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="user photo"
        />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{pendingConnection.name}</Text>
        <Text style={styles.invitationMsg}>sent you a connection request</Text>
      </View>
      <View style={styles.approvalButtonContainer}>
        <TouchableOpacity style={styles.greenCircle}>
          <SvgXml
            xml={checkGreen}
            width={DEVICE_LARGE ? 20 : 17}
            height={DEVICE_LARGE ? 20 : 17}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.greyCircle}>
          <SvgXml
            xml={xGrey}
            width={DEVICE_LARGE ? 15 : 12}
            height={DEVICE_LARGE ? 15 : 12}
          />
        </TouchableOpacity>
      </View>
    </View>
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
  photo: {
    borderRadius: 100,
    width: DEVICE_LARGE ? 60 : 32,
    height: DEVICE_LARGE ? 60 : 32,
    backgroundColor: '#d8d8d8',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 10 : 8,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 71 : 65,
  },
  name: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  invitationMsg: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 11,
    color: '#B64B32',
  },
  greenCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#5DEC9A',
  },
  greyCircle: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 40 : 32,
    height: DEVICE_LARGE ? 40 : 32,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#707070',
    marginLeft: 7,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    minWidth: 100,
  },
});

export default PendingConnectionCard;
