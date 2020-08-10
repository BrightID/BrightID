// @flow

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch } from 'react-redux';
import { rejectPendingConnection } from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { confirmPendingConnectionThunk } from '@/components/NewConnectionsScreens/actions/pendingConnectionThunks';
import { DEVICE_LARGE } from '@/utils/constants';
import checkGreen from '@/static/check_green.svg';
import xGrey from '@/static/x_grey.svg';

export const PendingConnectionCard = ({ pendingConnection }) => {
  const dispatch = useDispatch();
  const accept = () => {
    dispatch(confirmPendingConnectionThunk(pendingConnection.id));
  };

  const reject = () => {
    dispatch(rejectPendingConnection(pendingConnection.id));
  };

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
        <Text
          style={styles.invitationMsg}
          adjustsFontSizeToFit={true}
          numberOfLines={1}
        >
          sent you a connection request
        </Text>
      </View>
      <View style={styles.approvalButtonContainer}>
        <TouchableOpacity
          style={styles.greenCircle}
          onPress={accept}
          accessibilityLabel={`accept connection with ${pendingConnection.name}`}
          accessibilityRole="button"
        >
          <SvgXml
            xml={checkGreen}
            width={DEVICE_LARGE ? 20 : 17}
            height={DEVICE_LARGE ? 20 : 17}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.greyCircle}
          onPress={reject}
          accessibilityLabel={`reject connection with ${pendingConnection.name}`}
          accessibilityRole="button"
        >
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
    paddingBottom: DEVICE_LARGE ? 10 : 8,
    paddingTop: DEVICE_LARGE ? 10 : 8,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
  },
  photoContainer: {
    minWidth: DEVICE_LARGE ? 85 : 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    borderRadius: 100,
    width: DEVICE_LARGE ? 60 : 48,
    height: DEVICE_LARGE ? 60 : 48,
    backgroundColor: '#d8d8d8',
  },
  info: {
    marginLeft: DEVICE_LARGE ? 10 : 7,
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
    fontSize: DEVICE_LARGE ? 12 : 10,
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
    marginRight: 7,
  },
  approvalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // minWidth: 100,
  },
});

export default PendingConnectionCard;
