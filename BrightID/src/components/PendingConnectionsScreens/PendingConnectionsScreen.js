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
import { WIDTH } from '@/utils/deviceConstants';
import { setActiveNotification } from '@/actions';
import { confirmPendingConnectionThunk } from './actions/pendingConnectionThunks';
import { PreviewConnectionController } from './PreviewConnectionController';

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
        <PreviewConnectionController
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
});

export default PendingConnectionsScreen;
