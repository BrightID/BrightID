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

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

/**  HELPER FUNCTIONS */

const isUnconfirmed = (pc) => pc.state === pendingConnection_states.UNCONFIRMED;
const isReadyToConfirm = (pc) => pc.initiator || pc.signedMessage;
// const shouldDisplay = (pc) => isUnconfirmed(pc) && isReadyToConfirm(pc);

/**  COMPONENTS */
export const PreviewConnection = ({ id, carouselRef, last }) => {
  const dispatch = useDispatch();

  // we only care about the state and signedMessage the of the pending connection
  const pendingConnection = useSelector(
    (state) => selectPendingConnectionById(state, id),
    (a, b) => a?.state === b?.state && a?.signedMessage === b?.signedMessage,
  );

  useEffect(() => {
    const goBack = () => {
      carouselRef.current?.snapToPrev();
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', goBack);
  }, [carouselRef]);

  const handleConfirmation = () => {
    dispatch(confirmPendingConnectionThunk(pendingConnection.id));
    last
      ? carouselRef.current?.snapToPrev()
      : carouselRef.current?.snapToNext();
  };

  const reject = () => {
    dispatch(rejectPendingConnection(pendingConnection.id));
    last
      ? carouselRef.current?.snapToPrev()
      : carouselRef.current?.snapToNext();
  };

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
          return (
            <Text>Waiting for {pendingConnection.name} to confirm ...</Text>
          );
        }
      case pendingConnection_states.ERROR:
      default: {
        return <Text>There was an error, please try again</Text>;
      }
    }
  };

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
        <ConfirmationButtons />
      </View>
    </View>
  );
};

export const PendingConnectionsScreen = () => {
  const navigation = useNavigation();
  const carouselRef = useRef(null);

  const pendingConnections = useSelector((state) => {
    return selectAllPendingConnections(state);
  });

  console.log('rendering pending connections list');

  const [reRender, setRerender] = useState(0);

  const readyToConfirmConnections = pendingConnections.filter(isReadyToConfirm);

  useEffect(() => {
    const readyToDisplayConnections = readyToConfirmConnections.filter(
      isUnconfirmed,
    );
    if (readyToDisplayConnections.length === 0) {
      setRerender((c) => c + 1);
    }
  }, [pendingConnections]);

  // the list should only re render sparingly for performance reasons
  const PendingConnectionList = useMemo(() => {
    // only display users that we are able to confirm / reject
    const readyToDisplayConnectionIds = readyToConfirmConnections
      .filter(isUnconfirmed)
      .map((pc) => pc.id);
    const renderItem = ({ item, index }) => {
      return item ? (
        <PreviewConnection
          id={item}
          carouselRef={carouselRef}
          last={index === readyToDisplayConnectionIds.length - 1}
        />
      ) : null;
    };
    return (
      <Carousel
        containerCustomStyle={{
          flex: 1,
        }}
        ref={carouselRef}
        data={readyToDisplayConnectionIds}
        layoutCardOffset={readyToDisplayConnectionIds.length}
        renderItem={renderItem}
        layout="stack"
        lockScrollWhileSnapping={true}
        itemWidth={WIDTH * 0.95}
        sliderWidth={WIDTH}
        onBeforeSnapToItem={(index) => {
          if (index === readyToDisplayConnectionIds.length - 1) {
            setRerender((c) => c + 1);
          }
        }}
      />
    );
  }, [readyToConfirmConnections.length, reRender]);

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
