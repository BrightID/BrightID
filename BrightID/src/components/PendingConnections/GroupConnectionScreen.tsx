import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StatusBar,
  View,
} from 'react-native';
import {
  RouteProp,
  useNavigation,
  useRoute,
  useFocusEffect,
} from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Line } from 'react-native-svg';
import { createSelector } from '@reduxjs/toolkit';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector } from '@/store/hooks';
import { ORANGE, WHITE } from '@/theme/colors';
import { DEVICE_LARGE, WIDTH, HEIGHT } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import {
  selectAllUnconfirmedConnections,
  selectPendingConnectionById,
} from '@/components/PendingConnections/pendingConnectionSlice';

/** HELPERS */

const GROUP_TIMEOUT = 35000;

const radius = WIDTH / 2 - 35;

const degreeToRadian = (a: number) => a * (Math.PI / 180);

const isEven = (n: number) => n % 2 === 0;

const calcX = (a: number) =>
  WIDTH / 2 - 40 + radius * Math.cos(degreeToRadian(a));
const calcY = (a: number) =>
  HEIGHT / 2 - 120 + radius * Math.sin(degreeToRadian(a));

/** SELECTORS */

const selectGroupConnections = createSelector(
  selectAllUnconfirmedConnections,
  (_: State, channel: Channel) => channel,
  (pendingConnections, channel) => {
    console.log('calcing pending connections');
    return pendingConnections.filter(
      (pc) =>
        pc.channelId === channel?.id &&
        pc.profileId !== channel?.initiatorProfileId,
    );
  },
);

/** MAIN */
type GroupScreenRoute = RouteProp<
  { GroupScreen: { channel: Channel } },
  'GroupScreen'
>;

export const GroupConnectionScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<GroupScreenRoute>();

  const circleArcOneOpacity = useRef(new Animated.Value(0)).current;
  const circleArcTwoOpacity = useRef(new Animated.Value(0)).current;

  const channel = route.params?.channel;

  const initiator = useSelector((state: State) =>
    selectPendingConnectionById(state, channel?.initiatorProfileId),
  );

  const groupConnections = useSelector((state: State) =>
    selectGroupConnections(state, channel),
  );

  // automatically nav to the next screen after timeout
  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        navigation.navigate('PendingConnections');
      }, GROUP_TIMEOUT);
      return () => {
        clearTimeout(timer);
      };
    }, [navigation]),
  );

  useEffect(() => {
    console.log('in the animation effect');
    const circleAnim = Animated.stagger(1500, [
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
    ]);

    if (navigation.isFocused()) {
      circleAnim.start();
    }

    return () => {
      circleAnim.stop();
    };
  }, [circleArcOneOpacity, circleArcTwoOpacity, navigation]);
  // waiting rings animation

  const [bubbleCoords, setBubbleCoords] = useState([]);

  useEffect(() => {
    console.log('in the diff bubble coord effect');
    if (!navigation.isFocused()) return;
    const diff = groupConnections.length - bubbleCoords.length;
    if (diff > 0) {
      const nextCoords: { left?: number; top?: number } = {};
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
  }, [groupConnections.length, bubbleCoords, navigation]);

  const GroupConnectionBubbles = () =>
    navigation.isFocused()
      ? groupConnections.map((pc, index) => (
          <>
            {bubbleCoords[index] && (
              <Svg
                style={{ position: 'absolute', top: 0, left: 0 }}
                height={HEIGHT}
                width={WIDTH}
              >
                <Line
                  x1={WIDTH / 2}
                  y1={HEIGHT / 2 - 100}
                  x2={bubbleCoords[index]?.left + 40}
                  y2={bubbleCoords[index]?.top + 40}
                  stroke={ORANGE}
                  strokeWidth="2"
                />
              </Svg>
            )}
            <TouchableWithoutFeedback
              onPress={() => {
                navigation.navigate('FullScreenPhoto', {
                  photo: pc.pendingConnectionData.sharedProfile.photo,
                  base64: true,
                });
              }}
            >
              <Image
                key={pc.profileId}
                style={[
                  styles.connectionBubble,
                  {
                    left: bubbleCoords[index]?.left,
                    top: bubbleCoords[index]?.top,
                  },
                ]}
                source={{ uri: pc.pendingConnectionData.sharedProfile.photo }}
              />
            </TouchableWithoutFeedback>
          </>
        ))
      : null;

  console.log('rendering Group Connection Screen');

  return navigation.isFocused() ? (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <SafeAreaView style={styles.container}>
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
        {initiator?.pendingConnectionData.sharedProfile.photo && (
          <TouchableWithoutFeedback // style={styles.cancelButton}
            onPress={() => {
              navigation.navigate('FullScreenPhoto', {
                photo: initiator.pendingConnectionData.sharedProfile.photo,
                base64: true,
              });
            }}
          >
            <Image
              style={styles.groupFounder}
              source={{
                uri: initiator.pendingConnectionData.sharedProfile.photo,
              }}
            />
          </TouchableWithoutFeedback>
        )}

        {GroupConnectionBubbles()}

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
    </>
  ) : null;
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    borderTopLeftRadius: 58,
    borderTopRightRadius: 58,
    zIndex: 10,
    marginTop: -58,
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
    top: HEIGHT / 2 - 140,
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
    top: HEIGHT / 2 - 140,
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
    top: HEIGHT / 2 - 140,
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
    fontSize: fontSize[18],
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: WHITE,
  },
  rightArrow: {
    position: 'absolute',
    right: 0,
    height: 80,
    justifyContent: 'center',
    width: 40,
  },
  confirmConnectionsButton: {
    position: 'absolute',
    bottom: '8%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: WHITE,
    borderRadius: 60,
    width: DEVICE_LARGE ? 260 : 210,
    borderWidth: 2,
    borderColor: ORANGE,
  },
  confirmConnectionsText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[14],
    color: ORANGE,
    marginLeft: 10,
  },
});

export default GroupConnectionScreen;
