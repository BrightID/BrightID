import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import moment from 'moment';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { BLACK, DARKER_GREY, ORANGE, RED, WHITE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import TrustlevelSlider from '@/components/Connections/TrustlevelSlider';
import { retrieveImage } from '@/utils/filesystem';
import {
  connection_levels,
  RECOVERY_COOLDOWN_DURATION,
} from '@/utils/constants';
import { calculateCooldownPeriod } from '@/utils/recovery';
import { useSelector } from 'react-redux';
import { recoveryConnectionsSelector } from '@/reducer/connectionsSlice';
import { ConnectionStats } from './ConnectionStats';
import { ProfileCard } from './ProfileCard';

// percentage determines reported warning
const REPORTED_PERCENTAGE = 0.1;
// Reported is currently not displayed inside of the reconnect view

type ReconnectViewProps = {
  pendingConnection: PendingConnection;
  existingConnection: Connection;
  setLevelHandler: (level: ConnectionLevel) => any;
  abuseHandler: () => any;
};

export const ReconnectView = ({
  pendingConnection,
  existingConnection,
  setLevelHandler,
  abuseHandler,
}: ReconnectViewProps) => {
  const navigation = useNavigation();
  const recoveryConnections = useSelector(recoveryConnectionsSelector);
  const [identicalProfile, setIdenticalProfile] = useState(true);
  const [connectionLevel, setConnectionLevel] = useState(
    existingConnection.level,
  );
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

  const updateLevel = () => {
    let cooldownPeriod = 0;
    if (existingConnection.level !== connectionLevel) {
      // user changed level. Check if recovery level was added or removed.
      if (connectionLevel === connection_levels.RECOVERY) {
        // adding recovery connection. check if cooldown period applies
        cooldownPeriod = calculateCooldownPeriod({
          recoveryConnections,
          connection: existingConnection,
        });
      } else if (existingConnection.level === connection_levels.RECOVERY) {
        // removing recovery connection. Cooldown period always applies.
        cooldownPeriod = RECOVERY_COOLDOWN_DURATION;
      }
    }
    if (cooldownPeriod > 0) {
      // show info about cooldown period
      navigation.navigate('RecoveryCooldownInfo', {
        connectionId: existingConnection.id,
        cooldownPeriod,
        successCallback: () => {
          setLevelHandler(connectionLevel);
        },
      });
    } else {
      setLevelHandler(connectionLevel);
    }
  };

  if (identicalProfile) {
    return (
      <>
        <View style={styles.header} testID="ReconnectScreen">
          <Text style={styles.subheaderText}>
            {t('connections.text.alreadyConnectedWith', {
              name: pendingConnection.name,
            })}
          </Text>
          <Text style={styles.lastConnectedText}>
            {t('connections.tag.lastConnected', {
              date: moment(
                parseInt(String(pendingConnection.connectedAt), 10),
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
          <View style={styles.connectionLevel} testID="ReconnectSliderView">
            <TrustlevelSlider
              currentLevel={connectionLevel}
              changeLevelHandler={setConnectionLevel}
              verbose={false}
            />
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.updateButton}
            onPress={updateLevel}
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
          <Text style={styles.subheaderText}>
            {t('connections.text.alreadyConnectedWith')}
          </Text>
          <Text style={styles.lastConnectedText}>
            {t('connections.tag.lastConnected', {
              date: moment(
                parseInt(String(existingConnection.createdAt), 10),
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
          <View style={styles.connectionLevel} testID="ReconnectSliderView">
            <TrustlevelSlider
              currentLevel={connectionLevel}
              changeLevelHandler={setConnectionLevel}
              verbose={false}
            />
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
            onPress={updateLevel}
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
    marginTop: DEVICE_LARGE ? 10 : 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
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
    marginTop: 8,
    marginBottom: 0,
  },
  profileHeader: {
    marginTop: 8,
    marginBottom: 10,
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
    marginBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: ORANGE,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  connectionLevel: {
    alignItems: 'center',
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
    marginBottom: 5,
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
