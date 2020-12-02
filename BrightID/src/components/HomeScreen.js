import React, { useCallback, useState, useMemo } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Clipboard,
} from 'react-native';
import { createSelector } from '@reduxjs/toolkit';
import { useFocusEffect } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { SvgXml } from 'react-native-svg';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveNotification } from '@/actions';
import { retrieveImage } from '@/utils/filesystem';
import fetchUserInfo from '@/actions/fetchUserInfo';
import verificationSticker from '@/static/verification-sticker.svg';
import qricon from '@/static/qr_icon_black.svg';
import cameraIcon from '@/static/camera_icon_black.svg';
import forumIcon from '@/static/forum_icon.svg';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { DEVICE_LARGE, DEVICE_ANDROID } from '@/utils/deviceConstants';
import { version as app_version } from '../../package.json';

/**
 * Home screen of BrightID
 * ==========================
 */

let discordUrl = 'https://discord.gg/nTtuB2M';

/** Selectors */

const linkedContextCountSelector = createSelector(
  (state) => state.apps.linkedContexts,
  (contexts) => contexts.filter((link) => link.state === 'applied').length,
);

export const verifiedSelector = createSelector(
  (state) => state.user.verifications,
  (verifications) => verifications.includes('BrightID'),
);

export const verifiedConnections = createSelector(
  (state) => state.connections.connections,
  (connections) =>
    connections.filter((conn) => conn.status === 'verified').length,
);

/** HomeScreen Component */

export const HomeScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const headerHeight = useHeaderHeight();
  const name = useSelector((state) => state.user.name);
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const groupsCount = useSelector((state) => state.groups.groups.length);
  const connectionsCount = useSelector(verifiedConnections);
  const linkedContextsCount = useSelector(linkedContextCountSelector);
  const verified = useSelector(verifiedSelector);

  const [profilePhoto, setProfilePhoto] = useState('');

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchUserInfo());
      retrieveImage(photoFilename).then(setProfilePhoto);
    }, [dispatch, photoFilename]),
  );

  const { showActionSheetWithOptions } = useActionSheet();

  const handleChat = () => {
    if (__DEV__) {
      const { delStorage } = require('@/utils/dev');
      delStorage();
    } else {
      showActionSheetWithOptions(
        {
          options: ['BrightID Discord', 'cancel'],
          cancelButtonIndex: 1,
          title: `Like to chat with us?`,
          showSeparators: true,
          textStyle: {
            color: '#2185D0',
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
            url = url.replace('https://app.brightid.org', 'brightid://');
            console.log(`Linking.openURL with ${url}`);
            Linking.openURL(url);
          }}
        >
          <Material
            name="content-paste"
            size={DEVICE_LARGE ? 28 : 23}
            color="white"
          />
        </TouchableOpacity>
      );
    } else {
      return null;
    }
  };

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
              console.log(e.error);
            }}
            accessible={true}
            accessibilityLabel="profile photo"
          />
        ) : null}
        <View style={styles.verifyNameContainer} testID="homeScreen">
          <View style={styles.nameContainer}>
            <Text testID="EditNameBtn" style={styles.name} numberOfLines={1}>
              {name}
            </Text>

            {verified && (
              <SvgXml
                style={styles.verificationSticker}
                width="16"
                height="16"
                xml={verificationSticker}
              />
            )}
          </View>
          <View style={styles.profileDivider} />
          {verified ? (
            <Text style={styles.verified}>verified</Text>
          ) : (
            <Text style={styles.unverified}>unverified</Text>
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
          <Text style={styles.countsDescriptionText}>Connections</Text>
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
          <Text style={styles.countsDescriptionText}>Groups</Text>
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
          <Text style={styles.countsDescriptionText}>Apps</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomOrangeContainer}>
        <View style={styles.connectContainer}>
          <Text style={styles.newConnectionText}>Create a New Connection</Text>
          <TouchableOpacity
            testID="MyCodeBtn"
            style={styles.connectButton}
            onPress={() => {
              dispatch(setActiveNotification(null));
              navigation.navigate('MyCode');
            }}
            accessible={true}
            accessibilityLabel="Connect"
          >
            <SvgXml
              xml={qricon}
              width={DEVICE_LARGE ? 25 : 20}
              height={DEVICE_LARGE ? 25 : 20}
            />
            <Text style={styles.connectText}>My Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="ScanCodeBtn"
            style={styles.connectButton}
            onPress={() => {
              dispatch(setActiveNotification(null));
              navigation.navigate('ScanCode');
            }}
            accessible={true}
            accessibilityLabel="Connect"
          >
            <SvgXml
              xml={cameraIcon}
              width={DEVICE_LARGE ? 25 : 20}
              height={DEVICE_LARGE ? 25 : 20}
            />
            <Text style={styles.connectText}>Scan a Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="JoinCommunityBtn"
            style={styles.communityContainer}
            onPress={handleChat}
          >
            <SvgXml
              width={DEVICE_LARGE ? 28 : 25}
              height={DEVICE_LARGE ? 28 : 25}
              xml={forumIcon}
            />
            <View style={{ borderBottomWidth: 1, borderBottomColor: '#fff' }}>
              <Text style={styles.communityLink}>Join the Community</Text>
            </View>
          </TouchableOpacity>
        </View>
        <DeepPasteLink />
        <Text style={styles.versionInfo}>v{app_version}</Text>
      </View>
    </View>
  );
};

