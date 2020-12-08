// @flow

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react';
import { BackHandler, StyleSheet, StatusBar, View } from 'react-native';
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
const ZERO_CONNECTIONS_TIMEOUT = 2000;

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

  // this will trigger a re-render of the carousel
  // causes a glitch in the UI on Android
  const resetDisplayConnections = useCallback(() => {
    const connectionsToDisplay = pendingConnections;
    // this will cause the PendingConnectionList to re render
    setPendingConnectionsDisplay(connectionsToDisplay);
  }, [pendingConnections]);

  useFocusEffect(
    useCallback(() => {
      resetDisplayConnections();
      dispatch(setActiveNotification(null));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // re-render list if no connections are displayed or end of list
  useEffect(() => {
    if (activeIndex === pendingConnectionsToDisplay.length - 1) {
      resetDisplayConnections();
    }
  }, [
    resetDisplayConnections,
    pendingConnectionsToDisplay.length,
    activeIndex,
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
    const renderView = (item, index) => {
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
            last={index === pendingConnectionsToDisplay.length - 1}
          />
        </View>
      );
    };
    console.log('rendering pending connections VIEWPAGER');

    const Views = pendingConnectionsToDisplay.map(renderView);

    return (
      <ViewPager
        ref={viewPagerRef}
        style={{ flex: 1, width: '100%' }}
        initialPage={0}
        onPageSelected={(e) => {
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

  return (
    <SafeAreaView style={[styles.container]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      {}
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
