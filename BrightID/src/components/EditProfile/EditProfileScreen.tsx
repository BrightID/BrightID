import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Image,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { useTranslation } from 'react-i18next';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/stack';
import { useIsDrawerOpen } from '@react-navigation/drawer';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import i18next from 'i18next';
import { useDispatch, useSelector } from '@/store';
import { DEVICE_IOS, DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import {
  BLACK,
  BLUE,
  DARK_BLUE,
  DARK_ORANGE,
  DARKER_GREY,
  GREEN,
  GREY,
  LIGHT_GREY,
  ORANGE,
  WHITE,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { chooseImage, takePhoto } from '@/utils/images';
import { photoDirectory, retrieveImage, saveImage } from '@/utils/filesystem';
import {
  selectSyncSocialMediaEnabled,
  setName,
  setPhoto,
  setSyncSocialMediaEnabled,
} from '@/actions';
import Chevron from '@/components/Icons/Chevron';
import {
  saveSocialMedia,
  selectExistingSocialMedia,
  setProfileDisplayWidth,
} from '../../reducer/socialMediaSlice';
import {
  selectAllSocialMediaVariationsByType,
  selectSocialMediaVariationById,
} from '@/reducer/socialMediaVariationSlice';
import { SocialMediaType } from './socialMediaVariations';
import {
  removeSocialMediaThunk,
  setSyncSocialMediaEnabledThunk,
} from '@/components/EditProfile/socialMediaThunks';
import { getShareWithConnectionsValue } from '@/utils/socialUtils';

const EditProfilePhoto = ({ profilePhoto, setProfilePhoto }) => {
  const { showActionSheetWithOptions } = useActionSheet();
  const prevPhotoFilename = useSelector(
    (state: State) => state.user.photo.filename,
  );
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
          t('common.actionSheet.cancel'),
        ],
        cancelButtonIndex: 2,
        title: t('common.photoActionSheet.title'),
        showSeparators: true,
        textStyle: {
          color: BLUE,
          textAlign: 'center',
          width: '100%',
          fontSize: fontSize[18],
        },
        titleTextStyle: {
          textAlign: 'center',
          fontSize: fontSize[20],
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
            console.log(e);
          }}
          accessible={true}
          accessibilityLabel="profile photo"
        />
        <Text style={styles.profilePhotoText}>
          {t('profile.text.changeProfilePicture')}
        </Text>
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
        placeholderTextColor={DARKER_GREY}
      />
    </View>
  );
};

