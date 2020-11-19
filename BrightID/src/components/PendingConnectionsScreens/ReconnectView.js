// @flow

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { ConnectionStats } from './ConnectionStats';
import { ProfileCard } from './ProfileCard';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '../../utils/connectionLevelStrings';
import { retrieveImage } from '../../utils/filesystem';

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
  const [identicalProfile, setIdenticalProfile] = useState(true);

  useEffect(() => {
    const compareProfiles = async () => {
      if (pendingConnection.name !== existingConnection.name) {
        setIdenticalProfile(false);
        return;
      }
      const existingPhoto = await retrieveImage(
        existingConnection.photo.filename,
      );
      if (existingPhoto !== pendingConnection.photo) {
        setIdenticalProfile(false);
        return;
      }
      // name and photo are equal
      setIdenticalProfile(true);
    };
    compareProfiles();
  }, [pendingConnection, existingConnection]);

  const photoTouchHandler = (photo: string, type: 'base64' | 'file') => {
    navigation.navigate('FullScreenPhoto', {
      photo,
      base64: type === 'base64',
    });
  };

  if (identicalProfile) {
    return (
      <>
        <View style={styles.header} testID="ReconnectScreen">
          <Text style={styles.headerText}>Connection Request</Text>
          <Text style={styles.subheaderText}>
            You already connected with {pendingConnection.name}
          </Text>
          <Text style={styles.lastConnectedText}>
            Last connected{' '}
            {moment(parseInt(existingConnection.createdAt, 10)).fromNow()}
          </Text>
        </View>
        <View style={styles.profiles}>
          <View testID="identicalProfileView" style={styles.profile}>
            <ProfileCard
              name={pendingConnection.name}
              photo={pendingConnection.photo}
              photoSize="large"
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
            style={styles.updateButton}
            onPress={() => setLevelHandler(existingConnection.level)}
            testID="updateBtn"
          >
            <Text style={styles.updateButtonLabel}>Reconnect</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  } else {
    return (
      <>
        <View style={styles.header} testID="ReconnectScreen">
          <Text style={styles.headerText}>Connection Request</Text>
          <Text style={styles.subheaderText}>
            You already connected with this account
          </Text>
          <Text style={styles.lastConnectedText}>
            Last connected{' '}
            {moment(parseInt(existingConnection.createdAt, 10)).fromNow()}
          </Text>
        </View>

        <View style={styles.profiles}>
          <View
            testID="oldProfileView"
            style={[styles.profile, styles.verticalDivider]}
          >
            <View style={styles.profileHeader}>
              <Text style={styles.profileHeaderText}>Old Profile</Text>
            </View>
            <ProfileCard
              name={existingConnection.name}
              photo={existingConnection.photo.filename}
              photoSize="small"
              photoType="file"
              brightIdVerified={brightIdVerified}
              photoTouchHandler={photoTouchHandler}
              flagged={pendingConnection.flagged}
            />
          </View>
          <View testID="newProfileView" style={styles.profile}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileHeaderText}>New Profile</Text>
            </View>
            <ProfileCard
              name={pendingConnection.name}
              photo={pendingConnection.photo}
              photoSize="small"
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
            <Text style={styles.abuseButtonLabel}>Report connection</Text>
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
  }
};

const styles = StyleSheet.create({
  header: {
    marginTop: DEVICE_LARGE ? 18 : 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 22 : 18,
    textAlign: 'center',
    color: '#000000',
    marginBottom: 20,
  },
  subheaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 15 : 12,
    textAlign: 'center',
    color: '#827F7F',
  },
  lastConnectedText: {
    fontFamily: 'Poppins-Bold',
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
    fontFamily: 'Poppins-Bold',
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
    marginBottom: 10,
  },
  connectionLevelLabelText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 15 : 13,
    color: '#000000',
  },
  connectionLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 15 : 13,
    marginBottom: 10,
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
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
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
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#ED7A5D',
  },
});
