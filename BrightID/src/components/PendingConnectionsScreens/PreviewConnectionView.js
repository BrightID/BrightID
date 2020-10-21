// @flow

import React from 'react';
import { useSelector } from 'react-redux';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import backArrow from '@/static/back_arrow_grey.svg';
import verificationSticker from '@/static/verification-sticker.svg';
import { connection_levels, DEVICE_LARGE } from '../../utils/constants';
import { RatingButton } from './RatingButton';
import {
  pendingConnection_states,
  selectPendingConnectionById,
} from './pendingConnectionSlice';

type PreviewConnectionProps = {
  pendingConnectionId: any,
  ratingHandler: (...args: Array<any>) => any,
  index: number,
};

export const PreviewConnectionView = (props: PreviewConnectionProps) => {
  const { pendingConnectionId, ratingHandler, index } = props;

  const pendingConnection = useSelector(
    (state) =>
      selectPendingConnectionById(state, pendingConnectionId) ?? {
        state: pendingConnection_states.EXPIRED,
      },
    (a, b) => a?.state === b?.state,
  );

  const alreadyExists = useSelector(
    (state) =>
      state.connections.connections.some(
        (conn) => conn.id === pendingConnection.brightId,
      ) && pendingConnection.state === pendingConnection_states.UNCONFIRMED,
  );

  const navigation = useNavigation();

  const brightidVerified = pendingConnection.verifications?.includes(
    'BrightID',
  );

  const buttonHandler = (level: ConnectionLevel) => {
    ratingHandler(pendingConnection.id, level, index);
  };

  let ratingView;
  switch (pendingConnection.state) {
    case pendingConnection_states.UNCONFIRMED: {
      ratingView = (
        <>
          <View>
            <Text style={styles.ratingHeader}>
              How well do you know this connection?
            </Text>
          </View>
          <View style={styles.rateButtonContainer}>
            <RatingButton
              color="red"
              label="🤔 Suspicious"
              level={connection_levels.SUSPICIOUS}
              handleClick={buttonHandler}
            />
            <RatingButton
              color="yellow"
              label="👋 Just met"
              level={connection_levels.JUST_MET}
              handleClick={buttonHandler}
            />
            <RatingButton
              color="green"
              label="😎 Already know"
              level={connection_levels.ALREADY_KNOW}
              handleClick={buttonHandler}
            />
          </View>
          <View>
            <Text style={styles.ratingFooter}>
              Your answer will help us prevent attacks
            </Text>
          </View>
        </>
      );
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
    <View style={styles.previewContainer} testID="previewConnectionScreen">
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>
          {alreadyExists ? 'Reconnect with' : 'Connection Request'}
        </Text>
      </View>
      <View style={styles.userContainer}>
        <TouchableWithoutFeedback
          onPress={() => {
            navigation.navigate('FullScreenPhoto', {
              photo: pendingConnection.photo,
              base64: true,
            });
          }}
        >
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
          {brightidVerified && (
            <View style={styles.verificationSticker}>
              <SvgXml width="16" height="16" xml={verificationSticker} />
            </View>
          )}
        </View>
        {alreadyExists ? (
          <Text style={styles.flagged}>(already connected)</Text>
        ) : (
          <Text style={styles.connectedText}>
            {pendingConnection.connectionDate}
          </Text>
        )}
      </View>
      <View style={styles.countsContainer}>
        <View>
          <Text style={styles.countsNumberText}>
            {pendingConnection.connections}
          </Text>
          <Text style={styles.countsDescriptionText}>Connections</Text>
        </View>
        <View>
          <Text style={styles.countsNumberText}>
            {pendingConnection.groups}
          </Text>
          <Text style={styles.countsDescriptionText}>Groups</Text>
        </View>
        <View>
          <Text style={styles.countsNumberText}>
            {pendingConnection.mutualConnections}
          </Text>
          <Text style={styles.countsDescriptionText}>Mutual Connections</Text>
        </View>
      </View>
      <View style={styles.ratingView}>{ratingView}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  waitingText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 18 : 15,
    textAlign: 'left',
    color: '#ffffff',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: 10,
  },
  cancelButton: {
    position: 'absolute',
    left: -10,
    top: DEVICE_LARGE ? 20 : 12,
    zIndex: 20,
    width: DEVICE_LARGE ? 60 : 50,
    alignItems: 'center',
  },
  titleContainer: {
    marginTop: DEVICE_LARGE ? 18 : 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
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
    fontFamily: 'Poppins',
    fontWeight: 'bold',
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
  countsDescriptionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 14 : 12,
  },
  countsNumberText: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 17 : 15,
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
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 17 : 15,
    marginTop: 32,
  },
  ratingHeader: {
    fontFamily: 'Poppins',
    fontWeight: '700',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 17 : 15,
    marginBottom: 12,
  },
  rateButtonContainer: {
    width: '65%',
  },
  ratingFooter: {
    paddingTop: 18,
    fontFamily: 'Poppins',
    fontWeight: 'normal',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#827F7F',
  },
});
