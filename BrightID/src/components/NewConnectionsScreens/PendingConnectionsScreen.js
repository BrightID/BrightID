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
import { DEVICE_LARGE, WIDTH, HEIGHT } from '@/utils/constants';
import backArrow from '@/static/back_arrow_black.svg';
import { usePrevious } from '@/utils/hooks';
import { equals } from 'ramda';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

/**  HELPER FUNCTIONS */

const isUnconfirmed = (pc) => pc.state === pendingConnection_states.UNCONFIRMED;
const isReadyToConfirm = (pc) => pc.initiator || pc.signedMessage;
const shouldDisplay = (pc) => isUnconfirmed(pc) && isReadyToConfirm(pc);

/**  COMPONENTS */

const ConfirmationButtons = ({ pendingConnection: pc, carouselRef, last }) => {
  const dispatch = useDispatch();
  const pendingConnection = useSelector(
    (state) => selectPendingConnectionById(state, pc.id),
    (a, b) => a?.state === b?.state && a?.signedMessage === b?.signedMessage,
  );

  const handleConfirmation = () => {
    dispatch(confirmPendingConnectionThunk(pendingConnection.id));
    last
      ? carouselRef.current?.snapToItem(0)
      : carouselRef.current?.snapToNext();
  };

  const reject = () => {
    dispatch(rejectPendingConnection(pendingConnection.id));
    last
      ? carouselRef.current?.snapToItem(0)
      : carouselRef.current?.snapToNext();
  };

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
      if (isReadyToConfirm(pendingConnection)) {
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
      } else {
        return <Text>Waiting for {pendingConnection.name} to confirm ...</Text>;
      }
    case pendingConnection_states.ERROR:
    default: {
      return <Text>There was an error, please try again</Text>;
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
          {pendingConnection.flagged && (
            <Text style={styles.flagged}> (flagged)</Text>
          )}
        </Text>
        <Text style={styles.connectedText}>
          {pendingConnection.connectionDate}
        </Text>
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
  const carouselRef = useRef(null);

  // we want to watch for all changes to pending connections
  const pendingConnections = useSelector((state) => {
    return selectAllPendingConnections(state);
  });

  const [pendingConnectionsToDisplay, setPendingConnectionsDisplay] = useState(
    [],
  );

  const [readyToRender, setReadyToRender] = useState(true);

  useFocusEffect(
    useCallback(() => {
      /**
       * first mount
       * after snapping to last pending connection in the list
       * if there is only one connectionsToDisplay and  useSelector triggers a re-render
       */
      //
      if (readyToRender || pendingConnectionsToDisplay.length <= 1) {
        const connectionsToDisplay = pendingConnections.filter(shouldDisplay);
        // this will cause the PendingConnectionList to re render
        setPendingConnectionsDisplay(connectionsToDisplay);
        setReadyToRender(false);
      }
    }, [readyToRender, pendingConnections, pendingConnectionsToDisplay.length]),
  );

  // back handling for android
  useEffect(() => {
    const goBack = () => {
      carouselRef.current?.snapToPrev();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', goBack);
  }, [carouselRef]);

  // the list should only re render sparingly for performance and continuity
  const PendingConnectionList = useMemo(() => {
    const renderItem = ({ item, index }) => {
      return (
        <PreviewConnection
          pendingConnection={item}
          carouselRef={carouselRef}
          last={index === pendingConnectionsToDisplay.length - 1}
        />
      );
    };
    console.log('rendering pending connections CAROUSEL');
    return (
      <Carousel
        containerCustomStyle={{
          flex: 1,
        }}
        ref={carouselRef}
        data={pendingConnectionsToDisplay}
        layoutCardOffset={pendingConnectionsToDisplay.length}
        renderItem={renderItem}
        layout="stack"
        lockScrollWhileSnapping={true}
        itemWidth={WIDTH * 0.95}
        sliderWidth={WIDTH}
        onSnapToItem={(index) => {
          // remove all of the confirmed connections when we reach the end of the list
          if (index === pendingConnectionsToDisplay.length - 1) {
            setReadyToRender(true);
          }
        }}
      />
    );
  }, [pendingConnectionsToDisplay]);

  console.log('rendering pending connections SCREEN');

  return (
    <SafeAreaView style={[styles.container]}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.goBack();
        }}
      >
        <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
      </TouchableOpacity>
      {PendingConnectionList}
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
