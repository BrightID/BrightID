/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import ActionSheet from 'react-native-actionsheet';
import { useDispatch, useSelector } from 'react-redux';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { setPhoto, setName } from '@/actions';
import { getNotifications } from '@/actions/notifications';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage } from '@/utils/filesystem';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import verificationSticker from '@/static/verification-sticker.svg';

if (__DEV__) {
  const { delStorage } = require('@/utils/dev');
}

/**
 * Home screen of BrightID
 * ==========================
 */

let chatSheetRef = '',
  photoSheetRef = '';
let discordUrl = 'https://discord.gg/nTtuB2M';
let JoinCommunity = DEVICE_IOS ? TextInput : Text;

export const HomeScreen = (props) => {
  const { navigation } = props;
  const dispatch = useDispatch();
  const id = useSelector((state) => state.user.id);
  const name = useSelector((state) => state.user.name);
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const groups = useSelector((state) => state.groups.groups);
  const apps = useSelector((state) => state.apps.apps);
  const verifications = useSelector((state) => state.user.verifications);
  const connections = useSelector((state) => state.connections.connections);
  const [profilePhoto, setProfilePhoto] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(name);

  const verified = useMemo(() => verifications.includes('BrightID'), [
    verifications,
  ]);

  useEffect(() => {
    navigation.addListener('focus', () => {
      dispatch(fetchUserInfo());
    });
    retrieveImage(photoFilename).then(setProfilePhoto);
  }, [dispatch, navigation, photoFilename]);

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      setPhoto({ filename });
      setProfilePhoto(await retrieveImage(filename));
    } catch (err) {
      console.log(err);
    }
  };

  const getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      setPhoto({ filename });
      setProfilePhoto(await retrieveImage(filename));
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditPhoto = () => {
    photoSheetRef.show();
  };

  const handleChat = () => {
    chatSheetRef.show();
  };

  return (
    // let verifications = ['BrightID'];

    <View style={styles.container} testID="homeScreen">
      <View style={styles.profileContainer} testID="PhotoContainer">
        <TouchableOpacity
          testID="editPhoto"
          onPress={handleEditPhoto}
          accessible={true}
          accessibilityLabel="edit photo"
        >
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
            accessibilityLabel="user photo"
          />
        </TouchableOpacity>
        <View style={styles.verifyNameContainer}>
          <View style={styles.nameContainer}>
            {isEditing ? (
              <TextInput
                testID="EditNameInput"
                value={displayName}
                style={styles.name}
                onChangeText={setDisplayName}
                onBlur={() => {
                  if (displayName.length >= 2) {
                    dispatch(setName(displayName));
                    setIsEditing(false);
                  } else {
                    setIsEditing(false);
                    setName(name);
                  }
                }}
                blurOnSubmit={true}
              />
            ) : (
              <Text
                testID="EditNameBtn"
                style={styles.name}
                onPress={() => setIsEditing(true)}
              >
                {name}
              </Text>
            )}
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
          style={styles.countsCard}
          onPress={() => {
            navigation.navigate('Connections');
          }}
        >
          <Text testID="ConnectionsCount" style={styles.countsNumberText}>
            {connections?.length ?? 0}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>Connections</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.countsCard}
          onPress={() => {
            navigation.navigate('Apps');
          }}
        >
          <Text testID="AppsCount" style={styles.countsNumberText}>
            {apps?.length ?? 0}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>Apps</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.countsCard}
          onPress={() => {
            navigation.navigate('Groups');
          }}
        >
          <Text testID="GroupsCount" style={styles.countsNumberText}>
            {groups?.length ?? 0}
          </Text>
          <View style={styles.countsBorder} />
          <Text style={styles.countsDescriptionText}>Groups</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.bottomOrangeContainer}>
        <View style={styles.connectContainer}>
          <Text style={styles.newConnectionText}>Create a New Connection</Text>
          <TouchableOpacity
            testID="ConnectButton"
            style={styles.connectButton}
            onPress={() => {
              navigation.navigate('MyCode');
            }}
            accessible={true}
            accessibilityLabel="Connect"
          >
            <Material
              name="qrcode"
              size={DEVICE_LARGE ? 22 : 20}
              color="#000"
              style={styles.connectIcon}
            />
            <Text style={styles.connectText}>My Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="ConnectButton"
            style={styles.connectButton}
            onPress={() => {
              navigation.navigate('ScanCode');
            }}
            accessible={true}
            accessibilityLabel="Connect"
          >
            <Material
              name="camera"
              size={DEVICE_LARGE ? 22 : 20}
              color="#000"
              style={styles.connectIcon}
            />
            <Text style={styles.connectText}>Scan a Code</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.communityContainer}
            onPress={handleChat}
          >
            <Ionicons
              name="ios-chatboxes"
              size={16}
              color="#fff"
              style={styles.communityIcon}
            />
            <JoinCommunity editable={false} style={styles.communityLink}>
              Join the Community
            </JoinCommunity>
          </TouchableOpacity>
        </View>
      </View>

      <ActionSheet
        testID="ChatActionSheet"
        ref={(o) => {
          chatSheetRef = o;
        }}
        title="Like to chat with us?"
        options={['BrightID Discord', 'cancel']}
        cancelButtonIndex={1}
        onPress={(index) => {
          if (index === 0) {
            Linking.openURL(discordUrl).catch((err) =>
              console.error('An error occurred', err),
            );
          }
        }}
      />
      <ActionSheet
        testID="PhotoActionSheet"
        ref={(o) => {
          photoSheetRef = o;
        }}
        title="Select photo"
        options={['Take Photo', 'Choose From Library', 'cancel']}
        cancelButtonIndex={2}
        onPress={(index) => {
          if (index === 0) {
            getPhotoFromCamera();
          } else if (index === 1) {
            getPhotoFromLibrary();
          }
        }}
      />
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
    paddingLeft: 50,
    backgroundColor: '#fff',
    paddingTop: DEVICE_LARGE ? 10 : 0,
  },
  verifyNameContainer: {
    flexDirection: 'column',
    marginLeft: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    // borderWidth: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    // width: '120%',
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
    // fontFamily: 'ApexNew-Book',
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
    color: ORANGE,
    borderWidth: 1,
    borderColor: ORANGE,
    borderRadius: 10,
    marginTop: 6,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 23,
    paddingRight: 23,
    fontSize: DEVICE_LARGE ? 11 : 10,
  },
  unverified: {
    color: '#707070',
    borderWidth: 1,
    borderColor: '#707070',
    borderRadius: 10,
    marginTop: 6,
    paddingTop: 1,
    paddingBottom: 1,
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
    // fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 12 : 11,
    fontWeight: '500',
    marginTop: 6,
  },
  countsNumberText: {
    // fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: DEVICE_LARGE ? 25 : 21,
    fontWeight: 'bold',
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
    // fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_LARGE ? 18 : 15,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: DEVICE_LARGE ? 10 : 8,
  },
  connectIcon: {
    marginTop: DEVICE_LARGE ? 3 : 2,
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
    borderBottomWidth: 1,
    borderBottomColor: '#fff',
    color: '#fff',
    fontSize: DEVICE_LARGE ? 14 : 11,
  },
});

export default HomeScreen;
