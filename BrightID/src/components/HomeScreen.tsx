import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { createSelector } from '@reduxjs/toolkit';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch, useSelector } from '@/store';
import { useTranslation } from 'react-i18next';
import { setActiveNotification } from '@/actions';
import { linkedContextTotal } from '@/reducer/appsSlice';
import { verifiedConnectionsSelector } from '@/reducer/connectionsSlice';
import { retrieveImage } from '@/utils/filesystem';
import { WHITE, ORANGE, BLACK, BLUE, DARKER_GREY } from '@/theme/colors';
import fetchUserInfo from '@/actions/fetchUserInfo';
import ChatBox from '@/components/Icons/ChatBox';
import VerifiedBadge from '@/components/Icons/VerifiedBadge';
import UnverifiedSticker from '@/components/Icons/UnverifiedSticker';
import Camera from '@/components/Icons/Camera';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { setHeaderHeight } from '@/reducer/walkthroughSlice';
import { uniq } from 'ramda';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import { version as app_version } from '../../package.json';

/**
 * Home screen of BrightID
 * ==========================
 */
const discordUrl = 'https://discord.gg/nTtuB2M';

/** Selectors */

export const verifiedAppsSelector = createSelector(
  (state: State) => state.user.verifications,
  (verifications) => verifications.filter((v) => (v as AppVerification).app),
);

export const brightIdVerifiedSelector = createSelector(
  (state: State) => state.user.verifications,
  (verifications) => verifications.some((v) => v?.name === 'BrightID'),
);

/** HomeScreen Component */

