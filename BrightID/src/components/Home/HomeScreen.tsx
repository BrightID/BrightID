import React, {
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  useMemo,
} from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  ImageBackground,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { createSelector } from '@reduxjs/toolkit';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import Svg, { Path, SvgXml } from 'react-native-svg';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel from 'react-native-snap-carousel';
import LinearGradient from 'react-native-linear-gradient';
import VerificationBadges from './VerificationBadges';
import AchivementCompletion from './AchievementCompletion';
import ConnectionsCard from './ConnectionsCard';
import ApplicationLinkedCard from './ApplicationLinkedCard';
import { button, bottomNav } from './BottomNavigation';
import { useDispatch, useSelector } from '@/store';
import {
  fetchApps,
  selectAllApps,
  setActiveNotification,
  updateBlindSigs,
} from '@/actions';
import {
  linkedContextTotal,
  selectAllLinkedContexts,
} from '@/reducer/appsSlice';
import { verifiedConnectionsSelector } from '@/reducer/connectionsSlice';
import { retrieveImage } from '@/utils/filesystem';
import { WHITE, ORANGE, BLACK, BLUE, DARKER_GREY } from '@/theme/colors';
import fetchUserInfo from '@/actions/fetchUserInfo';
import UnverifiedSticker from '@/components/Icons/UnverifiedSticker';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { fontSize } from '@/theme/fonts';
import { setHeaderHeight } from '@/reducer/walkthroughSlice';
import { selectBaseUrl } from '@/reducer/settingsSlice';
import { NodeApiContext } from '@/components/NodeApiGate';
import { getVerificationPatches } from '@/utils/verifications';

import {
  selectTaskIds,
  selectCompletedTaskIds,
} from '@/components/Tasks/TasksSlice';

