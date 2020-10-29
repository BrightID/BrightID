// @flow

import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Picker, PickerIOS } from '@react-native-picker/picker';
import { BlurView } from '@react-native-community/blur';

import { DEVICE_LARGE, DEVICE_ANDROID, BACKUP_URL } from '@/utils/constants';
import { useDispatch, useSelector } from 'react-redux';
import { compose, map, toPairs } from 'ramda';
import { useFocusEffect } from '@react-navigation/native';
import socialMediaList from './socialMediaList';
import { addSocialMedia, updateOrder } from './socialMediaSlice';

/** Helper functions */

const toPickerItem = ([value, label]) => (
  <Picker.Item key={value} value={value} label={label} />
);

const toPickerItemList = compose(map(toPickerItem), toPairs);

const PickerItems = toPickerItemList(socialMediaList);

// make sure this is up to date
const defaultItem = 'd750bd42-e2d3-465f-a3fd-40fde0080022';

/** Main Component */

const SelectMediaModal = ({ route, navigation }) => {
  const dispatch = useDispatch();
  const firstItem = route.params?.currentValue ?? defaultItem;
  const [selectedValue, setSelectedValue] = useState(firstItem);

  useFocusEffect(
    useCallback(() => {
      setSelectedValue(firstItem);
    }, [firstItem]),
  );

  const saveSelection = () => {
    const socialMedia = {
      id: selectedValue,
      name: socialMediaList[selectedValue],
      order: route.params?.order ?? 0,
    };
    dispatch(addSocialMedia(socialMedia));
  };

  return (
    <BlurView
      style={[styles.container]}
      blurType="dark"
      blurAmount={5}
      reducedTransparencyFallbackColor="black"
    >
      <View style={styles.modalContainer}>
        <Picker
          selectedValue={selectedValue}
          style={styles.pickerStyle}
          itemStyle={styles.pickerItemStyle}
          onValueChange={(itemValue, itemIndex) => {
            setSelectedValue(itemValue);
          }}
        >
          {PickerItems}
        </Picker>
        <View style={styles.saveContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={saveSelection}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              navigation.navigate('Edit Profile');
            }}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  modalContainer: {
    backgroundColor: '#fff',
    width: '75%',
    borderRadius: 25,
    paddingHorizontal: DEVICE_LARGE ? 36 : 30,
    paddingBottom: DEVICE_LARGE ? 36 : 30,
  },
  pickerStyle: { width: '100%' },
  pickerItemStyle: {
    fontFamily: 'Poppins',
    fontWeight: '500',
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
    fontFamily: 'Poppins',
    fontWeight: '500',
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
    fontFamily: 'Poppins',
    fontWeight: '500',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
});

export default SelectMediaModal;
