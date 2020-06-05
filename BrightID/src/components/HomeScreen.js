/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
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
import { delStorage } from '@/utils/dev';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage } from '@/utils/filesystem';
import { DEVICE_LARGE, DEVICE_SMALL } from '@/utils/constants';
import fetchUserInfo from '@/actions/fetchUserInfo';
import verificationSticker from '@/static/verification-sticker.svg';

/**
 * Home screen of BrightID
 * ==========================
 */

let chatSheetRef = '',
  photoSheetRef = '';
let discordUrl = 'https://discord.gg/nTtuB2M';

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

  useEffect(() => {
    navigation.addListener('focus', () => {
      dispatch(fetchUserInfo());
    });
    retrieveImage(photoFilename).then(setProfilePhoto);
  }, []); // Only re-run the effect if count changes

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
                autoFocus
                onBlur={() => {
                  if (displayName.length >= 2) {
                    dispatch(setName(displayName));
                    setIsEditing(false);
                  } else {
                    setIsEditing(false);
                    setName(name);
                  }
                }}
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
            <SvgXml
              style={styles.verificationSticker}
              width="16"
              height="16"
              xml={verificationSticker}
            />
          </View>
          <Text style={styles.verified}>verified</Text>
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

      <View style={styles.connectContainer}>
        <Text style={styles.newConnectionText}>Create a New Connection</Text>
        <TouchableOpacity
          testID="ConnectButton"
          style={styles.connectButton}
          onPress={() => {
            navigation.navigate('NewConnection');
          }}
          accessible={true}
          accessibilityLabel="Connect"
        >
          <Material name="qrcode-scan" size={26} color="#fff" />
          <Text style={styles.connectText}>New Connection</Text>
        </TouchableOpacity>
        <TouchableOpacity
          testID="ConnectButton"
          style={styles.connectButton}
          onPress={() => {
            navigation.navigate('NewConnection');
          }}
          accessible={true}
          accessibilityLabel="Connect"
        >
          <Material name="qrcode-scan" size={26} color="#fff" />
          <Text style={styles.connectText}>New Connection</Text>
        </TouchableOpacity>
        <Text style={styles.newConnectionText}>Join the Community</Text>
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

const PHOTO_WIDTH = DEVICE_LARGE ? 85 : 80;
const NUMBER_SIZE = DEVICE_LARGE ? 25 : 21;
const DESC_SIZE = DEVICE_LARGE ? 14 : 12;
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
    // height: PHOTO_WIDTH,
    paddingTop: 100,
    paddingBottom: 30,
    alignItems: 'center',
    paddingLeft: 60,
    backgroundColor: '#fff',
  },
  verifyNameContainer: {
    flexDirection: 'column',
    height: PHOTO_WIDTH,
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    // borderWidth: 1,
  },
  nameContainer: {
    paddingLeft: 10,
    paddingRight: 10,
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
    paddingBottom: 3,
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
    fontSize: DEVICE_LARGE ? 16 : 14,

    color: '#000000',
  },
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: DEVICE_SMALL ? 0 : 10,
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
    marginTop: 5,
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 23,
    paddingRight: 23,
  },
  countsCard: {
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 98,
    height: 103,
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
    paddingTop: 50,
    paddingBottom: 90,
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    backgroundColor: '#fff',
  },
  countsBorder: {
    borderBottomWidth: 1,
    borderBottomColor: ORANGE,
    width: 55,
  },
  countsDescriptionText: {
    // fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: DESC_SIZE,
    fontWeight: '500',
    marginTop: 6,
  },
  countsNumberText: {
    // fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: NUMBER_SIZE,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  connectContainer: {
    flexDirection: 'column',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
    marginTop: DEVICE_SMALL ? 0 : 17,
    zIndex: 10,
  },
  newConnectionText: {
    color: '#fff',
    fontSize: 18,
    marginBottom: 44,
  },
  connectButton: {
    paddingTop: DEVICE_LARGE ? 16 : 13,
    paddingBottom: DEVICE_LARGE ? 15 : 13,
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
    marginBottom: 22,
  },
  connectText: {
    // fontFamily: 'ApexNew-Medium',
    fontSize: DEVICE_SMALL ? 16 : 22,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 18,
  },
});

export default HomeScreen;
