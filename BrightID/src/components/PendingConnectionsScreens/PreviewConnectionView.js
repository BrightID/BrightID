// @flow

import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { pendingConnection_states } from './pendingConnectionSlice';
import { RatingView } from './RatingView';
import { ConnectionStats } from './ConnectionStats';

type PreviewConnectionProps = {
  pendingConnection: PendingConnection,
  setLevelHandler: (level: ConnectionLevel) => any,
  photoTouchHandler: () => any,
  brightIdVerified: boolean,
};

export const PreviewConnectionView = (props: PreviewConnectionProps) => {
  const {
    pendingConnection,
    setLevelHandler,
    brightIdVerified,
    photoTouchHandler,
  } = props;

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
        <Text style={styles.infoText}>You already rated this connection</Text>
      );
      break;
    }
    case pendingConnection_states.ERROR: {
      ratingView = (
        <Text style={styles.infoText}>
          Error while connecting. Please try to reconnect.
        </Text>
      );
      break;
    }
    case pendingConnection_states.EXPIRED: {
      ratingView = (
        <Text style={styles.infoText}>
          The connection expired. Please try to reconnect.
        </Text>
      );
      break;
    }
    case pendingConnection_states.MYSELF: {
      ratingView = (
        <Text style={styles.infoText}>You can not connect to yourself.</Text>
      );
      break;
    }
    default:
      ratingView = (
        <Text style={styles.infoText}>Unhandled connection state</Text>
      );
  }

  return (
    <>
      <View testID="previewConnectionScreen" style={styles.titleContainer}>
        <Text style={styles.titleText}>Connection Request </Text>
      </View>
      <View style={styles.userContainer}>
        <TouchableWithoutFeedback onPress={photoTouchHandler}>
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
        </TouchableWithoutFeedback>
        <View style={styles.connectNameContainer}>
          <Text style={styles.connectName}>{pendingConnection.name}</Text>
          {pendingConnection.flagged && (
            <Text style={styles.flagged}> (flagged)</Text>
          )}
          {brightIdVerified && (
            <View style={styles.verificationSticker}>
              <SvgXml width="16" height="16" xml={verificationSticker} />
            </View>
          )}
        </View>
      </View>
      <View style={styles.countsContainer}>
        <ConnectionStats
          numConnections={pendingConnection.connections}
          numGroups={pendingConnection.groups}
          numMutualConnections={pendingConnection.mutualConnections}
        />
      </View>
      <View style={styles.ratingView}>{ratingView}</View>
    </>
  );
};

const styles = StyleSheet.create({
  waitingText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 18 : 15,
    textAlign: 'left',
    color: '#ffffff',
  },
  titleContainer: {
    marginTop: DEVICE_LARGE ? 18 : 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 22 : 18,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    marginTop: 20,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: DEVICE_LARGE ? 150 : 108,
    height: DEVICE_LARGE ? 150 : 108,
    borderRadius: 100,
  },
  connectNameContainer: {
    marginTop: 15,
    alignItems: 'center',
    flexDirection: 'row',
  },
  connectName: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 20 : 16,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
  },
  flagged: {
    fontSize: DEVICE_LARGE ? 20 : 18,
    color: 'red',
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
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  verificationSticker: {
    marginLeft: DEVICE_LARGE ? 8 : 5,
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
    fontSize: DEVICE_LARGE ? 17 : 15,
    marginTop: 32,
  },
});
