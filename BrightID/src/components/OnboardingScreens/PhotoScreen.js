// @flow

import React, { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { fontSize } from '@/theme/fonts';
import { WHITE, BLACK, DARKER_GREY, ORANGE, BLUE } from '@/theme/colors';
import { DEVICE_LARGE } from '@/utils/deviceConstants';
import { takePhoto, chooseImage } from '@/utils/images';
import { retrieveImage } from '@/utils/filesystem';
import { savePhoto } from './thunks';
import Avatar from '../Icons/Avatar';

/* Description */
/* ======================================== */

/**
 * Initial Onboarding screen of BrightID
 */

/* Onboarding Screen */
/* ======================================== */

export const PhotoScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showActionSheetWithOptions } = useActionSheet();
  const { t } = useTranslation();

  const [finalBase64, setfinalBase64] = useState('');

  const photoFilename = useSelector((state) => state.user.photo.filename);

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

  const handleSubmit = () => {
    dispatch(savePhoto(finalBase64))
      .then(() => {
        navigation.navigate('SignUpPassword');
      })
      .catch((err) => {
        Alert.alert(err.message);
      });
  };

  const disabled = !finalBase64;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={WHITE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} testID="PhotoScreen">
        {!finalBase64 ? (
          <View style={styles.descContainer}>
            <Text style={styles.registerText}>
              {t('signup.text.pleaseAddPhoto')}
            </Text>
          </View>
        ) : null}
        <View style={styles.midContainer}>
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
              <Image style={styles.photo} source={{ uri: finalBase64 }} />
            ) : (
              <Avatar addPicture={true} width={150} height={150} />
            )}
          </TouchableOpacity>
          <Text style={styles.privacyText}>
            {t('signup.text.photoNotShared')}
          </Text>
        </View>
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitBtn, { opacity: disabled ? 0.7 : 1 }]}
            onPress={handleSubmit}
            accessibilityLabel={t('signup.button.submit')}
            disabled={disabled}
            testID="submitPhoto"
          >
            <Text style={styles.submitBtnText}>
              {t('signup.button.submit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 65,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: WHITE,
    borderTopLeftRadius: 58,
    marginTop: -58,
    overflow: 'hidden',
    zIndex: 2,
  },
  descContainer: {
    marginTop: DEVICE_LARGE ? 100 : 85,
  },
  midContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    textAlign: 'center',
    lineHeight: DEVICE_LARGE ? 26 : 24,
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
    fontSize: fontSize[11],
    color: DARKER_GREY,
    textAlign: 'center',
    marginTop: DEVICE_LARGE ? 36 : 30,
    width: '72%',
  },
  submitContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: DEVICE_LARGE ? 85 : 70,
  },
  submitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: DEVICE_LARGE ? 180 : 160,
    height: DEVICE_LARGE ? 50 : 45,
    backgroundColor: ORANGE,
    borderRadius: 100,
    elevation: 1,
    shadowColor: BLACK,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 4,
  },
  submitBtnText: {
    fontFamily: 'Poppins-Bold',
    fontSize: fontSize[16],
    color: WHITE,
  },
});

export default PhotoScreen;
