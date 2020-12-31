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
import { ORANGE, DARKER_GREY, GREEN, WHITE, BLUE } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
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
        backgroundColor={WHITE}
        animated={true}
      />
      <View testID="EulaScreen" style={styles.container} behavior="padding">
        <View style={styles.confirmationButtons}>
          <TouchableOpacity
            testID="rejectEulaBtn"
            style={styles.rejectButton}
            onPress={handleReject}
          >
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="acceptEulaBtn"
            style={styles.acceptButton}
            onPress={handleAccept}
          >
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
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    borderBottomLeftRadius: 58,
    borderBottomRightRadius: 58,
    marginBottom: DEVICE_LARGE ? 22 : 10,
    zIndex: 2,
    overflow: 'hidden',
  },
  orangeBottom: {
    backgroundColor: ORANGE,
    width: '100%',
    height: DEVICE_LARGE ? 100 : 70,
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
    fontSize: fontSize[16],
    marginBottom: DEVICE_LARGE ? 14 : 12.5,
  },
  paragraph: {
    fontFamily: 'Poppins-Regular',
    fontSize: fontSize[12],
  },
  link: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: BLUE,
    marginBottom: fontSize[12],
  },
  confirmationButtons: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    right: 0,
    bottom: 0,
    height: CONFIRMATION_HEIGHT,
    width: WIDTH,
    backgroundColor: WHITE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    width: '33%',
    height: DEVICE_LARGE ? 32 : 29,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    marginLeft: DEVICE_LARGE ? 22 : 18,
  },
  acceptButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
  },
  rejectButton: {
    width: '33%',
    height: DEVICE_LARGE ? 32 : 29,

    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DARKER_GREY,
  },
  rejectButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[12],
    color: DARKER_GREY,
  },
});

export default Eula;
