import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { createSelector } from '@reduxjs/toolkit';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from '@/store';
import {
  fetchApps,
  setActiveNotification,
  updateBlindSigs,
  selectActiveDevices,
} from '@/actions';
import { linkedContextTotal } from '@/reducer/appsSlice';
import { verifiedConnectionsSelector } from '@/reducer/connectionsSlice';
import { retrieveImage } from '@/utils/filesystem';
import { WHITE, ORANGE, BLACK, BLUE, DARKER_GREY } from '@/theme/colors';
import fetchUserInfo from '@/actions/fetchUserInfo';
import ChatBox from '@/components/Icons/ChatBox';
import UnverifiedSticker from '@/components/Icons/UnverifiedSticker';
import Camera from '@/components/Icons/Camera';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { setHeaderHeight } from '@/reducer/walkthroughSlice';
import {
  selectBaseUrl,
  selectIsPrimaryDevice,
  removeCurrentNodeUrl,
} from '@/reducer/settingsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import { getVerificationPatches } from '@/utils/verifications';
import {
  selectTaskIds,
  selectCompletedTaskIds,
} from '@/components/Tasks/TasksSlice';

import { version as app_version } from '../../package.json';
import { uInt8ArrayToB64 } from '@/utils/encoding';
import { updateSocialMediaVariations } from '@/components/EditProfile/socialMediaThunks';

/**
 * Home screen of BrightID
 * ==========================
 */
const discordUrl = 'https://discord.gg/nTtuB2M';

/** Selectors */

export const verificationPatchesSelector = createSelector(
  (state: State) => state.user.verifications,
  getVerificationPatches,
);

/** HomeScreen Component */

export const HomeScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();
  const name = useSelector((state: State) => state.user.name);
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);
  const verificationPatches = useSelector(verificationPatchesSelector);
  const isPrimaryDevice = useSelector(selectIsPrimaryDevice);
  const activeDevices = useSelector(selectActiveDevices);
  const photoFilename = useSelector(
    (state: State) => state.user.photo.filename,
  );
  const connectionsCount = useSelector(verifiedConnectionsSelector).length;
  const linkedContextsCount = useSelector(linkedContextTotal);
  const baseUrl = useSelector(selectBaseUrl);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const api = useContext(NodeApiContext);
  const { id } = useSelector((state: State) => state.user);
  const { secretKey, publicKey } = useSelector((state) => state.keypair);

  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      retrieveImage(photoFilename).then(setProfilePhoto);
      setLoading(true);
      if (isPrimaryDevice) {
        dispatch(updateBlindSigs());
      }
      dispatch(fetchUserInfo(api)).then(() => {
        setLoading(false);
      });
      dispatch(updateSocialMediaVariations());
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }, [api, dispatch, isPrimaryDevice, photoFilename]),
  );

  useEffect(() => {
    if (api) {
      console.log(`updating apps...`);
      dispatch(fetchApps(api));
    }
  }, [api, dispatch]);

  useEffect(() => {
    if (activeDevices.length) {
      console.log(`checking signing key...`);
      const invalidSigingKey = !activeDevices.find(
        (d) => d.signingKey === publicKey,
      );
      if (invalidSigingKey) {
        return Alert.alert(
          t('common.alert.title.invalidSigningKey'),
          t('common.alert.text.invalidSigningKey'),
          [
            {
              text: 'Switch to different node',
              onPress: () => {
                dispatch(removeCurrentNodeUrl());
              },
            },
          ],
        );
      }
    }
  }, [activeDevices, dispatch, publicKey, t]);

  useEffect(() => {
    dispatch(setHeaderHeight(headerHeight));
  }, [dispatch, headerHeight]);

  const { showActionSheetWithOptions } = useActionSheet();

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

  const userBrightId = __DEV__ ? (
    <View>
      <Text testID="userBrightId" style={{ fontSize: 6, color: WHITE }}>
        {id}
      </Text>
      <Text testID="userPublicKey" style={{ fontSize: 6, color: WHITE }}>
        {publicKey}
      </Text>
      <Text testID="userSecretKey" style={{ fontSize: 6, color: WHITE }}>
        {uInt8ArrayToB64(secretKey)}
      </Text>
    </View>
  ) : null;

  console.log('RENDERING HOME PAGE');

  return (
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
          </View>
          <View style={styles.profileDivider} />
          <View style={styles.verificationsContainer}>
            {verificationPatches.length > 0 ? (
              verificationPatches.map((patch, i) => (
                <TouchableOpacity
                  key={`verificationPatch-${i}`}
                  style={styles.verificationBox}
                  onPress={() => {
                    if (patch?.task?.navigationTarget) {
                      navigation.navigate(patch.task.navigationTarget, {
                        url: patch.task.url,
                      });
                    }
                  }}
                >
                  <Text
                    key={`verificationText-${i}`}
                    style={styles.verificationText}
                  >
                    {patch.text}
                  </Text>
                </TouchableOpacity>
              ))
            ) : loading ? (
              <View style={styles.verificationBox}>
                <ActivityIndicator size="small" color={DARKER_GREY} animating />
              </View>
            ) : (
              <View style={styles.verificationBox}>
                <UnverifiedSticker width={100} height={19} />
              </View>
            )}
          </View>
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
          testID="achievementsBtn"
          style={styles.countsCard}
          onPress={() => {
            navigation.navigate('Achievements');
          }}
        >
          <Text testID="AchievementsCount" style={styles.countsNumberText}>
            {completedTaskIds.length}{' '}
            <Text style={styles.totalCountsNumberText}>
              {' '}
              / {taskIds.length}{' '}
            </Text>
          </Text>

          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>
            {t('home.button.achievements')}
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
        <View style={styles.infoContainer}>
          <TouchableOpacity
            style={styles.nodeLinkContainer}
            onPress={() => navigation.navigate('NodeModal')}
          >
            <Text style={styles.nodeLink}>
              {baseUrl ? baseUrl.split('://')[1] : 'disconnected'} - v{' '}
              {app_version}
            </Text>
          </TouchableOpacity>
        </View>
        {userBrightId}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: DEVICE_LARGE ? 10 : 0,
    width: '100%',
    backgroundColor: WHITE,
  },
  verificationBox: {
    margin: 2,
  },
  verificationText: {
    paddingLeft: 4,
    paddingRight: 4,
    paddingTop: 4,
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[11],
    color: BLUE,
    borderColor: BLUE,
    borderWidth: 1,
    borderRadius: 8,
    textAlign: 'center',
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
  totalCountsNumberText: {
    fontSize: fontSize[12],
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
  infoContainer: {
    position: 'absolute',
    right: DEVICE_LARGE ? 12 : 7,
    bottom: DEVICE_LARGE ? 12 : 7,
    flexDirection: 'row',
  },
  nodeLinkContainer: {},
  nodeLink: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[11],
    color: WHITE,
  },
});

export default HomeScreen;