const SocialMediaLink = (props: {
  socialMedia: SocialMedia;
  type: SocialMediaType;
}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { id, profile, profileDisplayWidth, order } = props.socialMedia;
  const { t } = useTranslation();

  const socialMediaVariation = useSelector((state) =>
    selectSocialMediaVariationById(state, id),
  );
  // perfectly center profile text with max length
  const updateInnerTextLayout = (e: LayoutChangeEvent) => {
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

  const removeSocialMedia = async (id: string) => {
    try {
      await dispatch(removeSocialMediaThunk(id));
    } catch (e) {
      Alert.alert(
        i18next.t('common.alert.error'),
        i18next.t('common.alert.text.commonError'),
      );
    }
  };

  const innerTextStyle = profileDisplayWidth
    ? {
        width:
          typeof profileDisplayWidth === 'number'
            ? profileDisplayWidth - 10
            : profileDisplayWidth,
      }
    : { flexGrow: 1 };

  return (
    <>
      <View style={styles.socialMediaLinkContainer}>
        <TouchableOpacity
          style={styles.socialMediaSelect}
          onPress={() => {
            navigation.navigate('SelectSocialMedia', {
              type: props.type,
              order,
              prevId: id,
              page: 0,
            });
          }}
        >
          <Text style={styles.socialMediaType}>
            {socialMediaVariation.name}
          </Text>
          <Chevron
            width={DEVICE_LARGE ? 14 : 12}
            height={DEVICE_LARGE ? 14 : 12}
            color={DARK_BLUE}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={innerTextStyle}
          onLayout={updateInnerTextLayout}
          onPress={() => {
            navigation.navigate('SelectSocialMedia', {
              type: props.type,
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
          onPress={() => removeSocialMedia(id)}
        >
          <Material name="close" size={DEVICE_LARGE ? 18 : 16} color="#000" />
        </TouchableOpacity>
      </View>
      <View style={styles.syncSocialMediaSwitchContainer}>
        <Text style={styles.label}>Share with connections</Text>
        <CheckBox
          style={styles.syncSocialMediaSwitch}
          tintColors={{ false: GREY, true: ORANGE }}
          onValueChange={(value) => {
            dispatch(
              saveSocialMedia({
                ...props.socialMedia,
                shareWithConnections: !getShareWithConnectionsValue(
                  props.socialMedia,
                ),
              }),
            );
          }}
          value={getShareWithConnectionsValue(props.socialMedia)}
        />
      </View>
    </>
  );
};

const SocialMediaLinks = (props: { type: SocialMediaType }) => {
  const navigation = useNavigation();
  const socialMediaItems = useSelector(selectExistingSocialMedia);
  const selectSocialMediaVariations = useMemo(
    selectAllSocialMediaVariationsByType,
    [],
  );
  const socialMediaVariations = useSelector((state) =>
    selectSocialMediaVariations(state, props.type),
  );
  const socialMediaVariationIds = socialMediaVariations.map((item) => item.id);
  const { t } = useTranslation();

  // console.log('socialMedia', socialMediaItems);

  const SocialMediaVariations = socialMediaItems
    .filter((item) => socialMediaVariationIds.includes(item.id))
    .map((item) => (
      <SocialMediaLink key={item.id} socialMedia={item} type={props.type} />
    ));

  // disable adding new item if we are entering phone number and
  // phone number is already entered
  const disableAdd =
    socialMediaVariations.length === SocialMediaVariations.length;

  return (
    <View style={styles.socialMediaContainer}>
      <View style={styles.socialMediaLinkLabel}>
        {props.type === SocialMediaType.CONTACT_INFO ? (
          <Text style={styles.label}>{t('profile.label.contactInfo')}</Text>
        ) : (
          <Text style={styles.label}>{t('profile.label.socialMediaLink')}</Text>
        )}

        {!disableAdd ? (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SelectSocialMedia', {
                order: socialMediaItems.length,
                type: props.type,
                prevId: null,
                page: 0,
              });
            }}
            style={styles.addSocialMediaBtn}
          >
            <Material
              name="plus-thick"
              size={DEVICE_LARGE ? 18 : 16}
              color={DARK_BLUE}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {SocialMediaVariations}
    </View>
  );
};

const ShowEditPassword = () => {
  const password = useSelector((state: State) => state.user.password);
  const [hidePassword, setHidePassword] = useState(true);
  const navigation = useNavigation();
  const { t } = useTranslation();

  useFocusEffect(
    useCallback(() => {
      setHidePassword(true);
    }, []),
  );

  let displayPassword = password;
  if (hidePassword) {
    displayPassword = '*'.repeat(password.length);
  }

  return (
    <View style={styles.showEditPasswordContainer}>
      <Text style={styles.label}>
        {t('profile.text.backupPasswordTitle', 'Backup password')}
      </Text>
      <View style={styles.passwordInfoContainer}>
        <Text style={styles.infoText}>{t('signup.text.passwordInfo')}</Text>
      </View>
      {password ? (
        <>
          <View style={styles.viewPasswordContainer}>
            <TouchableOpacity
              onPress={() => {
                setHidePassword(!hidePassword);
              }}
            >
              <Text style={styles.passwordText}>
                {t('profile.text.viewPassword')}
              </Text>
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
            <Text style={styles.passwordText}>
              {t('profile.text.changePassword')}
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity
            style={styles.setPasswordButton}
            onPress={() => {
              navigation.navigate('ChangePassword');
            }}
          >
            <Text style={styles.setPasswordText}>
              {t('profile.text.setPassword')}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

function SyncSocialMedia() {
  const dispatch = useDispatch();
  const syncSocialMediaEnabled = useSelector(selectSyncSocialMediaEnabled);
  return (
    <>
      <View style={styles.syncSocialMediaSwitchContainer}>
        <Text style={styles.label}>Sync </Text>
        <CheckBox
          style={styles.syncSocialMediaSwitch}
          tintColors={{ false: GREY, true: ORANGE }}
          onValueChange={(value) => {
            dispatch(setSyncSocialMediaEnabledThunk(value));
          }}
          value={syncSocialMediaEnabled}
        />
      </View>
      <Text style={styles.infoText}>
        Items you add to your profile are encrypted and used anonymously to help
        your contacts see that you're a BrightID user
      </Text>
    </>
  );
}

export const EditProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  let headerHeight = useHeaderHeight();
  if (DEVICE_IOS && DEVICE_LARGE) {
    headerHeight += 7;
  }
  const isDrawerOpen = useIsDrawerOpen();

  // selectors
  const id = useSelector((state: State) => state.user.id);
  const prevPhotoFilename = useSelector(
    (state: State) => state.user.photo.filename,
  );
  const prevName = useSelector((state: State) => state.user.name);
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
          t('profile.alert.title.discardChanges'),
          t('profile.alert.text.discardChanges'),
          [
            {
              text: t('profile.alert.button.dontLeave'),
              style: 'cancel',
              onPress: () => null,
            },
            {
              text: t('profile.alert.button.discard'),
              style: 'destructive',
              onPress: () => navigation.dispatch(e.data.action),
            },
          ],
        );
      }),
    [navigation, saveDisabled, t],
  );

  return (
    <View
      style={[
        styles.container,
        { marginTop: headerHeight },
        !isDrawerOpen && styles.shadow,
      ]}
      testID="editProfileScreen"
    >
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <EditProfilePhoto
          profilePhoto={profilePhoto}
          setProfilePhoto={setProfilePhoto}
        />
        <EditName nextName={nextName} setNextName={setNextName} />

        <SocialMediaLinks type={SocialMediaType.CONTACT_INFO} />
        <SocialMediaLinks type={SocialMediaType.SOCIAL_PROFILE} />
        <SyncSocialMedia />
        <View style={styles.bottomDivider} />

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
            <Text style={styles.saveButtonText}>{t('common.button.save')}</Text>
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
            <Text style={styles.cancelButtonText}>
              {t('common.button.cancel')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: WHITE,
    flex: 1,
    width: '100%',
    borderTopLeftRadius: DEVICE_LARGE ? 50 : 40,
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
    paddingHorizontal: DEVICE_LARGE ? 40 : 30,
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
    fontSize: fontSize[16],
    color: BLUE,
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
    fontSize: fontSize[11],
    color: DARK_ORANGE,
  },
  editNameInput: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    marginTop: DEVICE_LARGE ? 4 : 2,
    width: '100%',
    color: BLACK,
  },
  syncSocialMediaSwitchContainer: {
    alignItems: 'center',
    paddingVertical: 5,
    display: 'flex',
    flexDirection: 'row',
  },
  syncSocialMediaSwitch: {
    flex: 1,
  },
  bottomDivider: {
    width: '100%',
    borderBottomColor: LIGHT_GREY,
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
    fontSize: fontSize[16],
    color: DARK_BLUE,
    marginRight: DEVICE_LARGE ? 8 : 6,
  },
  addSocialMediaBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: DEVICE_LARGE ? 6 : 4,
  },
  socialMediaInput: {
    fontFamily: 'Poppins-Light',
    fontSize: fontSize[14],
    color: BLACK,
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
  setPasswordButton: {
    marginTop: DEVICE_LARGE ? 12 : 8,
    alignSelf: 'center',
  },
  passwordText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[13],
    color: DARK_BLUE,
  },
  setPasswordText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[15],
    color: DARK_BLUE,
  },
  displayPassword: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[13],
    color: BLACK,
  },
  passwordInfoContainer: {},
  infoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[11],
    color: DARKER_GREY,
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
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginRight: DEVICE_LARGE ? 22 : 18,
  },
  saveButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
  },
  cancelButton: {
    width: DEVICE_LARGE ? 100 : 88,
    paddingTop: 10,
    paddingBottom: 9,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARKER_GREY,
  },
  cancelButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
  closeButton: {
    paddingHorizontal: DEVICE_LARGE ? 10 : 8,
    marginRight: DEVICE_LARGE ? -10 : -8,
  },
});

export default EditProfileScreen;
