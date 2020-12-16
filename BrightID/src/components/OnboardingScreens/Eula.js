// @flow

import React from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { ORANGE } from '@/utils/constants';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { setEula } from '@/actions';
import L from './License.json';

export const Eula = ({ navigation }) => {
  const dispatch = useDispatch();
  const handleReject = () => {
    Alert.alert(
      'Oh No!',
      'You cannot use this app without first accepting the terms and conditions.',
    );
  };

  const handleAccept = () => {
    dispatch(setEula(true));
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#fff"
        animated={true}
      />
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
          </Text>
        </ScrollView>
      </View>
      <View style={styles.orangeBottom} />
    </>
  );
};

const CONFIRMATION_HEIGHT = DEVICE_LARGE ? 60 : 55;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    marginBottom: 10,
    zIndex: 2,
    overflow: 'hidden',
  },
  orangeBottom: {
    backgroundColor: ORANGE,
    width: '100%',
    height: 70,
    zIndex: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollViewContent: {
    paddingHorizontal: DEVICE_LARGE ? 20 : 18,
    paddingTop: 30,
    paddingBottom: CONFIRMATION_HEIGHT,
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
    height: CONFIRMATION_HEIGHT,
    width: WIDTH,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    width: '33%',
    height: DEVICE_LARGE ? 32 : 29,

    backgroundColor: '#5DEC9A',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: DEVICE_LARGE ? 22 : 18,
  },
  acceptButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
  },
  rejectButton: {
    width: '33%',
    height: DEVICE_LARGE ? 32 : 29,

    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#707070',
  },
  rejectButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: DEVICE_LARGE ? 12 : 10,
    color: '#707070',
  },
});

export default Eula;
