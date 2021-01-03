// @flow

import React, { useEffect, useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import { createSelector } from '@reduxjs/toolkit';
import Ionicon from 'react-native-vector-icons/Ionicons';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { WHITE, DARKER_GREY, BLACK, BLUE, RED } from '@/theme/colors';
import { addLinkedContext, removeLinkedContext } from '@/actions';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logo
 * @prop url
 */

const MAX_WAITING_SECONDS = 60;

const makeLinkedContextSelector = () =>
  createSelector(
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

  // Make sure each instance of AppCard has it's own selector. Otherwise they would
  // invalidate each others cache. See https://react-redux.js.org/next/api/hooks#using-memoizing-selectors
  const linkedContextSelector = useMemo(makeLinkedContextSelector, []);
  const linkedContext = useSelector((state) =>
    linkedContextSelector(state, context),
  );
  const { t } = useTranslation();

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
      t('apps.alert.text.checkWebsite', { name }),
      [
        {
          text: t('apps.alert.button.visitWebsite'),
          onPress: () => {
            Linking.openURL(url);
          },
        },
        {
          text: t('common.alert.cancel'),
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
        <Text style={styles.sponsorshipMessage}>
          {t('apps.tag.hasSponsorships')}
        </Text>
      );
    } else {
      return <View />;
    }
  };

  const VerificationLabel = () => {
    if (!verifications.includes(verification)) {
      return (
        <Text style={styles.unverifiedMessage}>
          {t('apps.tag.notVerifiedForApp')}
        </Text>
      );
    } else {
      return <View />;
    }
  };

  const StatusLabel = () => {
    if (isLinked) {
      return (
        <View style={styles.linkedContainer}>
          <Ionicon
            size={DEVICE_LARGE ? 48 : 42}
            name="md-checkmark"
            color={BLUE}
          />
          <Text testID={`Linked_${id}`} style={styles.linkedMessage}>
            {t('apps.tag.linked')}
          </Text>
        </View>
      );
    } else if (isFailed) {
      return (
        <TouchableOpacity
          style={styles.linkedContainer}
          onPress={removeContext}
        >
          <Material
            size={DEVICE_LARGE ? 40 : 36}
            name="alert-remove-outline"
            color={RED}
          />
          <Text testID={`Linked_${id}`} style={styles.errorMessage}>
            {t('apps.tag.tryAgain')}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  return (
    <View style={{ ...styles.container, ...style }} testID={`app-${id}`}>
      <TouchableOpacity style={styles.link} onPress={openApp}>
        <Image
          source={{
            uri: `${logo}`,
          }}
          style={styles.logo}
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={openApp}>
        <View style={styles.labelContainer}>
          <Text style={styles.appName}>{name}</Text>
          <SponsorshipLabel />
          <VerificationLabel />
        </View>
      </TouchableOpacity>
      <StatusLabel />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    height: DEVICE_LARGE ? 94 : 80,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  logo: {
    width: DEVICE_LARGE ? 64 : 48,
    height: DEVICE_LARGE ? 64 : 48,
    resizeMode: 'contain',
    marginLeft: DEVICE_LARGE ? 20 : 12,
  },
  appName: {
    fontFamily: 'Poppins-Medium',
    color: BLACK,
    fontSize: fontSize[22],
  },
  labelContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginLeft: DEVICE_LARGE ? 20 : 12,
  },
  sponsorshipMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLUE,
  },
  linkedMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: BLUE,
  },
  errorMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: RED,
  },
  unverifiedMessage: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[14],
    color: DARKER_GREY,
  },
  linkedContainer: {
    marginLeft: 'auto',
    marginRight: DEVICE_LARGE ? 20 : 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: {},
});

export default AppCard;
