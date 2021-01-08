// @flow

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { BackHandler, StyleSheet, StatusBar, View } from 'react-native';
import { isEqual } from 'lodash';
import Spinner from 'react-native-spinkit';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Pagination } from 'react-native-snap-carousel';
import ViewPager from '@react-native-community/viewpager';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { selectAllUnconfirmedConnections } from '@/components/PendingConnectionsScreens/pendingConnectionSlice';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { WHITE, GREY } from '@/theme/colors';
import { setActiveNotification } from '@/actions';
import { PreviewConnectionController } from './PreviewConnectionController';

/**
 * Confirm / Preview Connection  Screen of BrightID
 *
==================================================================
 *
 */

const REFRESH_VIEWPAGER_TIMEOUT = 1000;

export const PendingConnectionsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const viewPagerRef = useRef(null);

  const pendingConnections = useSelector((state) => {
    return selectAllUnconfirmedConnections(state);
  });
  // pending connections to display
  const [pendingConnectionsToDisplay, setPendingConnectionsDisplay] = useState(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [onLastIndex, setOnLastIndex] = useState(false);

  const refreshDisplayConnections = useCallback(() => {
    /**
     *  this will cause the Viewpager to re render
     * only 10 connections are displayed at one time
     * */
    console.log('SLICING / COMPARING PENDING CONNECTIONS');
    const connectionsToDisplay = pendingConnections.slice(0, 10);
    if (!isEqual(pendingConnectionsToDisplay, connectionsToDisplay)) {
      setPendingConnectionsDisplay(pendingConnections.slice(0, 10));
      console.log('RESETING DISPLAY CONNECTIONS');
    }
  }, [pendingConnections, pendingConnectionsToDisplay]);

  useFocusEffect(
    useCallback(() => {
      refreshDisplayConnections();
      dispatch(setActiveNotification(null));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // NAVIGATION

  useEffect(() => {
    /**
     * we will always refresh the display list
     * when navigating away from the last page
     * */
    if (activeIndex === pendingConnectionsToDisplay.length - 1) {
      setOnLastIndex(true);
    } else if (onLastIndex) {
      refreshDisplayConnections();
      setOnLastIndex(false);
    }
  }, [
    refreshDisplayConnections,
    pendingConnectionsToDisplay.length,
    activeIndex,
    onLastIndex,
  ]);

  // back handling for android
  useEffect(() => {
    const goBack = () => {
      if (activeIndex > 0) {
        viewPagerRef.current?.setPage(activeIndex - 1);
        return true;
      }
    };
    BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', goBack);
  }, [viewPagerRef, activeIndex]);

  // leave page if zero pending connections
  useEffect(() => {
    let timeout;
    if (pendingConnections.length === 0) {
      setLoading(true);
      timeout = setTimeout(() => {
        navigation.navigate('Connections');
      }, REFRESH_VIEWPAGER_TIMEOUT);
    } else {
      setLoading(false);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [pendingConnections.length, navigation]);

  /** 
    the list should only re render sparingly for performance and continuity
    only 10 pending connections are displayed at one time
  */
  const PendingConnectionList = useMemo(() => {
    const renderView = (item, index) => {
      const last = index === pendingConnectionsToDisplay.length - 1;
      const moveToNext = () => {
        /** 
        setting viewpager active index zero will trigger the list to re - render
        */
        last
          ? viewPagerRef.current?.setPage(0)
          : viewPagerRef.current?.setPage(index + 1);
      };

      return (
        <View
          style={{ flex: 1, width: '100%' }}
          collapsable={false}
          key={index}
        >
          <PreviewConnectionController
            pendingConnectionId={item.id}
            viewPagerRef={viewPagerRef}
            index={index}
            moveToNext={moveToNext}
          />
        </View>
      );
    };
    console.log('RE-RENDERING VIEWPAGER');

    const Views = pendingConnectionsToDisplay.map(renderView);

    return (
      <ViewPager
        ref={viewPagerRef}
        style={{ flex: 1, width: '100%' }}
        initialPage={0}
        onPageSelected={(e) => {
          console.log('ON PAGE SELECTED', e.nativeEvent.position);
          setActiveIndex(e.nativeEvent.position);
        }}
        orientation="horizontal"
        transitionStyle="scroll"
        showPageIndicator={false}
      >
        {Views}
      </ViewPager>
    );
  }, [pendingConnectionsToDisplay]);

  console.log('ACTIVE INDEX', activeIndex);

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      {loading ? (
        <Spinner
          isVisible={true}
          size={DEVICE_LARGE ? 44 : 40}
          type="FadingCircleAlt"
          color={GREY}
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
              marginTop: DEVICE_LARGE ? -33 : -30,
            }}
            dotContainerStyle={{
              paddingTop: 5,
            }}
            dotsLength={pendingConnectionsToDisplay.length}
            activeDotIndex={activeIndex ?? 0}
            inactiveDotOpacity={0.4}
            inactiveDotScale={1}
            tappableDots={false}
          />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PendingConnectionsScreen;
