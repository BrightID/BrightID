import React from 'react';
import moment from 'moment';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { ORANGE, BLACK, RED } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { useSelector } from '@/store';
import { pendingConnection_states } from './pendingConnectionSlice';
import { RatingView } from './RatingView';
import { ConnectionStats } from './ConnectionStats';

// percentage determines reported warning
const REPORTED_PERCENTAGE = 0.1;

type PreviewConnectionProps = {
  pendingConnection: PendingConnection;
  setLevelHandler: (level: ConnectionLevel) => any;
  photoTouchHandler: () => any;
};

export const PreviewConnectionView = (props: PreviewConnectionProps) => {
  const { t } = useTranslation();
  const {
    pendingConnection: {
      state,
      pendingConnectionData: { sharedProfile, profileInfo },
    },
    setLevelHandler,
    photoTouchHandler,
  } = props;
  const id = useSelector((state) => state.user.id);

  const reports = profileInfo?.reports || [];

  const userReported = reports.find((report) => report.id === id);

  const reported =
    !userReported &&
    reports.length / (profileInfo?.connectionsNum || 1) >= REPORTED_PERCENTAGE;

  let ratingView;
  switch (state) {
    case pendingConnection_states.UNCONFIRMED: {
      ratingView = <RatingView setLevelHandler={setLevelHandler} />;
      break;
    }
    case pendingConnection_states.CONFIRMING:
    case pendingConnection_states.CONFIRMED: {
      // user already handled this connection request
      ratingView = (
        <Text style={styles.infoText}>
          {t('pendingConnection.text.alreadyRated')}
        </Text>
      );
      break;
    }
    case pendingConnection_states.ERROR: {
      ratingView = (
        <Text style={styles.infoText}>
          {t('pendingConnections.text.errorGeneric')}
        </Text>
      );
      break;
    }
    case pendingConnection_states.EXPIRED: {
      ratingView = (
        <Text style={styles.infoText}>
          {t('pendingConnection.text.errorExpired')}
        </Text>
      );
      break;
    }
    case pendingConnection_states.MYSELF: {
      ratingView = (
        <Text style={styles.infoText}>
          {t('pendingConnection.text.errorMyself')}
        </Text>
      );
      break;
    }
    default:
      ratingView = (
        <Text style={styles.infoText}>
          {t('pendingConnection.text.errorUnhandled')}
        </Text>
      );
  }

  const date = moment(profileInfo?.createdAt || Date.now()).fromNow();

  const connectionBrightId = __DEV__ ? (
    <View>
      <Text testID="connectionBrightId" style={{ fontSize: 6, color: BLACK }}>
        {sharedProfile.id}
      </Text>
    </View>
  ) : null;

  return (
    <>
      <View testID="previewConnectionScreen" style={styles.userContainer}>
        {reported && (
          <Text
            style={[styles.reported, { marginBottom: DEVICE_LARGE ? 12 : 10 }]}
          >
            {t('common.tag.reported')}
          </Text>
        )}
        <TouchableWithoutFeedback onPress={photoTouchHandler}>
          <Image
            source={{ uri: sharedProfile.photo }}
            style={styles.photo}
            resizeMode="cover"
            onError={(e) => {
              console.log(e);
            }}
            accessible={true}
            accessibilityLabel={t('common.accessibilityLabel.userPhoto')}
          />
        </TouchableWithoutFeedback>
        <View style={styles.connectNameContainer}>
          <Text style={styles.connectName}>{sharedProfile.name}</Text>
          <View style={styles.createdContainer}>
            <Text style={styles.createdText}>
              {t('pendingConnections.label.created', { date })}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.countsContainer}>
        <ConnectionStats
          connectionsNum={profileInfo?.connectionsNum || 0}
          groupsNum={profileInfo?.groupsNum || 0}
          mutualConnectionsNum={profileInfo?.mutualConnections.length || 0}
        />
      </View>
      {userReported && (
        <Text style={styles.reported}>
          ({t('common.tag.reportedByUser')}
          {userReported.reportReason &&
            userReported.reportReason !== 'other' &&
            t('common.tag.reportReason', {
              reportReason: userReported.reportReason,
            })}
          )
        </Text>
      )}
      <View style={styles.ratingView}>{ratingView}</View>
      {connectionBrightId}
    </>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: DEVICE_LARGE ? 120 : 100,
    height: DEVICE_LARGE ? 120 : 100,
    borderRadius: 100,
  },
  connectNameContainer: {
    marginTop: DEVICE_LARGE ? 12 : 10,
    alignItems: 'center',
  },
  connectName: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[18],
    letterSpacing: 0,
    textAlign: 'left',
    color: BLACK,
  },
  reported: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: RED,
  },
  countsContainer: {
    width: '88%',
    paddingTop: 6,
    paddingBottom: 6,
    marginTop: 4,
    marginBottom: DEVICE_LARGE ? 12 : 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: ORANGE,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  ratingView: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '90%',
  },
  infoText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: fontSize[17],
    marginTop: 32,
  },
  createdContainer: {
    marginTop: DEVICE_LARGE ? 7 : 6,
  },
  createdText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[12],
    color: ORANGE,
  },
});
