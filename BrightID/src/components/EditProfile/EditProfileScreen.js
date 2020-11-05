// @flow

import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { DEVICE_LARGE, DEVICE_IOS } from '@/utils/constants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage } from '@/utils/filesystem';
import { setPhoto, setName } from '@/actions';
import downCaret from '@/static/down_caret_blue.svg';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import { selectAllSocialMedia, removeSocialMedia } from './socialMediaSlice';
import socialMediaList from './socialMediaList';

const EditProfilePhoto = () => {
  const dispatch = useDispatch();
  const { showActionSheetWithOptions } = useActionSheet();

  const id = useSelector((state) => state.user.id);

  const [profilePhoto, setProfilePhoto] = useState('');
  const photoFilename = useSelector((state) => state.user.photo.filename);
  const { t } = useTranslation();

  useEffect(() => {
    if (!profilePhoto) {
      retrieveImage(photoFilename).then(setProfilePhoto);
    }
  }, [profilePhoto, photoFilename]);

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      const filename = await saveImage({
        imageName: id,
        base64Image: uri,
      });
      dispatch(setPhoto({ filename }));
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
      dispatch(setPhoto({ filename }));
      setProfilePhoto(await retrieveImage(filename));
    } catch (err) {
      console.log(err);
    }
  };

  const handleEditPhoto = () => {
    showActionSheetWithOptions(
      {
        options: [
          t('common.photoActionSheet.takePhoto'), 
          t('common.photoActionSheet.choosePhoto'), 
          t('common.actionSheet.cancel')
        ],
        cancelButtonIndex: 2,
        title: t('common.photoActionSheet.title'),
        // message: `Flagging ${name} will negatively effect their BrightID score, and this flag might be shown to other users.`,
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
        },
        titleTextStyle: {
          fontSize: DEVICE_LARGE ? 20 : 17,
        },
        messageTextStyle: {
          fontSize: DEVICE_LARGE ? 15 : 12,
        },
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          getPhotoFromCamera();
        } else if (buttonIndex === 1) {
          getPhotoFromLibrary();
        }
      },
    );
  };

  return (
    <View style={styles.profilePhotoContainer}>
      <TouchableOpacity
        testID="editPhoto"
        onPress={handleEditPhoto}
        accessible={true}
        accessibilityLabel={t('common.accessibilityLabel.editPhoto')}
        style={styles.changePhotoButton}
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
          accessibilityLabel="profile photo"
        />
        <Text style={styles.profilePhotoText}>{t('profile.text.changeProfilePicture')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const EditName = () => {
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.name);
  const [displayName, setDisplayName] = useState(name);
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setDisplayName(name);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <View style={styles.editNameContainer}>
      <Text style={styles.label}>{t('profile.label.name')}</Text>
      <TextInput
        style={styles.editNameInput}
        value={displayName}
        onChangeText={setDisplayName}
        onBlur={() => {
          if (displayName.length >= 2) {
            dispatch(setName(displayName));
          } else {
            setName(name);
          }
        }}
        blurOnSubmit={true}
        textContentType="name"
        placeholder={t('profile.placeholder.name')}
        placeholderTextColor="#707070"
      />
      {/* <View style={styles.bottomDivider} /> */}
    </View>
  );
};

const SocialMediaLinks = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const socialMediaItems = useSelector(selectAllSocialMedia);
  const { t } = useTranslation();

  const SocialMediaLinks = socialMediaItems.map((item) => {
    const socialMedia = socialMediaList[item.id];
    return (
      <View key={item.id} style={styles.socialMediaLinkContainer}>
        <TouchableOpacity
          style={styles.socialMediaSelect}
          onPress={() => {
            navigation.navigate('SelectSocialMedia', {
              order: item.order,
              prevId: item.id,
              page: 0,
            });
          }}
        >
          <Text style={styles.socialMediaType}>{socialMedia.name}</Text>
          <SvgXml
            width={DEVICE_LARGE ? 14 : 12}
            height={DEVICE_LARGE ? 14 : 12}
            xml={downCaret}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexGrow: 1 }}
          onPress={() => {
            navigation.navigate('SelectSocialMedia', {
              order: item.order,
              prevId: item.id,
              page: 1,
            });
          }}
        >
          <Text style={styles.socialMediaInput}>{item.profile}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            dispatch(removeSocialMedia(item.id));
          }}
        >
          <Material name="close" size={DEVICE_LARGE ? 18 : 16} color={'#000'} />
        </TouchableOpacity>
      </View>
    );
  });

  return (
    <View style={styles.socialMediaContainer}>
      <View style={styles.socialMediaLinkLabel}>
        <Text style={styles.label}>{t('profile.label.socialMediaLink')}</Text>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('SelectSocialMedia', {
              order: socialMediaItems.length,
              prevId: null,
              page: 0,
            });
          }}
          style={styles.addSocialMediaBtn}
        >
          <Material
            name="plus-thick"
            size={DEVICE_LARGE ? 18 : 16}
            color={'#2185D0'}
          />
        </TouchableOpacity>
      </View>

      {SocialMediaLinks}

      <View style={styles.bottomDivider} />
    </View>
  );
};

