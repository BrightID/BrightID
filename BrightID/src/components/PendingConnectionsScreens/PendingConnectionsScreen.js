// @flow

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { BackHandler, StyleSheet, StatusBar } from 'react-native';
import Spinner from 'react-native-spinkit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllUnconfirmedConnections } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { DEVICE_LARGE, WIDTH } from '@/utils/constants';
import { setActiveNotification } from '@/actions';
import { confirmPendingConnectionThunk } from './actions/pendingConnectionThunks';
import { PreviewConnectionView } from './PreviewConnectionView';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */
const ZERO_CONNECTIONS_TIMEOUT = 3500;

export const PendingConnectionsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const carouselRef = useRef(null);

  const pendingConnections = useSelector((state) => {
    return selectAllUnconfirmedConnections(state);
  });
  // pending connections to display
  const [pendingConnectionsToDisplay, setPendingConnectionsDisplay] = useState(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [reRender, setReRender] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null);

  // this will trigger a re-render of the carousel
  // causes a glitch in the UI on Android
  const resetDisplayConnections = useCallback(() => {
    const connectionsToDisplay = pendingConnections;
    // this will cause the PendingConnectionList to re render
    setPendingConnectionsDisplay(connectionsToDisplay);
  }, [pendingConnections]);

  useFocusEffect(
    useCallback(() => {
      setReRender(true);
      dispatch(setActiveNotification(null));
    }, [dispatch]),
  );

  // setupList on first render
  useEffect(() => {
    if (reRender) {
      // refresh list
      resetDisplayConnections();
      // we wait 500ms before showing the pendingConnection screen
      setTimeout(() => {
        setReRender(false);
        setActiveIndex(0);
      }, 500);
    }
  }, [reRender]);

  // re-render list if no connections are displayed
  useEffect(() => {
    if (pendingConnectionsToDisplay.length === 0 && !reRender) {
      resetDisplayConnections();
    }
  }, [resetDisplayConnections, pendingConnectionsToDisplay.length, reRender]);

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
    const ratingHandler = (
      pendingConnectionId: string,
      level: ConnectionLevel,
      index: number,
    ) => {
      dispatch(confirmPendingConnectionThunk(pendingConnectionId, level));

      if (index === pendingConnectionsToDisplay.length - 1) {
        // last list item handled? Then reload list
        setReRender(true);
      } else {
        // move to next item
        carouselRef.current?.snapToNext();
      }
    };

    const renderItem = ({ item, index }) => {
      return (
        <PreviewConnectionView
          pendingConnectionId={item.id}
          carouselRef={carouselRef}
          setReRender={setReRender}
          ratingHandler={ratingHandler}
          index={index}
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
        renderItem={renderItem}
        layout="stack"
        layoutCardOffset={pendingConnectionsToDisplay.length}
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
  }, [dispatch, pendingConnectionsToDisplay]);

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
      ) : (
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
            dotsLength={pendingConnectionsToDisplay.length}
            activeDotIndex={activeIndex ?? 0}
            inactiveDotOpacity={0.4}
            inactiveDotScale={1}
            carouselRef={carouselRef.current}
            tappableDots={true}
          />
        </>
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
  buttonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 18 : 15,
    textAlign: 'left',
    color: '#ffffff',
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
