// @flow

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker, PickerIOS } from '@react-native-picker/picker';
import { BlurView } from '@react-native-community/blur';
import {
  DEVICE_LARGE,
  DEVICE_IOS,
  DEVICE_ANDROID,
  WIDTH,
} from '@/utils/deviceConstants';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import socialMediaList from './socialMediaList';
import { saveSocialMedia, selectSocialMediaById } from './socialMediaSlice';

/** Helper functions */

// value is the social media id, label is the name
const toPickerItem = ([value, { name }]) => (
  <Picker.Item key={value} value={value} label={name} />
);

const socialMediaKeyValues = Object.entries(socialMediaList);

const keyboardTypes = {
  username: 'default',
  'telephone #': 'phone-pad',
  email: 'email-address',
  url: DEVICE_IOS ? 'url' : 'default',
};

const textContentTypes = {
  username: 'username',
  'telephone #': 'telephoneNumber',
  email: 'emailAddress',
  url: 'URL',
};

/** Main Component */

const SelectMediaModal = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const prevId = route.params?.prevId;
  const initialPage = route.params?.page;

  const existingSocialMediaIds = useSelector((state) => state.socialMedia.ids);

  // only display social media not already selected by user when adding a new one to the list
  // or allow the user to switch order if editing the social media from the list
  const socialMediaToDisplay = useMemo(
    () =>
      prevId
        ? socialMediaKeyValues
        : socialMediaKeyValues.filter(
            ([id]) => !existingSocialMediaIds.includes(id),
          ),
    [existingSocialMediaIds, prevId],
  );

  const PickerItems = useMemo(() => socialMediaToDisplay.map(toPickerItem), [
    socialMediaToDisplay,
  ]);

  const defaultItem = socialMediaToDisplay[0] && socialMediaToDisplay[0][0];

  // if the user is clicking on an existing social media, select that first
  // or display the first item in the picker if the user is adding a new social media
  const firstItem = prevId ?? defaultItem;

  // selectedId tracks state of the picker, will always be an id from socialMediaList.js
  const [selectedId, setSelectedId] = useState(firstItem);

  const prevProfile = useSelector((state) =>
    selectSocialMediaById(state, selectedId),
  );

  // social media profile value
  const [profile, setProfile] = useState(prevProfile?.profile ?? '');

  // update profile when modal is re-opened or new profile selected
  useEffect(() => {
    setProfile(prevProfile?.profile ?? '');
  }, [prevProfile]);

  // which page of the modal are we on
  // user can directly start editing profile if they click on their profile
  const [page, setPage] = useState(initialPage ?? 0);

  // refresh state when the modal opens
  useFocusEffect(
    useCallback(() => {
      setSelectedId(firstItem);
    }, [firstItem]),
  );

  const saveProfile = () => {
    const socialMedia = {
      id: selectedId,
      order: route.params?.order ?? 0,
      profile,
    };
    dispatch(saveSocialMedia(socialMedia));
    navigation.navigate('Edit Profile');
  };

  return (
    <View style={styles.container}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={5}
        reducedTransparencyFallbackColor="black"
      />
      <KeyboardAvoidingView style={styles.modalContainer}>
        {page === 0 ? (
          <Picker
            selectedValue={selectedId}
            style={styles.pickerStyle}
            itemStyle={styles.pickerItemStyle}
            onValueChange={(itemValue, itemIndex) => {
              setSelectedId(itemValue);
            }}
          >
            {PickerItems}
          </Picker>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {socialMediaList[selectedId].shareType}
            </Text>
            <TextInput
              style={styles.socialMediaInput}
              autoCapitalize="none"
              autoCompleteType="off"
              autoCorrect={false}
              autoFocus={true}
              blurOnSubmit={true}
              keyboardType={
                keyboardTypes[socialMediaList[selectedId].shareType]
              }
              placeholder={`add ${socialMediaList[selectedId].shareType}`}
              placeholderTextColor="#707070"
              textContentType={
                textContentTypes[socialMediaList[selectedId].shareType]
              }
              onChangeText={setProfile}
              value={profile}
            />
          </View>
        )}
        <View style={styles.saveContainer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              { opacity: page === 1 && profile.length === 0 ? 0.5 : 1 },
            ]}
            onPress={() => {
              page === 1 ? saveProfile() : setPage(1);
            }}
            disabled={page === 1 && profile.length === 0}
          >
            <Text style={styles.saveButtonText}>
              {page === 1 ? 'Save' : 'Next'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              // if initial page is 1, users only want to edit text
              page === 1 && initialPage !== 1
                ? setPage(0)
                : navigation.navigate('Edit Profile');
            }}
          >
            <Text style={styles.cancelButtonText}>
              {page === 1 && initialPage !== 1 ? 'Prev' : 'Cancel'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    width: WIDTH * 0.75,
    borderRadius: 25,
    paddingHorizontal: DEVICE_LARGE ? 36 : 30,
    paddingBottom: DEVICE_LARGE ? 36 : 30,
    paddingTop: DEVICE_ANDROID ? (DEVICE_LARGE ? 36 : 30) : 0,
  },
  pickerStyle: { width: '100%' },
  pickerItemStyle: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 15 : 13,
  },
  saveContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: DEVICE_LARGE ? 18 : 15,
  },
  saveButton: {
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
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
    width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
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
  socialMediaInput: {
    flexGrow: 1,
    fontFamily: 'Poppins-Light',
    fontSize: DEVICE_LARGE ? 14 : 12,
    color: '#000',
  },
  inputContainer: {
    width: '100%',
    paddingTop: DEVICE_IOS ? (DEVICE_LARGE ? 36 : 30) : 0,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 11 : 10,
    color: '#B64B32',
    marginBottom: DEVICE_LARGE ? 5 : 3,
  },
});

export default SelectMediaModal;
