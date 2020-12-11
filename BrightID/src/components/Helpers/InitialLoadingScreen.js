// @flow

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Spinner from 'react-native-spinkit';
import { bootstrap } from '@/bootstrap';
import { notificationSubscription } from '@/NotificationService';
import { BLUE } from '@/theme/colors';

export const InitialLoadingScreen = ({ app }: { app: boolean }) => {
  useEffect(() => {
    return () => {
      if (app) {
        console.log('BOOSTRAPING APP');
        bootstrap();
        console.log('SUBSCRIBING TO NOTIFICATIONS');

        notificationSubscription();
      }
    };
  }, []);
  return (
    <View style={styles.container}>
      <Spinner isVisible={true} size={47} type="FadingCircleAlt" color={BLUE} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InitialLoadingScreen;
