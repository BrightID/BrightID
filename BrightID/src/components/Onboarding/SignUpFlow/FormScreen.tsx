import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import {
  WHITE,
  BLACK,
  BLUE,
  PRIMARY,
  GRAY7,
  GRAY6,
  GRAY4,
  ERROR,
  GRAY8,
  GRAY9,
  GRAY1,
} from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import AvatarRedesigned from '@/components/Icons/AvatarRedesigned';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import Eye from '@/components/Icons/Eye';
import EyeOff from '@/components/Icons/EyeOff';
import { useDispatch, useSelector } from '@/store/hooks';

import { takePhoto, chooseImage } from '@/utils/images';
import { retrieveImage } from '@/utils/filesystem';
import { savePhoto } from './thunks';
import PencilCircle from '@/components/Icons/PencilCircle';
import { setPassword as setUserPassword, setName } from '@/actions';
import NewInfo from '@/components/Icons/NewInfo';
import Info from '@/components/Icons/Info';

const PASSWORD_LENGTH = 8;

export const FormScreen = () => {
  const { t } = useTranslation();
  const passwordInput = useRef(null);
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [nameErrors, setNameErrors] = useState([]);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const name = useSelector((state) => state.user.name);
  const [displayName, setDisplayName] = useState(name);

  const [finalBase64, setfinalBase64] = useState('');
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showActionSheetWithOptions } = useActionSheet();

  const photoFilename = useSelector((state) => state.user.photo.filename);

  const handleFocus = (setFocus: Function) => {
    setFocus(true);
  };
  const handleBlur = (setBlur: Function) => {
    setBlur(false);
  };
  const handleEyeClick = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  useFocusEffect(
    useCallback(() => {
      if (photoFilename) {
        retrieveImage(photoFilename).then(setfinalBase64);
      }
    }, [photoFilename]),
  );

  const getPhotoFromCamera = async () => {
    try {
      const { mime, data } = await takePhoto();
      const uri = `data:${mime};base64,${data}`;
      setfinalBase64(uri);
    } catch (err) {
      console.log(err.message);
    }
  };

  const getPhotoFromLibrary = async () => {
    try {
      const { mime, data } = await chooseImage();
      const uri = `data:${mime};base64,${data}`;
      setfinalBase64(uri);
    } catch (err) {
      console.log(err.message);
    }
  };

  const handleAddPhoto = () => {
    showActionSheetWithOptions(
      {
        options: [
          t('common.photoActionSheet.takePhoto'),
          t('common.photoActionSheet.choosePhoto'),
          // t('common.actionSheet.cancel'),
        ],
        cancelButtonIndex: 3,
        title: t('common.photoActionSheet.title'),
        showSeparators: true,
        containerStyle: {
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          paddingBottom: 20,
        },
        textStyle: {
          color: GRAY9,
          textAlign: 'left',
          width: '100%',
          fontSize: fontSize[14],
          fontFamily: 'Poppins-Medium',
          paddingLeft: 12,
        },
        titleTextStyle: {
          textAlign: 'center',
          color: GRAY9,
          fontFamily: 'Poppins-Bold',
          fontSize: fontSize[16],

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

  const handleSubmit = () => {
    if (displayName)
      dispatch(savePhoto(finalBase64))
        .then(() => {
          dispatch(setName(displayName));
          dispatch(setUserPassword(password));
          navigation.navigate('OnboardSuccess' as never);
        })
        .catch((err) => {
          Alert.alert(err.message);
        });
  };

  const nameOnChange = (text: string) => {
    const forbidenCharacters = ['@', '.', '%', '$'];
    let flag = false;
    forbidenCharacters.forEach((character) => {
      if (text.includes(character)) {
        setNameErrors(["You can't use @, ., % and $ in your name!"]);
        flag = true;
      }
    });
    if (!flag) {
      setNameErrors([]);
    }
    setDisplayName(text);
  };

  const passwordOnChange = (text: string) => {
    if (text.length != 0 && text.length < PASSWORD_LENGTH) {
      setPasswordErrors([`Password must be ${PASSWORD_LENGTH} characters`]);
    } else {
      setPasswordErrors(['']);
    }
    setPassword(text);
  };

  const submitDisabled =
    passwordErrors[0] ||
    nameErrors[0] ||
    displayName.length < 2 ||
    !finalBase64;

  return (
    <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: WHITE }}>
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={GRAY1}
          animated={true}
        />

        <View style={styles.AvatarContainer}>
          <TouchableOpacity
            testID="addPhoto"
            onPress={handleAddPhoto}
            accessible={true}
            accessibilityLabel={t(
              `common.accessibilityLabel.${
                finalBase64 ? 'editPhoto' : 'addPhoto'
              }`,
            )}
          >
            {finalBase64 ? (
              <>
                <Image style={styles.photo} source={{ uri: finalBase64 }} />
                <View style={{ position: 'absolute', bottom: 2, right: 2 }}>
                  <PencilCircle />
                </View>
              </>
            ) : (
              // <Avatar addPicture={true} width={150} height={150} />
              <AvatarRedesigned width={150} height={150} />
            )}
          </TouchableOpacity>

          <Text style={styles.privacyText}>
            {t('signup.text.nameAndPhotoNotShared')}
          </Text>
        </View>

        <View style={styles.midContainer}>
          <View style={styles.inputContainer}>
            {nameFocus ? (
              <View style={styles.inputsUpperTextContainer}>
                <Text style={styles.inputsUpperText}>
                  {t('signup.placeholder.newName')}
                </Text>
              </View>
            ) : null}

            <TextInput
              testID="editName"
              onChangeText={nameOnChange}
              value={displayName}
              placeholder={t('signup.placeholder.newName')}
              placeholderTextColor={nameFocus ? GRAY4 : GRAY6}
              style={[
                nameFocus ? styles.focusedTextInput : styles.textInput,
                nameErrors[0] ? { borderColor: ERROR } : {},
              ]}
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="name"
              underlineColorAndroid="transparent"
              blurOnSubmit={true}
              textAlign="left"
              onFocus={() => handleFocus(setNameFocus)}
              onBlur={() => handleBlur(setNameFocus)}
              autoFocus={false}
            />
          </View>
          {nameErrors[0] ? (
            <Text style={styles.errorText}>{nameErrors[0]}</Text>
          ) : null}
          <View style={styles.verticalSpace} />

          <View style={styles.inputContainer}>
            {passwordFocus ? (
              <View style={styles.inputsUpperTextContainer}>
                <Text style={styles.inputsUpperText}>
                  {t('signup.placeholder.newPassword')}
                </Text>
              </View>
            ) : null}

            <TextInput
              autoComplete="password"
              autoCorrect={false}
              secureTextEntry={secureTextEntry}
              style={[
                passwordFocus ? styles.focusedTextInput : styles.textInput,
                passwordErrors[0] ? { borderColor: ERROR } : {},
              ]}
              textContentType="password" // passwordrules="minlength: 16; required: lower; required: upper; required: digit; required: [-];"
              underlineColorAndroid="transparent"
              testID="password"
              onChangeText={passwordOnChange}
              value={password}
              placeholder={t('signup.placeholder.newPassword')}
              placeholderTextColor={nameFocus ? GRAY4 : GRAY6}
              blurOnSubmit={true}
              ref={passwordInput}
              onFocus={() => handleFocus(setPasswordFocus)}
              onBlur={() => handleBlur(setPasswordFocus)}
            />

            <View style={styles.inputIconContainer}>
              <TouchableOpacity onPress={handleEyeClick}>
                {secureTextEntry ? (
                  <EyeOff color={GRAY9} />
                ) : (
                  <Eye color={GRAY9} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {passwordErrors[0] ? (
            <Text style={styles.errorText}>{passwordErrors[0]}</Text>
          ) : null}

          <View style={styles.verticalSpace} />

          {/* <Info /> */}
          <View style={{ flexDirection: 'row' }}>
            <NewInfo />
            <Text style={styles.passwordInfoStyle}>
              {t('signup.text.passwordInfo')}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          testID="submitBtn"
          style={[
            styles.submitBtn,
            submitDisabled ? { opacity: 0.7 } : { opacity: 1 },
          ]}
          onPress={handleSubmit}
          disabled={submitDisabled}
        >
          <Text style={styles.submitBtnText}>Submit</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  verticalSpace: {
    height: 24,
  },

  inputIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    marginBottom: 20,
    width: 24,
    height: 24,
    marginRight: 20,
    backgroundColor: '#FFF',
    zIndex: 20,
  },

  inputsUpperTextContainer: {
    position: 'relative',
    left: '5%',
    top: '10%',
    paddingLeft: 4,
    paddingRight: 4,
    backgroundColor: '#FFF',
    zIndex: 20,
    alignSelf: 'flex-start',
  },
  inputsUpperText: {
    color: GRAY8,
    fontSize: fontSize[12],
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexDirection: 'column',
    zIndex: 2,
    paddingLeft: 20,
    paddingRight: 20,
    // todo i should take a better aproach for this instead of hard coding the size
    minHeight: 750,
  },
  headerContainer: {
    height: '7%',
  },
  headerText: {
    fontSize: fontSize[16],
  },
  submitBtn: {
    backgroundColor: PRIMARY,
    height: 52,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  submitBtnText: {
    fontFamily: 'Poppins-Bold',
    color: WHITE,
    fontSize: fontSize[16],
    fontWeight: '600',
  },
  AvatarContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: 26,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  privacyText: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: GRAY7,
    textAlign: 'center',
    marginTop: '15%',
  },
  inputContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  focusedTextInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    // todo What will be the text color here?
    color: GRAY9,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: GRAY8,
    width: '100%',
    textAlign: 'left',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
  },
  textInput: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[14],
    color: GRAY9,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: GRAY4,
    width: '100%',
    textAlign: 'left',
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 20,
  },
  errorText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: ERROR,
    marginTop: 3,
    alignSelf: 'flex-start',
    marginLeft: 12,
  },
  midContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 140,
  },
  passwordInfoStyle: {
    marginLeft: 1,
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
    color: GRAY8,
    textAlign: 'center',
  },
});

export default FormScreen;
