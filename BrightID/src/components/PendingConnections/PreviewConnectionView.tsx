import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
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
  const { pendingConnection, setLevelHandler, photoTouchHandler } = props;
  const id = useSelector((state) => state.user.id);

  const userReported = pendingConnection.reports.find(
    (report) => report.id === id,
  );

  const reported =
    !userReported &&
    pendingConnection.reports.length /
      (pendingConnection.connectionsNum || 1) >=
      REPORTED_PERCENTAGE;

  const brightIdVerified = pendingConnection.verifications
    .map((v) => v.name)
    .includes('BrightID');
  let ratingView;
  switch (pendingConnection.state) {
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

  return (
    <>
      <View testID="previewConnectionScreen" style={styles.userContainer}>
        <TouchableWithoutFeedback onPress={photoTouchHandler}>
          <Image
            source={{ uri: pendingConnection.photo }}
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
          <Text style={styles.connectName}>{pendingConnection.name}</Text>
          {userReported && (
            <Text style={styles.reported}>
              {t('common.tag.reportedByUser', {
                reportReason: userReported.reportReason,
              })}
            </Text>
          )}
          {reported && (
            <Text style={styles.reported}>{t('common.tag.reported')}</Text>
          )}
          {brightIdVerified && (
            <View style={styles.verificationSticker}>
              <VerifiedBadge width={16} height={16} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.countsContainer}>
        <ConnectionStats
          connectionsNum={pendingConnection.connectionsNum}
          groupsNum={pendingConnection.groupsNum}
          mutualConnectionsNum={pendingConnection.mutualConnections.length}
        />
      </View>
      <View style={styles.ratingView}>{ratingView}</View>
    </>
  );
};

const styles = StyleSheet.create({
  userContainer: {
    marginTop: DEVICE_LARGE ? 12 : 10,
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
    fontSize: fontSize[18],
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
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 7 : 5,
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
});
