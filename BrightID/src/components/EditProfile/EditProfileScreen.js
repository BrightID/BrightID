// @flow

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { DEVICE_LARGE, DEVICE_IOS, WIDTH } from '@/utils/deviceConstants';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import { chooseImage, takePhoto } from '@/utils/images';
import { saveImage, retrieveImage, photoDirectory } from '@/utils/filesystem';
import { setPhoto, setName } from '@/actions';
import downCaret from '@/static/down_caret_blue.svg';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  selectAllSocialMedia,
  removeSocialMedia,
  setProfileDisplayWidth,
} from './socialMediaSlice';

const EditProfilePhoto = ({ profilePhoto, setProfilePhoto }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const prevPhotoFilename = useSelector((state) => state.user.photo.filename);
  const { t } = useTranslation();

  const profileSource = profilePhoto
    ? {
        uri: profilePhoto,
      }
    : {
        uri: `file://${photoDirectory()}/${prevPhotoFilename}`,
      };

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      setProfilePhoto(uri);
    } catch (err) {
      console.log(err);
    }
  };

  const getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      setProfilePhoto(uri);
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
        showSeparators: true,
        textStyle: {
          color: '#2185D0',
          textAlign: 'center',
          width: '100%',
          fontSize: DEVICE_LARGE ? 18 : 16,
        },
        titleTextStyle: {
          textAlign: 'center',
          fontSize: DEVICE_LARGE ? 20 : 17,
          width: '100%',
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
          source={profileSource}
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

const EditName = ({ nextName, setNextName }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.editNameContainer}>
      <Text style={styles.label}>{t('profile.label.name')}</Text>
      <TextInput
        style={styles.editNameInput}
        value={nextName}
        onChangeText={setNextName}
        textContentType="name"
        placeholder={t('profile.placeholder.name')}
        placeholderTextColor="#707070"
      />
    </View>
  );
};

