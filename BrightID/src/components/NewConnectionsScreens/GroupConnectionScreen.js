// @flow

import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Svg, { Line, SvgXml } from 'react-native-svg';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';

import { DEVICE_LARGE, ORANGE, WIDTH, HEIGHT } from '@/utils/constants';

import {
  pendingConnection_states,
  selectAllPendingConnections,
  selectPendingConnectionById,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import backArrow from '@/static/back_arrow_black.svg';

/** HELPERS */

const radius = WIDTH / 2 - 35;

const degreeToRadian = (a: number) => a * (Math.PI / 180);

const isEven = (n: number) => n % 2 === 0;

const calcX = (a: number) =>
  WIDTH / 2 - 40 + radius * Math.cos(degreeToRadian(a));
const calcY = (a: number) =>
  HEIGHT / 2 - 40 + radius * Math.sin(degreeToRadian(a));

/** SELECTORS */

const selectGroupConnections = createSelector(
  selectAllPendingConnections,
  (_, channel) => channel,
  (pendingConnections, channel) => {
    console.log('calcing pending connections');
    return pendingConnections.filter(
      (pc) =>
        pc.channelId === channel?.id && pc.id !== channel?.initiatorProfileId,
    );
  },
);

/** MAIN */

export const GroupConnectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const circleArcOneOpacity = useRef(new Animated.Value(0)).current;
  const circleArcTwoOpacity = useRef(new Animated.Value(0)).current;

  const channel = route.params?.channel;

  const initiator = useSelector((state) =>
    selectPendingConnectionById(state, channel?.initiatorProfileId),
  );

  const groupConnections = useSelector((state) =>
    selectGroupConnections(state, channel),
  );

  useEffect(() => {
    console.log('in the animation effect');
    Animated.stagger(1500, [
      Animated.loop(
        Animated.timing(circleArcOneOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ),
      Animated.loop(
        Animated.timing(circleArcTwoOpacity, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
      ),
    ]).start();
  }, [circleArcOneOpacity, circleArcTwoOpacity]);
  // waiting rings animation

  const [bubbleCoords, setBubbleCoords] = useState([]);

  useEffect(() => {
    console.log('in the diff bubble coord effect');
    const diff = groupConnections.length - bubbleCoords.length;
    if (diff > 0) {
      let nextCoords = {};
      if (isEven(bubbleCoords.length)) {
        nextCoords.left = calcX(90 + bubbleCoords.length * 42);
        nextCoords.top = calcY(90 + bubbleCoords.length * 42);
      } else {
        nextCoords.left = calcX(270 + bubbleCoords.length * 42);
        nextCoords.top = calcY(270 + bubbleCoords.length * 42);
      }
      setBubbleCoords(bubbleCoords.concat(nextCoords));
    }

    if (diff < 0) {
      setBubbleCoords(bubbleCoords.slice(-1));
    }
  }, [groupConnections.length, bubbleCoords]);

  const GroupConnectionBubbles = () =>
    groupConnections.map((pc, index) => (
      <>
        {bubbleCoords[index] && (
          <Svg
            style={{ position: 'absolute', top: 0, left: 0 }}
            height={HEIGHT}
            width={WIDTH}
          >
            <Line
              x1={WIDTH / 2}
              y1={HEIGHT / 2}
              x2={bubbleCoords[index]?.left + 40}
              y2={bubbleCoords[index]?.top + 40}
              stroke={ORANGE}
              strokeWidth="2"
            />
          </Svg>
        )}
        <Image
          key={pc.id}
          style={[
            styles.connectionBubble,
            { left: bubbleCoords[index]?.left, top: bubbleCoords[index]?.top },
          ]}
          source={{ uri: pc.photo }}
        />
      </>
    ));

  console.log('rendering Group Connection Screen');

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.navigate('Home');
        }}
      >
        <SvgXml height={DEVICE_LARGE ? '22' : '20'} xml={backArrow} />
      </TouchableOpacity>
      <Text style={styles.title}>Group Connection</Text>
      <Animated.View
        style={[
          styles.circleArcOne,
          {
            opacity: circleArcOneOpacity.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.9, 0],
            }),
            transform: [
              {
                scale: circleArcOneOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circleArcTwo,
          {
            opacity: circleArcTwoOpacity.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.9, 0],
            }),
            transform: [
              {
                scale: circleArcTwoOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 2],
                }),
              },
            ],
          },
        ]}
      />
      {initiator?.photo && (
        <Image style={styles.groupFounder} source={{ uri: initiator?.photo }} />
      )}

      <GroupConnectionBubbles />

      <TouchableOpacity
        testID="GroupConnectionsToPendingConnectionsBtn"
        style={styles.confirmConnectionsButton}
        onPress={() => {
          navigation.navigate('PendingConnections');
        }}
      >
        <Material
          name="account-multiple-plus-outline"
          size={DEVICE_LARGE ? 32 : 26}
          color={ORANGE}
        />
        <Text style={styles.confirmConnectionsText}>Confirm Connections</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fdfdfd',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  title: {
    position: 'absolute',
    top: DEVICE_LARGE ? 51 : 32,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  cancelButton: {
    position: 'absolute',
    left: 0,
    top: DEVICE_LARGE ? 55 : 35,
    zIndex: 20,
    width: DEVICE_LARGE ? 60 : 50,
    alignItems: 'center',
  },
  bubbleView: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: WIDTH,
    height: HEIGHT,
  },
  groupFounder: {
    position: 'absolute',
    left: WIDTH / 2 - 45,
    width: 90,
    height: 90,
    borderWidth: 2,
    borderColor: ORANGE,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  circleArcOne: {
    position: 'absolute',
    left: WIDTH / 2 - 45,
    width: 90,
    height: 90,
    backgroundColor: 'transparent',
    borderWidth: 10,
    borderColor: ORANGE,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleArcTwo: {
    position: 'absolute',
    left: WIDTH / 2 - 45,
    width: 90,
    height: 90,
    backgroundColor: 'transparent',
    borderWidth: 10,
    borderColor: ORANGE,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectionBubble: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderColor: ORANGE,
    borderWidth: 2,
  },
  buttonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  rightArrow: {
    position: 'absolute',
    right: 0,
    // borderWidth: 1,
    // borderColor: 'grey',
    height: 80,
    justifyContent: 'center',
    width: 40,
  },
  confirmConnectionsButton: {
    position: 'absolute',
    top: HEIGHT * 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: '#fff',
    borderRadius: 60,
    width: DEVICE_LARGE ? 260 : 210,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  confirmConnectionsText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: ORANGE,
    marginLeft: 10,
  },
});

export default GroupConnectionScreen;
