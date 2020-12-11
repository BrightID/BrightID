// @flow

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK, DARKER_GREY, ORANGE, RED, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { ConnectionStats } from './ConnectionStats';
import { ProfileCard } from './ProfileCard';
import {
  connectionLevelColors,
  connectionLevelStrings,
} from '../../utils/connectionLevelStrings';
import { retrieveImage } from '../../utils/filesystem';

// percentage determines reported warning
const REPORTED_PERCENTAGE = 0.1;

type ReconnectViewProps = {
  pendingConnection: PendingConnection,
  existingConnection: connection,
  setLevelHandler: (level: ConnectionLevel) => any,
  abuseHandler: () => any,
};

export const ReconnectView = ({
  pendingConnection,
  existingConnection,
  setLevelHandler,
  abuseHandler,
}: ReconnectViewProps) => {
  const navigation = useNavigation();
  const [identicalProfile, setIdenticalProfile] = useState(true);
  const { t } = useTranslation();

  const reported =
    pendingConnection.reports.length /
      (pendingConnection.connectionsNum || 1) >=
    REPORTED_PERCENTAGE;
  const brightIdVerified = pendingConnection.verifications
    .map((v) => v.name)
    .includes('BrightID');

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
          <Text style={styles.headerText}>
            {t('pendingConnections.title.connectionRequest')}
          </Text>
          <Text style={styles.subheaderText}>
            {t('connections.text.alreadyConnectedWith', {
              name: pendingConnection.name,
            })}
          </Text>
          <Text style={styles.lastConnectedText}>
            {t('connections.tag.lastConnected', {
              date: moment(
                parseInt(pendingConnection.connectedAt, 10),
              ).fromNow(),
            })}
          </Text>
        </View>
        <View style={styles.profiles}>
          <View testID="identicalProfileView" style={styles.profile}>
            <ProfileCard
              name={pendingConnection.name}
              photo={pendingConnection.photo}
              photoSize="large"
              photoType="base64"
              verified={brightIdVerified}
              photoTouchHandler={photoTouchHandler}
              reported={reported}
            />
          </View>
        </View>
        <View style={styles.countsContainer}>
          <ConnectionStats
            connectionsNum={pendingConnection.connectionsNum}
            groupsNum={pendingConnection.groupsNum}
            mutualConnectionsNum={pendingConnection.mutualConnections.length}
          />
        </View>
        <View style={styles.connectionLevel}>
          <View style={styles.connectionLevelLabel}>
            <Text style={styles.connectionLevelLabelText}>
              {t('connections.label.currentConnectionLevel')}
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
            <Text style={styles.updateButtonLabel}>
              {t('connections.button.reconnect')}
            </Text>
          </TouchableOpacity>
        </View>
      </>
    );
  } else {
    return (
      <>
        <View style={styles.header} testID="ReconnectScreen">
          <Text style={styles.headerText}>
            {t('pendingConnections.title.connectionRequest')}
          </Text>
          <Text style={styles.subheaderText}>
            {t('connections.text.alreadyConnectedWith')}
          </Text>
          <Text style={styles.lastConnectedText}>
            {t('connections.tag.lastConnected', {
              date: moment(
                parseInt(existingConnection.createdAt, 10),
              ).fromNow(),
            })}
          </Text>
        </View>

        <View style={styles.profiles}>
          <View
            testID="oldProfileView"
            style={[styles.profile, styles.verticalDivider]}
          >
            <View style={styles.profileHeader}>
              <Text style={styles.profileHeaderText}>
                {t('connections.label.oldProfile')}
              </Text>
            </View>
            <ProfileCard
              name={existingConnection.name}
              photo={existingConnection.photo.filename}
              photoSize="small"
              photoType="file"
              verified={brightIdVerified}
              photoTouchHandler={photoTouchHandler}
              reported={reported}
            />
          </View>
          <View testID="newProfileView" style={styles.profile}>
            <View style={styles.profileHeader}>
              <Text style={styles.profileHeaderText}>
                {t('connections.label.newProfile')}
              </Text>
            </View>
            <ProfileCard
              name={pendingConnection.name}
              photo={pendingConnection.photo}
              photoSize="small"
              photoType="base64"
              verified={brightIdVerified}
              photoTouchHandler={photoTouchHandler}
              reported={reported}
            />
          </View>
        </View>
        <View style={styles.countsContainer}>
          <ConnectionStats
            connectionsNum={pendingConnection.connectionsNum}
            groupsNum={pendingConnection.groupsNum}
            mutualConnectionsNum={pendingConnection.mutualConnections.length}
          />
        </View>
        <View style={styles.connectionLevel}>
          <View style={styles.connectionLevelLabel}>
            <Text style={styles.connectionLevelLabelText}>
              {t('connections.label.currentConnectionLevel')}
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
            <Text style={styles.abuseButtonLabel}>
              {t('connections.button.reportConnection')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() => setLevelHandler(existingConnection.level)}
            testID="updateBtn"
          >
            <Text style={styles.updateButtonLabel}>
              {t('connections.button.updateConnection')}
            </Text>
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
    fontSize: fontSize[22],
    textAlign: 'center',
    color: BLACK,
    marginBottom: 20,
  },
  subheaderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    textAlign: 'center',
    color: DARKER_GREY,
  },
  lastConnectedText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[15],
    textAlign: 'center',
    color: DARKER_GREY,
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
    fontSize: fontSize[15],
    color: BLACK,
  },
  profile: {
    flex: 1,
    alignItems: 'center',
  },
  verticalDivider: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: ORANGE,
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
    borderColor: ORANGE,
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
    fontSize: fontSize[15],
    color: BLACK,
  },
  connectionLevelText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    width: '88%',
  },
  abuseButton: {
    backgroundColor: RED,
    flex: 1,
    marginRight: 5,
    borderRadius: 60,
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 9,
  },
  abuseButtonLabel: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: WHITE,
  },
  updateButton: {
    backgroundColor: WHITE,
    borderColor: ORANGE,
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
    fontSize: fontSize[14],
    color: ORANGE,
  },
});