const SocialMediaLink = (props) => {
  const {
    navigation,
    dispatch,
    id,
    profile,
    profileDisplayWidth,
    order,
    company,
  } = props;

  // perfectly center profile text with max length
  const updateInnerTextLayout = (e) => {
    if (!profileDisplayWidth) {
      if (e.nativeEvent?.layout?.width) {
        dispatch(
          setProfileDisplayWidth({
            id,
            width: e.nativeEvent.layout.width,
          }),
        );
      } else {
        dispatch(
          setProfileDisplayWidth({
            id,
            width: '50%',
          }),
        );
      }
    }
  };

  const innerTextStyle = profileDisplayWidth
    ? { width: profileDisplayWidth }
    : { flexGrow: 1 };

  return (
    <View style={styles.socialMediaLinkContainer}>
      <TouchableOpacity
        style={styles.socialMediaSelect}
        onPress={() => {
          navigation.navigate('SelectSocialMedia', {
            order,
            prevId: id,
            page: 0,
          });
        }}
      >
        <Text style={styles.socialMediaType}>{company.name}</Text>
        <SvgXml
          width={DEVICE_LARGE ? 14 : 12}
          height={DEVICE_LARGE ? 14 : 12}
          xml={downCaret}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={innerTextStyle}
        onLayout={updateInnerTextLayout}
        onPress={() => {
          navigation.navigate('SelectSocialMedia', {
            order,
            prevId: id,
            page: 1,
          });
        }}
      >
        <Text
          style={styles.socialMediaInput}
          numberOfLines={1}
          ellipsizeMode="head"
        >
          {innerTextStyle.width ? profile : ''}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => {
          dispatch(removeSocialMedia(id));
        }}
      >
        <Material name="close" size={DEVICE_LARGE ? 18 : 16} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

const SocialMediaLinks = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const socialMediaItems = useSelector(selectAllSocialMedia);
  const { t } = useTranslation();

  console.log('socialMedia', socialMediaItems);

  const SocialMediaList = socialMediaItems.map((item) => (
    <SocialMediaLink
      key={item.id}
      navigation={navigation}
      dispatch={dispatch}
      {...item}
    />
  ));

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
            color="#2185D0"
          />
        </TouchableOpacity>
      </View>

      {SocialMediaList}

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

export const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const isDrawerOpen = useIsDrawerOpen();

  // selectors
  const id = useSelector((state) => state.user.id);
  const prevPhotoFilename = useSelector((state) => state.user.photo.filename);
  const prevName = useSelector((state) => state.user.name);
  const prevPhoto = useRef(null);
  // state passed down to children
  const [profilePhoto, setProfilePhoto] = useState(prevPhoto?.current);
  const [nextName, setNextName] = useState(prevName);

  // allow user to save changes if profilePhoto or name has changed
  const saveDisabled =
    (prevPhoto.current === profilePhoto && prevName === nextName) ||
    nextName.length < 2;

  // profilePhoto / name is only saved to filesystem / redux if the user presses save
  const saveData = async () => {
    if (nextName.length >= 2) {
      dispatch(setName(nextName));
    }

    if (prevPhoto.current !== profilePhoto) {
      const filename = await saveImage({
        imageName: id,
        base64Image: profilePhoto,
      });
      dispatch(setPhoto({ filename }));
      // reset state to disable save button
      setProfilePhoto('');
    }
  };

  const clearData = useCallback(() => {
    setNextName(prevName);
    setProfilePhoto(prevPhoto?.current);
  }, [prevName, setProfilePhoto, setNextName]);

  // clear data on focus
  useFocusEffect(clearData);

  // convert prevPhoto to base64 uri on focus
  useFocusEffect(
    useCallback(() => {
      if (!profilePhoto) {
        retrieveImage(prevPhotoFilename).then((base64Img) => {
          prevPhoto.current = base64Img;
          setProfilePhoto(base64Img);
        });
      }
    }, [profilePhoto, prevPhotoFilename]),
  );

  useEffect(
    () =>
      navigation.addListener('beforeRemove', (e) => {
        if (saveDisabled) {
          // If we don't have unsaved changes, then we don't need to do anything
          return;
        }

        // Prevent default behavior of leaving the screen
        e.preventDefault();

        // Prompt the user before leaving the screen
        Alert.alert(
          'Discard changes?',
          'You have unsaved changes. Are you sure you want to discard them and leave the screen?',
          [
            { text: "Don't leave", style: 'cancel', onPress: () => {} },
            {
              text: 'Discard',
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ],
        );
      }),
    [navigation, saveDisabled],
  );

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
        <EditProfilePhoto
          profilePhoto={profilePhoto}
          setProfilePhoto={setProfilePhoto}
        />
        <EditName nextName={nextName} setNextName={setNextName} />
        <SocialMediaLinks />
        <ShowEditPassword />
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                opacity: saveDisabled ? 0.5 : 1,
              },
            ]}
            disabled={saveDisabled}
            onPress={saveData}
          >
            <Text style={styles.saveButtonText}>{t('profile.button.save')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                opacity: saveDisabled ? 0.5 : 1,
              },
            ]}
            disabled={saveDisabled}
            onPress={clearData}
          >
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
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 11 : 10,
    color: '#B64B32',
  },
  editNameInput: {
    fontFamily: 'Poppins-Medium',
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
    width: WIDTH - (DEVICE_LARGE ? 80 : 60),
    maxWidth: WIDTH - (DEVICE_LARGE ? 80 : 60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: DEVICE_LARGE ? 10 : 8,
  },
  socialMediaLinkLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  socialMediaSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: DEVICE_LARGE ? 14 : 12,
  },
  socialMediaType: {
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Light',
    fontSize: DEVICE_LARGE ? 14 : 12,
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
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 13 : 11,
    color: '#2185D0',
  },
  displayPassword: {
    fontFamily: 'Poppins-Regular',
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
    fontFamily: 'Poppins-Medium',
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
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
  closeButton: {
    paddingHorizontal: DEVICE_LARGE ? 10 : 8,
    marginRight: DEVICE_LARGE ? -10 : -8,
  },
});

export default EditProfileScreen;
