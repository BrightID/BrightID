import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import { useDispatch, useSelector } from '@/store';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import {
  WHITE,
  DARKER_GREY,
  BLACK,
  BLUE,
  ORANGE,
  YELLOW,
} from '@/theme/colors';
import {
  updateLinkedContext,
  selectLinkedContext,
  createSelectLinkedSigsForApp,
} from '@/actions';

import { isVerified } from '@/utils/verifications';
import Check from '../Icons/Check';

/**
 * App Card in the Apps Screen
 * each App should have:
 * @prop name
 * @prop logo
 * @prop url
 */
const MAX_WAITING_SECONDS = 60;

const AppCard = (props: AppInfo) => {
  const {
    url,
    id,
    logo,
    name,
    unusedSponsorships,
    context,
    testing,
    verifications: appVerifications,
    usingBlindSig,
  } = props;
  const dispatch = useDispatch();
  const userVerifications = useSelector(
    (state: State) => state.user.verifications,
  );
  const [verifiedCount, setVerifiedCount] = useState(0);

  // Make sure each instance of AppCard has it's own selector. Otherwise they would
  // invalidate each others cache. See https://react-redux.js.org/next/api/hooks#using-memoizing-selectors
  const linkedContextSelector = useMemo(() => selectLinkedContext, []);
  const linkedContext = useSelector((state: State) =>
    linkedContextSelector(state, context),
  );

  const selectLinkedSigs = useMemo(
    () => createSelectLinkedSigsForApp(id),
    [id],
  );
  const linkedSigs = useSelector(selectLinkedSigs);

  const { t } = useTranslation();

  // Get verifications user has for this app
  useEffect(() => {
    let count = 0;
    for (const verification of appVerifications) {
      const verified = isVerified(
        _.keyBy(userVerifications, (v) => v.name),
        verification,
      );
      if (verified) {
        // console.log(`${name}: verified for ${verification}`);
        count++;
      } else {
        // console.log(`${name}: not verified for ${verification}`);
      }
    }
    setVerifiedCount(count);
  }, [appVerifications, name, userVerifications]);

  const isLinked = usingBlindSig ?
    linkedSigs.length > 0 :
    linkedContext && linkedContext.state === 'applied';
  const notSponsored = unusedSponsorships < 1 || !unusedSponsorships;

  useEffect(() => {
    let stale_check_timer;
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

      stale_check_timer = setTimeout(() => {
        dispatch(
          updateLinkedContext({
            contextId: linkedContext.contextId,
            state: 'failed',
          }),
        );
        Alert.alert('Error', `Failed to link with ${linkedContext.context}`);
      }, checkTime);
    }
    return () => {
      clearTimeout(stale_check_timer);
    };
  }, [linkedContext, dispatch]);

  const openApp = () => {
    if (url) {
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
            onPress: () => null,
          },
        ],
        { cancelable: true },
      );
    } else {
      console.log(`No url set for app ${name}`);
    }
  };

  const VerifiedLabel = () => {
    if (verifiedCount === appVerifications.length) {
      return (
        <View style={styles.verifiedContainer}>
          <Text style={styles.verifiedLabel}>verified</Text>
        </View>
      );
    } else if (verifiedCount > 0) {
      // partly verified
      return (
        <View style={styles.partVerifiedContainer}>
          <Text style={styles.partVerifiedLabel}>
            partly verified ({`${verifiedCount}/${appVerifications.length}`})
          </Text>
        </View>
      );
    } else {
      // no verification
      return (
        <View style={styles.unverifiedContainer}>
          <Text style={styles.unverifiedLabel}>
            unverified ({`${verifiedCount}/${appVerifications.length}`})
          </Text>
        </View>
      );
    }
  };

  const SponsorshipLabel = () => {
    if (notSponsored) {
      return (
        <View style={styles.sponsorshipContainer}>
          <Text style={styles.sponsorshipLabel}>no sponsorships</Text>
        </View>
      );
    } else {
      return null;
    }
  };

  const Labels = () => {
    return (
      <View style={styles.labelsContainer}>
        <SponsorshipLabel />
        <VerifiedLabel />
      </View>
    );
  };

  const LinkedSticker = () => {
    if (usingBlindSig) {
      // show x/y linked sigs
      return linkedSigs.length > 0 ? (
        <View style={styles.linkedContainer} testID={`Linked_${id}`}>
          <View style={styles.linkedSticker}>
            <Check
              width={fontSize[11]}
              height={fontSize[11]}
              strokeWidth={3}
              color={WHITE}
            />
          </View>
          <Text
            style={styles.linkedText}
          >{`Linked (${linkedSigs.length}/${appVerifications.length})`}</Text>
        </View>
      ) : null;
    } else {
      return isLinked ? (
        <View style={styles.linkedContainer} testID={`Linked_${id}`}>
          <View style={styles.linkedSticker}>
            <Check
              width={fontSize[11]}
              height={fontSize[11]}
              strokeWidth={3}
              color={WHITE}
            />
          </View>
          <Text style={styles.linkedText}>Linked</Text>
        </View>
      ) : null;
    }
  };

  // If app is testing and user is not linked, do not display card
  if (testing && !isLinked) {
    return null;
  }

  return (
    <View
      style={[styles.container, { opacity: notSponsored ? 0.7 : 1 }]}
      testID={`app-${id}`}
    >
      <TouchableOpacity onPress={openApp}>
        <Image
          source={{
            uri: logo !== '' ? logo : null,
          }}
          style={styles.logo}
        />
      </TouchableOpacity>

      <View style={styles.appContainer}>
        <View style={styles.titleContainer}>
          <TouchableOpacity style={styles.titleBtn} onPress={openApp}>
            <Text style={styles.title}>{name}</Text>
          </TouchableOpacity>
          <LinkedSticker />
        </View>
        <Labels />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingVertical: 10,
    marginBottom: DEVICE_LARGE ? 11.8 : 6,
    elevation: 2,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.43,
    shadowRadius: 4,
  },
  logo: {
    width: DEVICE_LARGE ? 50 : 40,
    height: DEVICE_LARGE ? 50 : 40,
    resizeMode: 'contain',
    marginLeft: DEVICE_LARGE ? 22 : 12,
  },
  appContainer: {
    flexDirection: 'column',
    marginLeft: DEVICE_LARGE ? 20 : 12,
    flexGrow: 1,
  },
  titleContainer: {
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBtn: {
    maxWidth: '63%',
  },
  title: {
    fontFamily: 'Poppins-Medium',
    color: BLACK,
    fontSize: fontSize[18],
  },
  linkedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'center',
    flexGrow: 1,
  },
  linkedSticker: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BLUE,
    borderRadius: 50,
    backgroundColor: BLUE,
    width: fontSize[18],
    height: fontSize[18],
    marginRight: 10,
  },
  linkedText: {
    fontFamily: 'Poppins-Regular',
    color: BLUE,
    marginRight: DEVICE_LARGE ? 15 : 10,
    fontSize: fontSize[13],
  },
  labelsContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5.5,
  },
  unverifiedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARKER_GREY,
    borderRadius: 10,
  },
  unverifiedLabel: {
    fontSize: fontSize[10],
    marginHorizontal: DEVICE_LARGE ? 9 : 7.5,
    marginVertical: DEVICE_LARGE ? 1.3 : 1.1,
    color: DARKER_GREY,
  },
  partVerifiedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: YELLOW,
    borderRadius: 10,
  },
  partVerifiedLabel: {
    fontSize: fontSize[10],
    marginHorizontal: DEVICE_LARGE ? 9 : 7.5,
    marginVertical: DEVICE_LARGE ? 1.3 : 1.1,
    color: YELLOW,
  },
  verifiedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
  },
  verifiedLabel: {
    fontSize: fontSize[10],
    marginHorizontal: DEVICE_LARGE ? 9 : 7.5,
    marginVertical: DEVICE_LARGE ? 1.3 : 1.1,
    color: ORANGE,
  },
  sponsorshipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: DARKER_GREY,
    borderRadius: 10,
    marginRight: 5,
  },
  sponsorshipLabel: {
    fontSize: fontSize[10],
    marginHorizontal: 5,
    marginVertical: 1.3,
    color: DARKER_GREY,
  },
});

export default AppCard;
