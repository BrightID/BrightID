// @flow

import React, { useState, useRef, useEffect } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import Ionicon from 'react-native-vector-icons/Ionicons';
import { MAX_WAITING_SECONDS, DEVICE_LARGE } from '@/utils/constants';
import { addLinkedContext, removeLinkedContext } from '@/actions';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logo
 * @prop url
 */

const linkedContextSelector = createSelector(
  (state) => state.apps.linkedContexts,
  (_, context: string) => context,
  (linkedContexts, context) =>
    linkedContexts.find((link) => link.context === context),
);

const AppCard = (props) => {
  const {
    url,
    id,
    logo,
    name,
    style,
    verification,
    unusedSponsorships,
    context,
  } = props;
  const dispatch = useDispatch();
  const verifications = useSelector((state) => state.user.verifications);
  const isSponsored = useSelector((state) => state.user.isSponsored);
  const linkedContext = useSelector((state) =>
    linkedContextSelector(state, context),
  );

  const isLinked = linkedContext && linkedContext.state === 'applied';
  const isFailed = linkedContext && linkedContext.state === 'failed';

  useEffect(() => {
    if (linkedContext && linkedContext.state === 'pending') {
      let checkTime =
        linkedContext.dateAdded +
        MAX_WAITING_SECONDS * 1000 +
        5000 -
        Date.now();

      if (checkTime < 0) {
        console.log(`Warning - checkTime in past: ${checkTime}`);
        checkTime = 1000; // check in 1 second
      }

      console.log(`Marking linkedContext as stale in ${checkTime}ms.`);

      let stale_check_timer = setTimeout(() => {
        dispatch(
          addLinkedContext({
            context: linkedContext.context,
            contextId: linkedContext.contextId,
            dateAdded: linkedContext.dateAdded,
            state: 'failed',
          }),
        );
      }, checkTime);
      return () => {
        clearTimeout(stale_check_timer);
      };
    }
  }, [linkedContext, dispatch]);

  const openApp = () => {
    Alert.alert(
      '',
      `Would you like to know more about ${context}?`,
      [
        {
          text: 'Sure',
          onPress: () => {
            Linking.openURL(url);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {},
        },
      ],
      { cancelable: true },
    );
  };

  const removeContext = () => {
    dispatch(removeLinkedContext(context));
  };

  const SponsorshipLabel = () => {
    if (!isSponsored && unusedSponsorships > 0) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.sponsorshipMessage}>Has sponsorships</Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  const VerificationLabel = () => {
    if (!verifications.includes(verification)) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.errorMessage}>Not verified for this app</Text>
        </View>
      );
    } else {
      return <View style={styles.stateContainer} />;
    }
  };

  const StatusLabel = () => {
    if (isLinked) {
      return (
        <View style={styles.linkedContainer}>
          <Ionicon size={48} name="md-checkmark" color="#4a90e2" />
          <Text testID={`Linked_${id}`} style={styles.linkedMessage}>
            Linked
          </Text>
        </View>
      );
    } else if (isFailed) {
      return (
        <View style={styles.linkedContainer}>
          <Ionicon size={48} name="alert-circle-outline" color="#FF0800" />
          <Text testID={`Linked_${id}`} style={styles.errorMessage}>
            Try Again
          </Text>
        </View>
      );
    } else {
      return null;
    }
  };

  return (
    <View style={{ ...styles.container, ...style }}>
      <TouchableOpacity style={styles.link} onPress={openApp}>
        <Image
          source={{
            uri: `${logo}`,
          }}
          style={styles.logo}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={openApp}>
        <Text style={styles.name}>{name}</Text>
        <SponsorshipLabel />
        <VerificationLabel />
      </TouchableOpacity>
      <StatusLabel />
      {isFailed ? (
        <TouchableOpacity style={{ marginRight: 10 }} onPress={removeContext}>
          <Ionicon size={DEVICE_LARGE ? 26 : 22} name="close" color="#333" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  logo: {
    width: DEVICE_LARGE ? 64 : 55,
    height: DEVICE_LARGE ? 64 : 55,
    resizeMode: 'contain',
    marginLeft: 20,
  },
  name: {
    fontFamily: 'Poppins',
    color: 'black',
    fontSize: DEVICE_LARGE ? 24 : 22,
    marginLeft: 20,
  },
  stateContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginLeft: 20,
  },
  sponsorshipMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#4a90e2',
  },
  linkedMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#4a90e2',
  },
  errorMessage: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#FF0800',
  },
  linkedContainer: {
    marginLeft: 'auto',
    marginRight: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {},
});

export default AppCard;