import { version as app_version } from '../../../package.json';

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
  const apps = useSelector(selectAllApps);
  const taskIds = useSelector(selectTaskIds);
  const completedTaskIds = useSelector(selectCompletedTaskIds);
  // const verificationPatches = useSelector(verificationPatchesSelector);
  const verificationPatches = [{ text: 'Meets' }, { text: 'Bitu' }];

  const photoFilename = useSelector(
    (state: State) => state.user.photo.filename,
  );

  const connectionsCount = useSelector(verifiedConnectionsSelector);
  const linkedContextsCount = useSelector(linkedContextTotal);
  const linkedContext = useSelector(selectAllLinkedContexts);
  const baseUrl = useSelector(selectBaseUrl);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [loading, setLoading] = useState(true);
  const api = useContext(NodeApiContext);

  const { t } = useTranslation();

  const carouseRef = useRef();

  useFocusEffect(
    useCallback(() => {
      retrieveImage(photoFilename).then(setProfilePhoto);
      setLoading(true);
      dispatch(updateBlindSigs());
      dispatch(fetchUserInfo(api)).then(() => {
        setLoading(false);
      });
      const timeoutId = setTimeout(() => {
        setLoading(false);
      }, 3000);
      return () => {
        clearTimeout(timeoutId);
      };
    }, [api, dispatch, photoFilename]),
  );

  /* Update list of apps from server if
     - apps are empty (first startup?)
     - apps are from previous api version (app object in store
      is missing 'usingBlindSig' key)
   */
  useEffect(() => {
    if (api) {
      if (
        apps.length === 0 ||
        !Object.keys(apps[0]).includes('usingBlindSig')
      ) {
        console.log(`updating apps...`);
        dispatch(fetchApps(api));
      }
    }
  }, [api, apps, dispatch]);

  useEffect(() => {
    dispatch(setHeaderHeight(headerHeight));
  }, [dispatch, headerHeight]);

  const { showActionSheetWithOptions } = useActionSheet();

  const listLinkedApp = useMemo(() => {
    const linkedContextTemp = linkedContext.map((context) => context.context);
    const linked = apps.filter((app) => linkedContextTemp.includes(app.id));
    return linked;
  }, [apps, linkedContext]);

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
    <View style={styles.container}>
      <LinearGradient
        colors={['#ED7A5D', '#999ECD', '#3E4481']}
        style={[styles.headerBackground, { height: headerHeight * 1.5 }]}
      >
        <Image
          style={[styles.headerBackground, { height: headerHeight * 1.5 }]}
          source={{
            uri: 'https://s3-alpha-sig.figma.com/img/027c/21bf/7261527b75760d1cb81708b853209880?Expires=1644796800&Signature=e6qBOzYop-QY5Df9Boyo2RDwOSoUulAI1b4QiIwWrzU15Teoz1v8NKY5x4ScbJfOlO6TK7lolfm1lj2ii4wTuHXJREXjB-99U2uvJqRtklCJaHcRjBRT67WWUsnFhj5R5FQCkdNrrifZa4-bf4pWnYIPi7iRMjIg9LI8EccU301S-MCU7wEbNPLm~ifH3-3w~SsfIO1JoyNo0~~HTxfDzxWVwiRl8tlDQLU~ysADHhTgJa3rFczZoRhAdOhgSCLSnZMLPbbu-nwRhFYKyePEviY710NbsUy6r4UBDJGtftM9pxjB85gW4A91dwDnReqIehaVHjcbhDn4PCvbsCJ9cQ__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA',
          }}
        />
      </LinearGradient>

      <Image
        source={{ uri: profilePhoto }}
        style={{
          marginTop: headerHeight * 0.875,
          height: headerHeight * 1.25,
          aspectRatio: 1,
          borderRadius: headerHeight * 0.75,
          backgroundColor: WHITE,
          zIndex: 3,
        }}
      />
      <Text style={styles.username}>{name}</Text>

      <Text style={styles.verificationText}>Verifications Earned</Text>
      <View style={styles.verificationsContainer}>
        {verificationPatches.length > 0 ? (
          verificationPatches.map((patch, i) => (
            <VerificationBadges
              key={`verificationText-${i}`}
              onPress={() => {
                if (patch?.task?.navigationTarget) {
                  navigation.navigate(patch.task.navigationTarget, {
                    url: patch.task.url,
                  });
                }
              }}
              label={patch.text}
            />
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

      <Carousel
        ref={carouseRef}
        data={[0, 1, 2]}
        layout="default"
        sliderWidth={400}
        itemWidth={330}
        windowSize={1}
        containerCustomStyle={{
          marginTop: 15,
          overflow: 'visible',
        }}
        inactiveSlideOpacity={1}
        firstItem={1}
        renderItem={({ item }) => {
          switch (item) {
            case 0:
              return (
                <ConnectionsCard
                  onPress={() => {
                    dispatch(setActiveNotification(null));
                    navigation.navigate('Connections');
                  }}
                  connections={connectionsCount}
                />
              );
            case 1:
              return (
                <AchivementCompletion
                  onPress={() => {
                    navigation.navigate('Achievements');
                  }}
                  completedTaskIDs={completedTaskIds.length}
                  taskIDs={taskIds.length}
                />
              );
            case 2:
              return (
                <ApplicationLinkedCard
                  onPress={() => {
                    dispatch(setActiveNotification(null));
                    navigation.navigate('Apps', {
                      baseUrl: '',
                      context: '',
                      contextId: '',
                    });
                  }}
                  data={listLinkedApp}
                />
              );
            default:
              return null;
          }
        }}
      />

      <TouchableOpacity
        onPress={() => {
          dispatch(setActiveNotification(null));
          navigation.navigate('MyCode');
        }}
        style={styles.scanButton}
      >
        <SvgXml xml={button} width={100} height={100} />
      </TouchableOpacity>
      <View style={styles.bottomNav}>
        <SvgXml xml={bottomNav} width="100%" height={100} />
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
    backgroundColor: WHITE,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 2,
    opacity: 0.5,
  },
  username: {
    fontFamily: 'Poppins-Medium',
    fontSize: 18,
    marginTop: 8,
  },
  verificationsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: DEVICE_LARGE ? 10 : 0,
    // width: '100%',
    backgroundColor: WHITE,
  },
  verificationBox: {
    margin: 2,
  },
  verificationText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: ORANGE,
  },
  scanButton: {
    position: 'absolute',
    bottom: 10,
    alignItems: 'center',
    width: '100%',
    height: 100,
    zIndex: 10,
  },
  bottomNav: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: -20,
    width: '100%',
    height: 100,
  },
});

export default HomeScreen;