export const HomeScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();
  const name = useSelector((state: State) => state.user.name);
  const photoFilename = useSelector(
    (state: State) => state.user.photo.filename,
  );
  const groupsCount = useSelector((state: State) => state.groups.groups.length);
  const connectionsCount = useSelector(verifiedConnectionsSelector).length;
  const linkedContextsCount = useSelector(linkedContextTotal);
  const verifiedApps = useSelector(verifiedAppsSelector);
  const brightIdVerified = useSelector(brightIdVerifiedSelector);
  const baseUrl = useSelector(selectBaseUrl);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      retrieveImage(photoFilename).then(setProfilePhoto);
      setLoading(true);
      dispatch(fetchUserInfo()).then(() => {
        setLoading(false);
      });
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }, [dispatch, photoFilename]),
  );

  useEffect(() => {
    dispatch(setHeaderHeight(headerHeight));
  }, [dispatch, headerHeight]);

  const { showActionSheetWithOptions } = useActionSheet();

  // TODO Workaround till backend is fixed: make sure to only count unique app names
  const verifiedAppsCount = uniq(verifiedApps.map((app) => app.name)).length;

  const handleChat = () => {
    if (__DEV__) {
      const { delStorage } = require('@/utils/dev');
      delStorage();
    } else {
      showActionSheetWithOptions(
        {
          options: [
            t('home.chatActionSheet.discord'),
            t('common.actionSheet.cancel'),
          ],
          cancelButtonIndex: 1,
          title: t('home.chatActionSheet.title'),
          showSeparators: true,
          textStyle: {
            color: BLUE,
            textAlign: 'center',
            width: '100%',
          },
          titleTextStyle: {
            textAlign: 'center',
            width: '100%',
          },
        },
        (index) => {
          if (index === 0) {
            Linking.openURL(discordUrl).catch((err) =>
              console.log('An error occurred', err),
            );
          }
        },
      );
    }
  };

  const DeepPasteLink = () => {
    if (__DEV__) {
      return (
        <TouchableOpacity
          testID="pasteDeeplink"
          style={{
            position: 'absolute',
            left: 10,
            bottom: 10,
          }}
          onPress={async () => {
            let url = await Clipboard.getString();
            if (url.startsWith('https://app.brightid.org/connection-code/')) {
              url = url.replace(
                'https://app.brightid.org/connection-code/',
                '',
              );

              navigation.navigate('ScanCode', { qrcode: url });
            } else {
              url = url.replace('https://app.brightid.org', 'brightid://');
              console.log(`Linking.openURL with ${url}`);
              Linking.openURL(url);
            }
          }}
        >
          <Material
            name="content-paste"
            size={DEVICE_LARGE ? 28 : 23}
            color={WHITE}
          />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

  console.log('RENDERING HOME PAGE');

  return (
    // let verifications = ['BrightID'];
    <View style={[styles.container, { marginTop: headerHeight }]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
      <View style={styles.profileContainer} testID="PhotoContainer">
        {profilePhoto ? (
          <Image
            source={{
              uri: profilePhoto,
            }}
            style={styles.photo}
            resizeMode="cover"
            onError={(e) => {
              console.log(e);
            }}
            accessible={true}
            accessibilityLabel={t('common.accessibilityLabel.profilePhoto')}
          />
        ) : null}
        <View style={styles.verifyNameContainer} testID="homeScreen">
          <View style={styles.nameContainer}>
            <Text testID="EditNameBtn" style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            {brightIdVerified && (
              <View style={styles.verificationSticker}>
                <VerifiedBadge width={16} height={16} />
              </View>
            )}
          </View>
          <View style={styles.profileDivider} />
          {verifiedAppsCount > 0 ? (
            <View style={styles.verified}>
              <Text style={styles.verifiedText}>
                Verified for {verifiedAppsCount} app
                {verifiedAppsCount > 1 ? 's' : ''}
              </Text>
            </View>
          ) : loading ? (
            <View style={styles.verified}>
              <ActivityIndicator size="small" color={DARKER_GREY} animating />
            </View>
          ) : (
            <View style={styles.verified}>
              <UnverifiedSticker width={100} height={19} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.countsContainer}>
        <TouchableOpacity
          testID="connectionsBtn"
          style={styles.countsCard}
          onPress={() => {
            dispatch(setActiveNotification(null));
            navigation.navigate('Connections');
          }}
        >
          <Text testID="ConnectionsCount" style={styles.countsNumberText}>
            {connectionsCount}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>
            {t('home.button.connections')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="groupsBtn"
          style={styles.countsCard}
          onPress={() => {
            dispatch(setActiveNotification(null));
            navigation.navigate('Groups');
          }}
        >
          <Text testID="GroupsCount" style={styles.countsNumberText}>
            {groupsCount}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>
            {t('home.button.groups')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="appsBtn"
          style={styles.countsCard}
          onPress={() => {
            dispatch(setActiveNotification(null));
            navigation.navigate('Apps', {
              baseUrl: '',
              context: '',
              contextId: '',
            });
          }}
        >
          <Text testID="AppsCount" style={styles.countsNumberText}>
            {linkedContextsCount}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>
            {t('home.button.apps')}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomOrangeContainer}>
        <View style={styles.connectContainer}>
          <Text style={styles.newConnectionText}>
            {t('home.label.createNewConnection')}
          </Text>
          <TouchableOpacity
            testID="MyCodeBtn"
            style={styles.connectButton}
            onPress={() => {
              dispatch(setActiveNotification(null));
              navigation.navigate('MyCode');
            }}
            accessible={true}
            accessibilityLabel={t('home.accessibilityLabel.connect')}
          >
            <Material
              name="qrcode"
              color={BLACK}
              size={DEVICE_LARGE ? 25 : 20}
            />
            <Text style={styles.connectText}>{t('home.button.myCode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="ScanCodeBtn"
            style={styles.connectButton}
            onPress={() => {
              dispatch(setActiveNotification(null));
              navigation.navigate('ScanCode');
            }}
            accessible={true}
            accessibilityLabel={t('home.accessibilityLabel.connect')}
          >
            <Camera
              width={DEVICE_LARGE ? 25 : 20}
              height={DEVICE_LARGE ? 25 : 20}
            />
            <Text style={styles.connectText}>{t('home.button.scanCode')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="JoinCommunityBtn"
            style={styles.communityContainer}
            onPress={handleChat}
          >
            <ChatBox
              width={DEVICE_LARGE ? 22 : 20}
              height={DEVICE_LARGE ? 22 : 20}
              color={WHITE}
            />
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: WHITE,
                marginLeft: 5,
              }}
            >
              <Text style={styles.communityLink}>
                {t('home.link.community')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <DeepPasteLink />
        <Text style={styles.versionInfo}>v{app_version}</Text>
        {__DEV__ && <Text style={styles.nodeInfo}>{baseUrl}</Text>}
      </View>
    </View>
  );
};

const PHOTO_WIDTH = DEVICE_LARGE ? 90 : 78;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: ORANGE,
  },
  profileContainer: {
    flexDirection: 'row',
    width: '100%',
    flexGrow: 1,
    alignItems: 'center',
    paddingLeft: DEVICE_LARGE ? '15%' : '12%',
    backgroundColor: WHITE,
    paddingTop: DEVICE_LARGE ? 10 : 0,
  },
  verifyNameContainer: {
    flexDirection: 'column',
    marginLeft: DEVICE_LARGE ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: WHITE,
    maxWidth: '50%',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  profileDivider: {
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
    width: '118%',
  },
  photo: {
    width: PHOTO_WIDTH,
    height: PHOTO_WIDTH,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[18],
    color: BLACK,
  },
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: DEVICE_LARGE ? 10 : 0,
    width: '100%',
    backgroundColor: WHITE,
  },
  verificationSticker: {
    marginLeft: 5,
    marginTop: 1.5,
  },
  verified: {
    marginTop: 8,
    minWidth: 100,
  },
  verifiedText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: ORANGE,
    borderColor: ORANGE,
  },
  countsCard: {
    backgroundColor: WHITE,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 90 : 82,
    height: DEVICE_LARGE ? 100 : 90,
    borderRadius: 10,
    elevation: 5,
    shadowColor: 'rgba(221, 179, 169, 0.3)',
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 10,
  },
  countsContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '100%',
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    backgroundColor: WHITE,
    flexGrow: 1,
    paddingTop: DEVICE_LARGE ? 10 : 0,
  },
  countsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ORANGE,
    width: 55,
  },
  countsDescriptionText: {
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    fontSize: fontSize[12],
    marginTop: 6,
  },
  countsNumberText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: fontSize[25],
    marginBottom: 3,
  },
  bottomOrangeContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    marginTop: DEVICE_LARGE ? 17 : 15,
    zIndex: 10,
    flexGrow: 1,
  },
  connectContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  newConnectionText: {
    color: WHITE,
    fontSize: fontSize[18],
    fontFamily: 'Poppins-Medium',
    marginBottom: DEVICE_LARGE ? 16 : 11,
  },
  connectButton: {
    paddingTop: DEVICE_LARGE ? 11 : 7,
    paddingBottom: DEVICE_LARGE ? 10 : 6,
    width: DEVICE_LARGE ? '80%' : 260,
    borderRadius: 60,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 1,
    marginBottom: DEVICE_LARGE ? 16 : 11,
  },
  connectText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[17],
    color: BLACK,
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
  communityIcon: {
    marginTop: 1,
    marginRight: 5,
  },
  communityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: DEVICE_LARGE ? 20 : 12,
  },
  communityLink: {
    color: WHITE,
    fontSize: fontSize[14],
    fontFamily: 'Poppins-Bold',
  },
  versionInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: WHITE,
    position: 'absolute',
    right: DEVICE_LARGE ? 12 : 7,
    bottom: DEVICE_LARGE ? 12 : 7,
  },
  nodeInfo: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
    color: WHITE,
    position: 'absolute',
    left: 50,
    bottom: DEVICE_LARGE ? 12 : 7,
  },
});

export default HomeScreen;
