// @flow

import React, { useRef, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { setEula } from '@/actions';
import L from './License.json';

export const Eula = ({ navigation }) => {
  const dispatch = useDispatch();

  const { t } = useTranslation();

  const handleReject = () => {
    Alert.alert(
      'Oh No!',
      'You cannot use this app without first accepting the terms and conditions.',
      [],
      { cancelable: false },
    );
  };

  const handleAccept = () => {
    dispatch(setEula(true));
  };

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={ORANGE}
        animated={true}
      />
      <View style={styles.orangeTop} />
      <View style={styles.container} behavior="padding">
        <View style={styles.confirmationButtons}>
          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.header}>{L.title}</Text>
          <Text style={styles.paragraph}>{L.intro}</Text>
          <Text style={styles.header}>{L['header.parties']}</Text>
          <Text style={styles.paragraph}>{L['text.parties']}</Text>
          <Text style={styles.header}>{L['header.privacy']}</Text>
          <Text style={styles.paragraph}>{L['text.privacy']}</Text>
          <Text style={styles.link}>{L['link.privacy']}</Text>
          <Text style={styles.header}>{L['header.content']}</Text>
          <Text style={styles.paragraph}>{L['text.content']}</Text>
          <Text style={styles.header}>{L['header.conduct']}</Text>
          <Text style={styles.paragraph}>{L['text.conduct']}</Text>
          <Text style={styles.header}>{L['header.license']}</Text>
          <Text style={styles.paragraph}>{L['text.license']}</Text>
          <Text style={styles.header}>BrightID Contact</Text>
          <Text style={styles.paragraph}>
            This is the website for BrightID{' '}
            <Text style={styles.link}>https://www.brightid.org</Text>
          </Text>
          <Text style={styles.paragraph}>
            We can be reached via e-mail at{' '}
            <Text style={styles.link}>support@brightid.org</Text>
            {'\n\n'}
          </Text>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  orangeTop: {
    backgroundColor: ORANGE,
    height: DEVICE_LARGE ? 70 : 60,
    width: '100%',
    zIndex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderTopLeftRadius: 58,
    marginTop: -58,
    zIndex: 2,
    overflow: 'hidden',
  },
  scrollViewContent: {
    paddingHorizontal: DEVICE_LARGE ? 20 : 18,
    paddingVertical: 30,
  },
  header: {
    fontFamily: 'Poppins-Bold',
    fontSize: DEVICE_LARGE ? 16 : 14,
    marginBottom: DEVICE_LARGE ? 14 : 12.5,
  },
  paragraph: {
    fontFamily: 'Poppins-Regular',
    fontSize: DEVICE_LARGE ? 12 : 11,
  },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 11,
    color: '#2185D0',
    marginBottom: DEVICE_LARGE ? 12 : 11,
  },
  confirmationButtons: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    right: 0,
    bottom: 0,
    height: DEVICE_LARGE ? 50 : 45,
    width: WIDTH,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    // borderTopWidth: 1,
    // borderTopColor: '#A8A8A8',
  },
  acceptButton: {
    // width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    width: '50%',
    height: '100%',
    backgroundColor: '#5DEC9A',
    alignItems: 'center',
    justifyContent: 'center',
    // borderRadius: 20,
    // marginRight: DEVICE_LARGE ? 22 : 18,
  },
  acceptButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
  rejectButton: {
    // width: DEVICE_LARGE ? 92 : 80,
    paddingTop: 8,
    paddingBottom: 7,
    width: '50%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // borderRadius: 20,
    // borderWidth: 1,
    // borderColor: '#707070',
  },
  rejectButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
});

export default Eula;
