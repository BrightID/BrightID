import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import {
  DEVICE_LARGE,
  ORANGE,
  DEVICE_IOS,
  WIDTH,
  HEIGHT,
} from '@/utils/constants';
import {
  // pendingConnection_states,
  selectAllPendingConnections,
  selectPendingConnectionById,
} from '@/components/NewConnectionsScreens/pendingConnectionSlice';
import { difference } from 'ramda';

/** HELPERS */

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

function isEven(num) {
  return num % 2 === 0;
}

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

  const pendingConnections = useSelector((state) =>
    selectAllPendingConnections(state),
  );

  const groupConnections = pendingConnections.filter(
    (pc) =>
      pc.channelId === channel?.id && pc.id !== channel?.initiatorProfileId,
  );

  console.log('groupConnections', groupConnections);

  useEffect(() => {
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
  }, []);
  // waiting rings animation

  const [bubbleCoords, setBubbleCoords] = useState([]);

  useEffect(() => {
    const diff = groupConnections.length - bubbleCoords.length;
    if (diff > 0) {
      let nextCoords = {};
      if (isEven(bubbleCoords.length)) {
        nextCoords.left = getRandom(50, WIDTH - 50);
        nextCoords.top = getRandom(HEIGHT / 2 + 100, HEIGHT - 180);
      } else {
        nextCoords.left = getRandom(50, WIDTH - 50);
        nextCoords.top = getRandom(120, HEIGHT / 2 - 150);
      }
      setBubbleCoords(bubbleCoords.concat(nextCoords));
    }

    if (diff < 0) {
      setBubbleCoords(bubbleCoords.slice(-1));
    }
  }, [groupConnections.length, bubbleCoords]);

  console.log('bubbleCoords', bubbleCoords);

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
          style={{
            position: 'absolute',
            width: 80,
            height: 80,
            left: bubbleCoords[index]?.left,
            top: bubbleCoords[index]?.top,
            borderRadius: 40,
          }}
          source={{ uri: pc.photo }}
        />
      </>
    ));

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => {
          navigation.navigate('Home');
        }}
      >
        <Text>X</Text>
      </TouchableOpacity>
      <Text style={styles.infoTopText}>Group Connection</Text>
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
        style={styles.confirmButton}
        onPress={() => {
          navigation.navigate('PendingConnections');
        }}
      >
        <Text style={styles.buttonText}>Verify New Connections</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
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
    borderWidth: 1,
    borderColor: 'grey',
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
  infoTopText: {
    position: 'absolute',
    top: 60,
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 20 : 18,
    textAlign: 'center',
    color: '#4a4a4a',
  },
  scanCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: DEVICE_LARGE ? 42 : 36,
    backgroundColor: ORANGE,
    borderRadius: 60,
    width: 240,
    marginBottom: 36,
  },
  scanCodeText: {
    fontFamily: 'Poppins',
    fontWeight: 'bold',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#fff',
    marginLeft: 10,
  },
  cancelButton: {
    position: 'absolute',
    left: 25,
    top: 25,
    zIndex: 20,
  },
  confirmButton: {
    position: 'absolute',
    bottom: 40,
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 51,
    paddingLeft: 40,
    paddingRight: 40,
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
});

export default GroupConnectionScreen;
