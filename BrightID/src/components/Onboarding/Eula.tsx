import React from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { useDispatch } from '@/store/hooks';
import { WHITE, BLUE, SUCCESS, GRAY1 } from '@/theme/colors';
import { fontSize } from '@/theme/fonts';
import { DEVICE_LARGE, WIDTH } from '@/utils/deviceConstants';
import { setEula } from '@/actions';
import L from './License.json';
import LinearLeftToRightArrow from '../Icons/LinearArrowLeftToRight';

export const Eula = () => {
  const dispatch = useDispatch();

  const handleAccept = () => {
    dispatch(setEula(true));
  };

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={GRAY1}
        animated={true}
      />
      <View testID="EulaScreen" style={styles.container}>
        <View>
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

          <View style={styles.confirmationButton}>
            <TouchableOpacity
              testID="acceptEulaBtn"
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Text style={styles.acceptButtonText}>{'Agree'}</Text>
              <LinearLeftToRightArrow />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    zIndex: 2,
    overflow: 'hidden',
  },
  scrollViewContent: {
    paddingHorizontal: DEVICE_LARGE ? 20 : 18,
    paddingTop: 30,
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
  confirmationButton: {
    position: 'relative',
    zIndex: 10,
    left: 0,
    right: 0,
    bottom: 0,
    width: WIDTH,
    backgroundColor: 'WHITE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 108,
    paddingLeft: 20,
    paddingRight: 20,
  },
  acceptButton: {
    height: 52,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: SUCCESS,
    width: '100%',
    flexDirection: 'row',
  },
  acceptButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: fontSize[16],
    color: SUCCESS,
    marginRight: 12,
  },
});

export default Eula;