const PHOTO_WIDTH = DEVICE_LARGE ? 90 : 78;
const ORANGE = '#ED7A5D';

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
    backgroundColor: '#fff',
    paddingTop: DEVICE_LARGE ? 10 : 0,
  },
  verifyNameContainer: {
    flexDirection: 'column',
    marginLeft: DEVICE_LARGE ? 40 : 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    fontSize: DEVICE_LARGE ? 18 : 15,
    color: '#000000',
  },
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: DEVICE_LARGE ? 10 : 0,
    width: '100%',
    backgroundColor: '#fff',
  },
  verificationSticker: {
    marginLeft: 5,
    marginTop: 1.5,
  },
  verified: {
    fontFamily: 'Poppins-Medium',
    color: ORANGE,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
    marginTop: 6,
    paddingTop: DEVICE_ANDROID ? 2 : 1,
    paddingBottom: DEVICE_ANDROID ? 0 : 1,
    paddingLeft: 23,
    paddingRight: 23,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  unverified: {
    fontFamily: 'Poppins-Medium',
    color: '#707070',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 10,
    marginTop: 6,
    paddingTop: DEVICE_ANDROID ? 2 : 1,
    paddingBottom: DEVICE_ANDROID ? 0 : 1,
    paddingLeft: 20,
    paddingRight: 20,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  countsCard: {
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
    fontSize: DEVICE_LARGE ? 12 : 11,
    marginTop: 6,
  },
  countsNumberText: {
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 25 : 21,
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
    color: '#fff',
    fontSize: DEVICE_LARGE ? 18 : 15,
    fontFamily: 'Poppins-Medium',
    marginBottom: DEVICE_LARGE ? 16 : 11,
  },
  connectButton: {
    paddingTop: DEVICE_LARGE ? 11 : 7,
    paddingBottom: DEVICE_LARGE ? 10 : 6,
    width: DEVICE_LARGE ? '80%' : 260,
    borderRadius: 60,
    backgroundColor: '#fff',
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
    fontSize: DEVICE_LARGE ? 17 : 15,
    color: '#000',
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
    color: '#fff',
    fontSize: DEVICE_LARGE ? 14 : 11,
    fontFamily: 'Poppins-Bold',
  },
  versionInfo: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#fff',
    position: 'absolute',
    right: DEVICE_LARGE ? 12 : 7,
    bottom: DEVICE_LARGE ? 12 : 7,
  },
});

export default HomeScreen;
