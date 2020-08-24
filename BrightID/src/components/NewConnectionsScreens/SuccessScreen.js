// @flow

import React, { useCallback } from 'react';
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { sortByDateAddedDescending } from '../Connections/models/sortingUtility';

/**
 * Successfly Added Connection Confirmation Screen of BrightID
 *
==================================================================
 *
 */

export const SuccessScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  // clear navigation history to prevent going back to confirmation and preview screens with back button
  const resetNav = useCallback(() => {
    navigation.reset({
      index: 1,
      routes: [
        { name: 'Home' },
        {
          name: 'Connections',
        },
      ],
    });
    return true;
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      BackHandler.addEventListener('hardwareBackPress', resetNav);
      return () =>
        BackHandler.removeEventListener('hardwareBackPress', resetNav);
    }, [resetNav]),
  );
  return (
    <SafeAreaView testID="successScreen" style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />

      <View style={styles.successTextContainer}>
        <Text style={styles.successText}>Connection Successful!</Text>
        <Image
          source={require('@/static/success.png')}
          style={styles.successImage}
          resizeMode="cover"
          onError={(e) => {
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="success image"
        />
      </View>

      <View style={styles.confirmButtonContainer}>
        <TouchableOpacity
          testID="successDoneBtn"
          onPress={() => {
            dispatch(sortByDateAddedDescending());

            resetNav();
          }}
          style={styles.confirmButton}
        >
          <Text style={styles.confirmButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexDirection: 'column',
  },
  successTextContainer: {
    // flex: 1,
    // marginTop: 131,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#000000',
  },
  successImageContainer: {
    // flex: 1,
    // marginTop: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successImage: {
    width: 170,
    height: 170,
    marginTop: 42,
  },
  connectName: {
    fontFamily: 'ApexNew-Book',
    marginTop: 15,
    fontSize: 30,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  confirmButtonContainer: {
    // flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    borderRadius: 3,
    backgroundColor: '#4a90e2',
    width: '82%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  confirmButtonText: {
    fontFamily: 'ApexNew-Book',
    fontSize: 18,
    fontWeight: '500',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
});

export default SuccessScreen;
