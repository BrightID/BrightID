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
  TouchableWithoutFeedback,
} from 'react-native';
import Spinner from 'react-native-spinkit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { SvgXml } from 'react-native-svg';
import {
  pendingConnection_states,
  rejectPendingConnection,
  selectPendingConnectionById,
  selectAllUnconfirmedConnections,
} from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { confirmPendingConnectionThunk } from '@/components/PendingConnectionsScreens/actions/pendingConnectionThunks';
import { DEVICE_LARGE, WIDTH } from '@/utils/constants';
import backArrow from '@/static/back_arrow_grey.svg';
import { setActiveNotification } from '@/actions';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

/**  HELPER FUNCTIONS */

const ZERO_CONNECTIONS_TIMEOUT = 3500;

/**  COMPONENTS */

const ConfirmationButtons = ({
  pendingConnection: pc,
  carouselRef,
  last,
  setReRender,
}) => {
  const dispatch = useDispatch();
  const pendingConnection = useSelector(
    (state) =>
      selectPendingConnectionById(state, pc.id) ?? {
        state: pendingConnection_states.EXPIRED,
      },
    (a, b) => a?.state === b?.state && a?.signedMessage === b?.signedMessage,
  );

  const alreadyExists = useSelector((state) =>
    state.connections.connections.some(
      (conn) => conn.id === pendingConnection.brightId,
    ),
  );

  const accept = () => {
    dispatch(confirmPendingConnectionThunk(pendingConnection.id));

    if (last) {
      setReRender(true);
    } else {
      carouselRef.current?.snapToNext();
    }
  };

  const reject = () => {
    dispatch(rejectPendingConnection(pendingConnection.id));

    if (last) {
      setReRender(true);
    } else {
      carouselRef.current?.snapToNext();
    }
  };

  switch (pendingConnection.state) {
    case pendingConnection_states.CONFIRMING:
    case pendingConnection_states.CONFIRMED: {
      return <Text style={styles.waitingText}>Confirmed connection.</Text>;
    }
    case pendingConnection_states.INITIAL:
    case pendingConnection_states.DOWNLOADING: {
      return <Text style={styles.waitingText}>Downloading profile ...</Text>;
    }
    case pendingConnection_states.REJECTED: {
      return (
        <Text style={styles.waitingText}>
          Connection with {pendingConnection.name} has been rejected ...
        </Text>
      );
    }
    case pendingConnection_states.UNCONFIRMED: {
      return (
        <>
          <TouchableOpacity
            testID="rejectConnectionButton"
            onPress={reject}
            style={styles.rejectButton}
            accessibilityLabel={`reject connection with ${pendingConnection.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {alreadyExists ? 'Ignore' : 'Reject'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="confirmConnectionButton"
            onPress={accept}
            style={styles.confirmButton}
            accessibilityLabel={`accept connection with ${pendingConnection.name}`}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {alreadyExists ? 'Update Profile' : 'Confirm'}
            </Text>
          </TouchableOpacity>
        </>
      );
    }
    case pendingConnection_states.ERROR: {
      return (
        <Text style={styles.waitingText}>
          There was an error, please try connecting with{' '}
          {pendingConnection.name} again...
        </Text>
      );
    }
    case pendingConnection_states.MYSELF: {
      return <Text style={styles.waitingText}>OOPS!!! This is you...</Text>;
    }
    case pendingConnection_states.EXPIRED: {
      Alert.alert(
        'Try connecting again...',
        `The QRCode used to connect has expired...`,
      );
      return (
        <Text style={styles.waitingText}>
          The QRCode used to connect with {pendingConnection.name} has
          expired... please try connecting again.
        </Text>
      );
    }
    default: {
      return (
        <Text style={styles.waitingText}>
          Waiting for data from the profile service
        </Text>
      );
    }
  }
};

export const PreviewConnection = (props) => {
  // we only care about the state and signedMessage the of the pending connection
  const { pendingConnection } = props;
  console.log(
    'rendering',
    pendingConnection.name,
    pendingConnection.signedMessage,
  );

  const alreadyExists = useSelector((state) =>
    state.connections.connections.some(
      (conn) => conn.id === pendingConnection.brightId,
    ),
  );

  const navigation = useNavigation();
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
        <Text style={styles.questionText}>Connect with?</Text>
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
        <Text style={styles.connectName}>
          {pendingConnection.name}
          {pendingConnection.flagged && (
            <Text style={styles.flagged}> (flagged)</Text>
          )}
        </Text>
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
          <Text style={styles.countsDescriptionText}>Mutual Connec...</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <ConfirmationButtons {...props} />
      </View>
    </View>
  );
};

export const PendingConnectionsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const carouselRef = useRef(null);

  // we want to watch for all changes to pending connections
  const pendingConnections = useSelector((state) => {
    return selectAllUnconfirmedConnections(state);
  });

  const [loading, setLoading] = useState(true);

  const [reRender, setReRender] = useState(true);

  const [activeIndex, setActiveIndex] = useState(null);

  useFocusEffect(
    useCallback(() => {
      setReRender(true);
      console.log('SETTING ACTIVE NOTIFICATION?');
      dispatch(setActiveNotification(null));
    }, [dispatch]),
  );

  // setupList on first render
  useEffect(() => {
    if (reRender) {
      // we wait 500ms before showing the pendingConnection screen
      setTimeout(() => {
        setReRender(false);
        setActiveIndex(0);
      }, 500);
    }
  }, [reRender]);

  // back handling for android
  useEffect(() => {
    const goBack = () => {
      if (carouselRef.current?.currentIndex > 0) {
        carouselRef.current?.snapToPrev();
        return true;
      }
    };
    BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', goBack);
  }, [carouselRef]);

  // leave page if zero pending connections
  useEffect(() => {
    let timeout;
    if (pendingConnections.length === 0) {
      setLoading(true);
      timeout = setTimeout(() => {
        navigation.navigate('Connections');
      }, ZERO_CONNECTIONS_TIMEOUT);
    } else {
      setLoading(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [pendingConnections.length, navigation]);

  // the list should only re render sparingly for performance and continuity
  const PendingConnectionList = useMemo(() => {
    const renderItem = ({ item, index }) => {
      return (
        <PreviewConnection
          pendingConnection={item}
          carouselRef={carouselRef}
          last={index === pendingConnections.length - 1}
          setReRender={setReRender}
        />
      );
    };

    return (
      <Carousel
        containerCustomStyle={{
          flex: 1,
        }}
        ref={carouselRef}
        data={pendingConnections}
        renderItem={renderItem}
        layout="stack"
        layoutCardOffset={pendingConnections.length}
        firstItem={0}
        itemWidth={WIDTH * 0.95}
        sliderWidth={WIDTH}
        onSnapToItem={(index) => {
          setActiveIndex(index);
        }}
        onLayout={() => {
          setActiveIndex((prev) => prev || 0);
        }}
      />
    );
  }, [pendingConnections]);

  const ZeroConnectionsToDisplay = () => {
    return (
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <Material
          name="account-clock-outline"
          size={DEVICE_LARGE ? 48 : 40}
          color="#333"
        />
        <Text style={styles.waitingText}>Waiting for more connections</Text>
        <Spinner isVisible={true} size={60} type="ThreeBounce" color="#333" />
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => {
            navigation.navigate('Home');
          }}
        >
          <Material
            name="card-account-details-outline"
            size={DEVICE_LARGE ? 36 : 24}
            color="#333"
          />
          <Text style={styles.bottomButtonText}>Return Home</Text>
        </TouchableOpacity>
      </View>
    );
  };
  if (!DEVICE_LARGE) {
    console.log('rendering pending connections SCREEN');
  }

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      {}
      {loading || reRender ? (
        <Spinner
          isVisible={true}
          size={44}
          type="FadingCircleAlt"
          color="#aaa"
        />
      ) : pendingConnections.length ? (
        <>
          {PendingConnectionList}
          <Pagination
            containerStyle={{
              maxWidth: '85%',
              display: 'flex',
              overflow: 'hidden',
              flexWrap: 'wrap',
              justifyContent: 'flex-start',
            }}
            dotContainerStyle={{
              paddingTop: 5,
            }}
            dotsLength={pendingConnections.length}
            activeDotIndex={activeIndex ?? 0}
            inactiveDotOpacity={0.4}
            inactiveDotScale={1}
            carouselRef={carouselRef.current}
            tappableDots={true}
          />
        </>
      ) : (
        <ZeroConnectionsToDisplay />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 22 : 18,
    textAlign: 'center',
    color: '#000000',
  },
  waitingText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#333',
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
    left: -10,
    top: DEVICE_LARGE ? 20 : 12,
    zIndex: 20,
    width: DEVICE_LARGE ? 60 : 50,
    alignItems: 'center',
  },
  clearConnectionsButton: {
    position: 'absolute',
    bottom: '6%',
  },
  bottomButton: {
    position: 'absolute',
    bottom: '6%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: '#fff',
    borderRadius: 60,
    width: DEVICE_LARGE ? 260 : 210,
    borderWidth: 2,
    borderColor: '#333',
    marginBottom: 10,
  },
  bottomButtonText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#333',
    marginLeft: 10,
  },
  infoText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#333',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 22,
  },
  navHomeButton: {
    position: 'absolute',
    left: 0,
    top: DEVICE_LARGE ? 8 : 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // borderWidth: 2,
    // borderColor: '#333',
    // borderRadius: 60,
    width: DEVICE_LARGE ? 80 : 70,
    height: DEVICE_LARGE ? 42 : 36,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 30,
  },
});

export default PendingConnectionsScreen;