const ShowEditPassword = () => {
  const password = useSelector((state) => state.user.password);
  const [hidePassword, setHidePassword] = useState(true);
  const navigation = useNavigation();
  const { t } = useTranslation()

  useFocusEffect(
    useCallback(() => {
      setHidePassword(true);
    }, []),
  );

  // don't show this option if user does not have password
  if (!password) {
    return null;
  }

  let displayPassword = password;
  if (hidePassword) {
    displayPassword = '*'.repeat(password.length);
  }

  return (
    <View style={styles.showEditPasswordContainer}>
      <View style={styles.viewPasswordContainer}>
        <TouchableOpacity
          onPress={() => {
            setHidePassword(!hidePassword);
          }}
        >
          <Text style={styles.passwordText}>{t('profile.text.viewPassword')}</Text>
        </TouchableOpacity>
        <Text style={styles.displayPassword} selectable={true}>
          {displayPassword}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => {
          navigation.navigate('ChangePassword');
        }}
      >
        <Text style={styles.passwordText}>{t('profile.text.changePassword')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export const EditProfileScreen = function () {
  const { t } = useTranslation();

  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }

  const isDrawerOpen = useIsDrawerOpen();

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="graphExplorerScreen"
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <EditProfilePhoto />
        <EditName />
        <SocialMediaLinks />
        <ShowEditPassword />
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{t('profile.button.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>{t('profile.button.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
    paddingHorizontal: DEVICE_LARGE ? 40 : 30,
  },
  shadow: {
    shadowColor: 'rgba(196, 196, 196, 0.25)',
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  profilePhotoContainer: {
    marginTop: DEVICE_LARGE ? 20 : 18,
  },
  changePhotoButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#2185D0',
    marginTop: DEVICE_LARGE ? 6 : 5,
  },
  photo: {
    width: DEVICE_LARGE ? 90 : 78,
    height: DEVICE_LARGE ? 90 : 78,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  editNameContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 36 : 30,
  },
  label: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 11 : 10,
    color: '#B64B32',
  },
  editNameInput: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginTop: DEVICE_LARGE ? 4 : 2,
    width: '100%',
    color: '#000',
  },
  bottomDivider: {
    width: '100%',
    borderBottomColor: '#C4C4C4',
    borderBottomWidth: 1,
    marginTop: DEVICE_LARGE ? 16 : 12,
  },
  socialMediaContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 18 : 16,
  },
  socialMediaLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: DEVICE_LARGE ? 10 : 8,
  },
  socialMediaLinkLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialMediaSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: DEVICE_LARGE ? 18 : 15,
  },
  socialMediaType: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 16 : 14,
    color: '#2185D0',
    marginRight: DEVICE_LARGE ? 8 : 6,
  },
  addSocialMediaBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DEVICE_LARGE ? 6 : 4,
  },
  socialMediaInput: {
    fontFamily: 'Poppins',
    fontSize: DEVICE_LARGE ? 14 : 12,
    fontWeight: '300',
    color: '#000',
  },
  showEditPasswordContainer: {
    width: '100%',
    marginTop: DEVICE_LARGE ? 10 : 8,
  },
  viewPasswordContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 26 : 18,
  },
  changePasswordButton: {
    marginTop: DEVICE_LARGE ? 12 : 8,
  },
  passwordText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 13 : 11,
    color: '#2185D0',
  },
  displayPassword: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: DEVICE_LARGE ? 13 : 11,
    color: '#000',
  },
  saveContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 44 : 36,
  },
  saveButton: {
    width: DEVICE_LARGE ? 100 : 88,
    paddingTop: 10,
    paddingBottom: 9,
    backgroundColor: '#5DEC9A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
  cancelButton: {
    width: DEVICE_LARGE ? 100 : 88,
    paddingTop: 10,
    paddingBottom: 9,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#707070',
  },
  cancelButtonText: {
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
});

export default EditProfileScreen;
