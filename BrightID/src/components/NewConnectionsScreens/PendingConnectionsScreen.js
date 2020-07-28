// @flow

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import moment from 'moment';
import {
  pendingConnection_states,
  rejectPendingConnection,
  selectPendingConnectionById,

  // pendingConnection_states,
  selectAllPendingConnections,
  selectAllPendingConnectionIds,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { confirmPendingConnectionThunk } from '@/components/NewConnectionsScreens/actions/pendingConnectionThunks';
import {
  channel_types,
  selectChannelById,
} from '@/components/NewConnectionsScreens/channelSlice';
import api from '@/api/brightId';
import { DEVICE_LARGE, WIDTH, HEIGHT } from '@/utils/constants';
import backArrow from '@/static/back_arrow_black.svg';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

export const PreviewConnection = ({ id, carouselRef }) => {
  const dispatch = useDispatch();

  // return true because we never want to re render
  const myConnections = useSelector(
    (state) => state.connections.connections,
    () => true,
  );

  // we only care about the state the of the pending connection
  const pendingConnection = useSelector(
    (state) => selectPendingConnectionById(state, id),
    (a, b) => a?.state === b?.state,
  );

  // we are only using the channel's profile timestamp
  const channel: Channel | typeof undefined = useSelector(
    (state) => {
      if (pendingConnection) {
        return selectChannelById(state, pendingConnection.channelId);
      } else {
        return undefined;
      }
    },
    (a, b) => a?.myProfileTimestamp === b?.myProfileTimestamp,
  );

  const [userInfo, setUserInfo] = useState({
    connections: 'loading',
    groups: 'loading',
    mutualConnections: 'loading',
    connectionDate: 'loading',
    flagged: false,
  });

  const reject = useCallback(() => {
    dispatch(rejectPendingConnection(pendingConnection.id));
    carouselRef.current?.snapToNext();
    return true;
  }, [dispatch, pendingConnection.id, carouselRef]);

  const handleConfirmation = async () => {
    dispatch(confirmPendingConnectionThunk(pendingConnection.id));
    carouselRef.current?.snapToNext();
  };

  useEffect(() => {
    const fetchConnectionInfo = async () => {
      console.log(`TODO: Move fetchConnectionInfo() to Redux!`);
      try {
        const {
          createdAt,
          groups,
          connections = [],
          flaggers,
        } = await api.getUserInfo(
          pendingConnection.brightId ? pendingConnection.brightId : '',
        );
        const mutualConnections = connections.filter(function (el) {
          return myConnections.some((x) => x.id === el.id);
        });
        setUserInfo({
          connections: connections.length,
          groups: groups.length,
          mutualConnections: mutualConnections.length,
          connectionDate: `Created ${moment(
            parseInt(createdAt, 10),
          ).fromNow()}`,
          flagged: flaggers && Object.keys(flaggers).length > 0,
        });
      } catch (err) {
        if (err instanceof Error && err.message === 'User not found') {
          setUserInfo({
            connections: 0,
            groups: 0,
            mutualConnections: 0,
            connectionDate: 'New user',
            flagged: false,
          });
        } else {
          err instanceof Error ? console.warn(err.message) : console.log(err);
        }
      }
    };

    fetchConnectionInfo();

    BackHandler.addEventListener('hardwareBackPress', reject);
    return () => BackHandler.removeEventListener('hardwareBackPress', reject);
  }, [reject, myConnections, pendingConnection.brightId]);

  const ConfirmationButtons = () => {
    switch (pendingConnection.state) {
      case pendingConnection_states.CONFIRMING:
      case pendingConnection_states.CONFIRMED: {
        return <Text>Confirming connection...</Text>;
      }
      case pendingConnection_states.DOWNLOADING: {
        return <Text>Downloading profile ...</Text>;
      }
      case pendingConnection_states.REJECTED: {
        return <Text>{pendingConnection.name} rejected your connection</Text>;
      }

      case pendingConnection_states.UNCONFIRMED:
        if (
          pendingConnection.profileTimestamp < channel?.myProfileTimestamp &&
          !pendingConnection.signedMessage
        ) {
          return (
            <Text>Waiting for {pendingConnection.name} to confirm ...</Text>
          );
        } else {
          return (
            <>
              <TouchableOpacity
                testID="rejectConnectionBtn"
                onPress={reject}
                style={styles.rejectButton}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirmConnectionBtn"
                onPress={handleConfirmation}
                style={styles.confirmButton}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </>
          );
        }
      case pendingConnection_states.ERROR:
      default: {
        return <Text>There was an error, please try again</Text>;
      }
    }
  };

  return (
    <View style={styles.previewContainer} testID="previewConnectionScreen">
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        translucent={false}
        animated={true}
      />
      <View style={styles.titleContainer}>
        <Text style={styles.questionText}>Connect with?</Text>
      </View>
      <View style={styles.userContainer}>
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
        <Text style={styles.connectName}>
          {pendingConnection.name}
          {userInfo.flagged && <Text style={styles.flagged}> (flagged)</Text>}
        </Text>
        <Text style={styles.connectedText}>{userInfo.connectionDate}</Text>
      </View>
      <View style={styles.countsContainer}>
        <View>
          <Text style={styles.countsNumberText}>{userInfo.connections}</Text>
          <Text style={styles.countsDescriptionText}>Connections</Text>
        </View>
        <View>
          <Text style={styles.countsNumberText}>{userInfo.groups}</Text>
          <Text style={styles.countsDescriptionText}>Groups</Text>
        </View>
        <View>
          <Text style={styles.countsNumberText}>
            {userInfo.mutualConnections}
          </Text>
          <Text style={styles.countsDescriptionText}>Mutual Connec...</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ConfirmationButtons />
      </View>
    </View>
  );
};

export const PendingConnectionsScreen = () => {
  const navigation = useNavigation();
  const carouselRef = useRef(null);

  const pendingConnections = useSelector(
    (state) => {
      return selectAllPendingConnections(state);
    },
    (a, b) => a.length === b.length,
  );

  const unconfirmedConnectionIds = pendingConnections
    .filter((pc) => pc.state === pendingConnection_states.UNCONFIRMED)
    .map((pc) => pc.id);

  const renderItem = ({ item }) => {
    return <PreviewConnection id={item} carouselRef={carouselRef} />;
  };

  return (
    <SafeAreaView
      style={[styles.container]}
      onPress={() => {
        navigation.goBack();
      }}
    >
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.navigate('Home');
        }}
      >
        <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
      </TouchableOpacity>
      <Carousel
        containerCustomStyle={{ flex: 1 }}
        ref={carouselRef}
        data={unconfirmedConnectionIds}
        renderItem={renderItem}
        layout="stack"
        lockScrollWhileSnapping={true}
        itemWidth={WIDTH * 0.95}
        sliderWidth={WIDTH}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fcfcfc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    borderRadius: 10,
    // marginTop: DEVICE_LARGE ? 60 : 50,
  },
  titleContainer: {
    marginTop: DEVICE_LARGE ? 60 : 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontFamily: 'Poppins',
    fontWeight: '100',
    fontSize: DEVICE_LARGE ? 22 : 18,
    textAlign: 'center',
    color: '#000000',
  },
  userContainer: {
    marginTop: 10,
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: DEVICE_LARGE ? 148 : 115,
    height: DEVICE_LARGE ? 148 : 115,
    borderRadius: 100,
  },
  connectName: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    marginTop: 10,
    fontSize: DEVICE_LARGE ? 26 : 21,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
  },
  flagged: {
    fontSize: DEVICE_LARGE ? 20 : 18,
    color: 'red',
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 51 : 40,
  },
  rejectButton: {
    borderRadius: 3,
    backgroundColor: '#f7651c',
    flex: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 51 : 40,
  },
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 18 : 15,
    textAlign: 'left',
    color: '#ffffff',
  },
  countsContainer: {
    borderTopColor: '#e3e1e1',
    borderTopWidth: 1,
    paddingTop: 11,
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
    marginTop: 8,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 11,
  },
  countsDescriptionText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 14 : 12,
  },
  countsNumberText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: 18,
  },
  connectedText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 14,
    color: '#aba9a9',
    fontStyle: 'italic',
  },
  cancelButton: {
    position: 'absolute',
    left: 0,
    top: DEVICE_LARGE ? 55 : 35,
    zIndex: 20,
    width: DEVICE_LARGE ? 60 : 50,
    alignItems: 'center',
  },
});

export default PendingConnectionsScreen;
