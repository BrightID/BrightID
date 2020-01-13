// @flow

import * as React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import RNFS from 'react-native-fs';
import Material from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import VerificationSticker from './Verifications/VerificationSticker';
import BottomNav from './BottomNav';
import store from '../store';
import { resetStore } from '../actions';
import { getNotifications } from '../actions/notifications';

/**
 * Home screen of BrightID
 * ==========================
 */

export class HomeScreen extends React.Component<Props> {
  static navigationOptions = ({ navigation }: { navigation: navigation }) => ({
    title: 'BrightID',
    headerBackTitle: 'Home',
    headerRight: () => (
      <TouchableOpacity
        style={{ marginRight: 11 }}
        onPress={() => {
          if (__DEV__) {
            Alert.alert(
              'WARNING',
              'Would you like to delete user data and return to the onboarding screen?',
              [
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
                {
                  text: 'Sure',
                  onPress: async () => {
                    try {
                      navigation.navigate('Onboarding');
                      await AsyncStorage.flushGetRequests();
                      await AsyncStorage.clear();
                      store.dispatch(resetStore());
                    } catch (err) {
                      console.log(err);
                    }
                  },
                },
              ],
              { cancelable: true },
            );
          }
        }}
      >
        <Material size={32} name="dots-horizontal" color="#fff" />
      </TouchableOpacity>
    ),
    headerLeft: () => (
      <TouchableOpacity style={{ marginLeft: 11 }} onPress={() => {}}>
        <SimpleLineIcons name="question" size={32} color="#fff" />
      </TouchableOpacity>
    ),
  });

  componentDidMount() {
    const { navigation, dispatch } = this.props;
    navigation.addListener('willFocus', () => {
      dispatch(getNotifications());
    });
  }

  render() {
    const {
      navigation,
      name,
      score,
      groupsCount,
      photo,
      connections,
      verifications,
    } = this.props;

    return (
      <View style={styles.container}>
        <View style={styles.mainContainer}>
          <View style={styles.photoContainer}>
            <Image
              source={{
                uri: `file://${RNFS.DocumentDirectoryPath}/photos/${photo.filename}`,
              }}
              style={styles.photo}
              resizeMode="cover"
              onError={(e) => {
                console.log(e.error);
              }}
              accessible={true}
              accessibilityLabel="user photo"
            />
            <Text id="name" style={styles.name}>
              {name}
            </Text>
          </View>

          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLeft}>Score:</Text>
            <Text id="score" style={styles.scoreRight}>
              {score}
            </Text>
          </View>

          <View style={styles.countsContainer}>
            <View style={styles.countsGroup}>
              <Text id="connectionsCount" style={styles.countsNumberText}>
                {connections.length}
              </Text>
              <Text style={styles.countsDescriptionText}>Connections</Text>
            </View>
            <View style={styles.countsGroup}>
              <Text id="groupsCount" style={styles.countsNumberText}>
                {groupsCount}
              </Text>
              <Text style={styles.countsDescriptionText}>Groups</Text>
            </View>
          </View>

          <View style={styles.verificationsContainer}>
            {verifications.map((name) => (
              <VerificationSticker name={name} key={name} />
            ))}
          </View>

          <View style={styles.connectContainer}>
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => {
                navigation.navigate('NewConnection');
              }}
              accessible={true}
              accessibilityLabel="Connect"
            >
              <Material name="qrcode-scan" size={26} color="#fff" />
              <Text style={styles.connectText}>New Connection</Text>
            </TouchableOpacity>
          </View>
        </View>

        <BottomNav navigation={navigation} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  photoContainer: {
    marginTop: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photo: {
    width: 142,
    height: 142,
    borderRadius: 71,
    shadowColor: 'rgba(0, 0, 0, 0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  name: {
    fontFamily: 'ApexNew-Book',
    fontSize: 30,
    marginTop: 8,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    color: '#000000',
    textShadowColor: 'rgba(0, 0, 0, 0.32)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  verificationsContainer: {
    height: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginTop: 10,
    marginBottom: 10,
    width: '100%',
  },
  verificationSticker: {},
  connectContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 17,
    flexDirection: 'row',
  },
  scoreContainer: {
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    width: '80%',
    marginTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreLeft: {
    fontFamily: 'ApexNew-Book',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#9b9b9b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    paddingTop: 3.5,
  },
  scoreRight: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'center',
    color: '#139c60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countsContainer: {
    justifyContent: 'space-evenly',
    flexDirection: 'row',
    width: '80%',
    marginTop: 12,
    borderBottomColor: '#e3e1e1',
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  countsDescriptionText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsNumberText: {
    fontFamily: 'ApexNew-Book',
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
  },
  countsGroup: {
    flex: 1,
  },
  connectButton: {
    height: 65,
    paddingTop: 13,
    paddingBottom: 12,
    width: '80%',
    borderRadius: 6,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 20, height: 20 },
    shadowRadius: 20,
    elevation: 1,
  },
  connectText: {
    fontFamily: 'ApexNew-Medium',
    fontSize: 22,
    color: '#fff',
    marginLeft: 18,
  },
});

export default connect((state) => state)(HomeScreen);
