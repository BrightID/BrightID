// @flow

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { ConnectionStats } from './ConnectionStats';
import { DEVICE_LARGE } from '../../utils/constants';
import { ProfileCard } from './ProfileCard';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '../../utils/connectionLevelStrings';

type ReconnectViewProps = {
  pendingConnection: PendingConnection,
  existingConnection: connection,
  brightIdVerified: boolean,
  setLevelHandler: (level: ConnectionLevel) => any,
  abuseHandler: () => any,
};

export const ReconnectView = ({
  pendingConnection,
  existingConnection,
  brightIdVerified,
  setLevelHandler,
  abuseHandler,
}: ReconnectViewProps) => {
  const navigation = useNavigation();

  const photoTouchHandler = (photo: string, type: 'base64' | 'file') => {
    navigation.navigate('FullScreenPhoto', {
      photo,
      base64: type === 'base64',
    });
  };

  return (
    <>
      <View style={styles.header}>
        <Text style={styles.headerText}>Update existing connection</Text>
        <Text style={styles.subheaderText}>
          Last connection with {pendingConnection.name}:{' '}
          {moment(parseInt(existingConnection.createdAt, 10)).fromNow()}
        </Text>
      </View>
      <View style={styles.profiles}>
        <View style={[styles.profile, styles.verticalDivider]}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileHeaderText}>Old Profile</Text>
          </View>
          <ProfileCard
            name={existingConnection.name}
            photo={existingConnection.photo.filename}
            photoType="file"
            brightIdVerified={brightIdVerified}
            photoTouchHandler={photoTouchHandler}
            flagged={pendingConnection.flagged}
          />
        </View>
        <View style={styles.profile}>
          <View style={styles.profileHeader}>
            <Text style={styles.profileHeaderText}>New Profile</Text>
          </View>
          <ProfileCard
            name={pendingConnection.name}
            photo={pendingConnection.photo}
            photoType="base64"
            brightIdVerified={brightIdVerified}
            photoTouchHandler={photoTouchHandler}
            flagged={pendingConnection.flagged}
          />
        </View>
      </View>
      <View style={styles.countsContainer}>
        <ConnectionStats
          numConnections={pendingConnection.connections}
          numGroups={pendingConnection.groups}
          numMutualConnections={pendingConnection.mutualConnections}
        />
      </View>
      <View style={styles.connectionLevel}>
        <View style={styles.connectionLevelLabel}>
          <Text style={styles.connectionLevelLabelText}>
            Current connection level
          </Text>
        </View>
        <View style={styles.connectionLevel}>
          <Text
            style={[
              styles.connectionLevelText,
              { color: connectionLevelColors[existingConnection.level] },
            ]}
          >
            {connectionLevelStrings[existingConnection.level]}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.abuseButton}
          onPress={abuseHandler}
          testID="reportAbuseBtn"
        >
          <Text style={styles.abuseButtonLabel}>Report abuse</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => setLevelHandler(existingConnection.level)}
          testID="updateBtn"
        >
          <Text style={styles.updateButtonLabel}>Update connection</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: DEVICE_LARGE ? 18 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 22 : 18,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 24,
  },
  subheaderText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 15 : 12,
    textAlign: 'center',
    color: '#827F7F',
  },
  profiles: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
  },
  profileHeader: {
    marginTop: 15,
    marginBottom: 20,
  },
  profileHeaderText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 15 : 12,
    color: '#000',
  },
  profile: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: '#ED7A5D',
    height: '100%',
  },
  countsContainer: {
    width: '88%',
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: 8,
    marginBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ed7a5d',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  connectionLevel: {
    alignItems: 'center',
    marginBottom: 10,
  },
  connectionLevelLabel: {
    marginBottom: 5,
  },
  connectionLevelLabelText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000000',
  },
  connectionLevelText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 15 : 13,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '88%',
  },
  abuseButton: {
    backgroundColor: '#ED1B24',
    flex: 1,
    marginRight: 5,
    borderRadius: 60,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 9,
  },
  abuseButtonLabel: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#FFFFFF',
  },
  updateButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#ED7A5D',
    borderWidth: 1,
    borderRadius: 60,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 9,
  },
  updateButtonLabel: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#ED7A5D',
  },
});
